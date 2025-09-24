import { NextRequest } from "next/server";
import { json, badRequest } from "../_utils";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, hasCloudinary } from "@/lib/cloudinary";

/**
 * Generator API: accepts either a base64/file buffer or generates via Replicate,
 * then uploads the resulting image to Cloudinary via unsigned upload and returns the secure_url.
 *
 * Request (JSON):
 * - prompt?: string
 * - imageBase64?: string (data URL or raw base64)
 *
 * Response (JSON):
 * - { url: string } on success, otherwise { error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON");

    const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : "";
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    // Use web-friendly binary types to avoid Node Buffer types in FormData/Blob.
    let bytes: Uint8Array | null = null;
    let mime: string | undefined;

    // If a base64 image is provided, prefer uploading that directly.
    if (imageBase64) {
      // Extract mime if it's a data URL
      const dataUrlMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/i);
      let base64: string;
      if (dataUrlMatch) {
        mime = dataUrlMatch[1] || undefined;
        base64 = dataUrlMatch[2] || "";
      } else {
        base64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
      }

      try {
        // Convert base64 to Uint8Array without relying on Buffer as the BlobPart
        if (typeof atob === "function") {
          const bin = atob(base64);
          const len = bin.length;
          const arr = new Uint8Array(len);
          for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
          bytes = arr;
        } else {
          // Fallback in Node environments
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const nodeBuf: any = Buffer.from(base64, "base64");
          bytes = new Uint8Array(nodeBuf.buffer, nodeBuf.byteOffset, nodeBuf.byteLength);
        }
      } catch {
        return badRequest("Invalid base64 image data");
      }
    }

    // Otherwise, generate an image via Replicate using the prompt.
    if (!bytes) {
      if (!prompt) return badRequest("Missing prompt");

      const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || "";
      const REPLICATE_SDXL_VERSION =
        process.env.REPLICATE_SDXL_VERSION ||
        process.env.MODEL_VERSION || // fallback to any existing env used previously
        "";

      if (!REPLICATE_API_TOKEN) {
        return json({ error: "Missing REPLICATE_API_TOKEN" }, 500);
      }
      if (!REPLICATE_SDXL_VERSION) {
        return json({ error: "Missing REPLICATE_SDXL_VERSION (Replicate model version id)" }, 500);
      }

      // 1) Create prediction
      const createRes = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version: REPLICATE_SDXL_VERSION,
          input: { prompt },
        }),
        cache: "no-store",
      });

      if (!createRes.ok) {
        const text = await createRes.text().catch(() => "");
        return json({ error: `Replicate create failed (${createRes.status}): ${text || createRes.statusText}` }, 502);
      }

      const created: any = await createRes.json();
      const id = created?.id;
      if (!id) {
        return json({ error: "Replicate response missing id" }, 502);
      }

      // 2) Poll prediction until completion
      let status = created?.status || "starting";
      let output: any = created?.output;
      const startedAt = Date.now();
      const timeoutMs = 120_000; // 2 minutes
      let delay = 1000;

      while (!["succeeded", "failed", "canceled"].includes(status)) {
        if (Date.now() - startedAt > timeoutMs) {
          return json({ error: "Replicate polling timed out" }, 504);
        }
        await sleep(delay);
        delay = Math.min(5000, Math.round(delay * 1.4));

        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
          headers: {
            Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          },
          cache: "no-store",
        });
        if (!pollRes.ok) {
          const text = await pollRes.text().catch(() => "");
          return json({ error: `Replicate poll failed (${pollRes.status}): ${text || pollRes.statusText}` }, 502);
        }
        const polled: any = await pollRes.json();
        status = polled?.status || status;
        output = polled?.output ?? output;
      }

      if (status !== "succeeded") {
        const errMsg = created?.error || "Generation failed";
        return json({ error: typeof errMsg === "string" ? errMsg : "Generation failed" }, 502);
      }

      // 3) Extract first image URL from output
      let imageUrl: string | undefined;
      if (Array.isArray(output) && output.length) {
        imageUrl = String(output[0]);
      } else if (output && typeof output === "object" && (output as any).image) {
        imageUrl = String((output as any).image);
      }

      if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
        return json({ error: "No image URL returned from Replicate" }, 502);
      }

      // 4) Download image
      const imgRes = await fetch(imageUrl, { cache: "no-store" });
      if (!imgRes.ok) {
        const text = await imgRes.text().catch(() => "");
        return json({ error: `Failed to download generated image (${imgRes.status}): ${text || imgRes.statusText}` }, 502);
      }
      const arrayBuf = await imgRes.arrayBuffer();
      bytes = new Uint8Array(arrayBuf);
      mime = imgRes.headers.get("content-type") || undefined;
    }

    // Upload to Cloudinary via unsigned upload (no SDK, direct fetch)
    if (!hasCloudinary()) {
      return json({ error: "Cloudinary is not configured" }, 500);
    }

    const form = new FormData();

    // Convert Uint8Array to ArrayBuffer slice for BlobPart to avoid TS mismatch.
    const arrayBuffer = bytes!.buffer.slice(
      bytes!.byteOffset,
      bytes!.byteOffset + bytes!.byteLength
    );
    const blob = new Blob([arrayBuffer], { type: mime || "image/png" });
    // Provide a default filename; Cloudinary will infer/keep format.
    form.append("file", blob, "image.png");
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
      method: "POST",
      body: form,
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text().catch(() => "");
      return json({ error: `Cloudinary upload failed (${uploadRes.status}): ${text || uploadRes.statusText}` }, 502);
    }

    const uploaded: any = await uploadRes.json();
    const secureUrl = uploaded?.secure_url as string | undefined;

    if (!secureUrl) {
      return json({ error: "Cloudinary upload failed" }, 502);
    }

    return json({ url: secureUrl }, 200);
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Unexpected error";
    return json({ error: message }, 500);
  }
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}