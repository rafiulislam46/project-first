import { NextRequest } from "next/server";
import { json, badRequest } from "../_utils";
import { uploadImageBuffer } from "@/lib/cloudinary";

/**
 * Image generation via Replicate (Stable Diffusion XL) + Cloudinary upload
 * POST { prompt: string }
 * Returns { url: string } or { error: string }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
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
    // Avoid Next.js caching for server fetch
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
    // modest backoff
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
  } else if (output && typeof output === "object" && output.image) {
    imageUrl = String(output.image);
  }

  if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
    return json({ error: "No image URL returned from Replicate" }, 502);
  }

  // 4) Download image and upload to Cloudinary
  const imgRes = await fetch(imageUrl, { cache: "no-store" });
  if (!imgRes.ok) {
    const text = await imgRes.text().catch(() => "");
    return json({ error: `Failed to download generated image (${imgRes.status}): ${text || imgRes.statusText}` }, 502);
  }
  const contentType = imgRes.headers.get("content-type") || "";
  const formatHint =
    contentType.includes("png") ? "png" :
    contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" :
    contentType.includes("webp") ? "webp" :
    "png";
  const arrayBuf = await imgRes.arrayBuffer();
  const buf = Buffer.from(arrayBuf);

  const secureUrl = await uploadImageBuffer(buf, {
    folder: "replicate",
    tags: ["replicate", "sdxl"],
    formatHint: formatHint as any,
  }).catch((e) => {
    return "";
  });

  if (!secureUrl) {
    return json({ error: "Cloudinary upload failed" }, 502);
  }

  return json({ url: secureUrl }, 200);
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}