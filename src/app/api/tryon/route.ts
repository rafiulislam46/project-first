import { NextResponse } from "next/server";
import { MODE } from "@/lib/config";
import { generateTryOnImages } from "./provider";

interface TryOnBody {
  human_img?: string;
  garm_img?: string;
  productImageUrl?: string;
  imageUrl?: string;
  prompt?: string;
}

/**
 * POST /api/tryon
 * - If { human_img, garm_img } present: call Replicate idm-vton, wait for completion, and return:
 *   { url: "https://..." } or { images: ["https://...", ...] }
 * - Else: use existing generator and return { images: [...] }
 * - Errors: return { error: "message" } with appropriate status.
 */
export async function POST(req: Request) {
  try {
    const body: TryOnBody = (await req.json().catch(() => null)) || {};

    // Replicate Virtual Try-On path (idm-vton)
    if (typeof body.human_img === "string" && typeof body.garm_img === "string") {
      const token = process.env.REPLICATE_API_TOKEN;
      if (!token) {
        return NextResponse.json({ error: "Missing REPLICATE_API_TOKEN on server" }, { status: 500 });
      }

      // If version hash not provided via env, use a reasonable default known working for idm-vton
      const version =
        String(process.env.REPLICATE_MODEL_VERSION || "0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985");

      // Create prediction
      const createRes = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          version,
          input: {
            human_img: body.human_img,
            garm_img: body.garm_img,
            garment_des: "virtual try-on",
            category: "upper_body",
          },
        }),
      });

      if (!createRes.ok) {
        const text = await createRes.text().catch(() => "");
        return NextResponse.json(
          { error: `replicate create failed ${createRes.status}: ${text || createRes.statusText}` },
          { status: 502 }
        );
      }

      const created = (await createRes.json()) as { id?: string };
      const id = created?.id;
      if (!id) {
        return NextResponse.json({ error: "replicate: missing prediction id" }, { status: 502 });
      }

      // Poll until completion
      for (;;) {
        await new Promise((r) => setTimeout(r, 1200));
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
          headers: { Authorization: `Token ${token}` },
          cache: "no-store",
        });

        if (!pollRes.ok) {
          const text = await pollRes.text().catch(() => "");
          return NextResponse.json(
            { error: `replicate poll failed ${pollRes.status}: ${text || pollRes.statusText}` },
            { status: 502 }
          );
        }

        const data = (await pollRes.json()) as any;
        const status = data?.status;
        if (status === "succeeded") {
          const out = data?.output;
          const urls: string[] = Array.isArray(out)
            ? out.filter((x: any) => typeof x === "string")
            : typeof out === "string"
            ? [out]
            : [];
          if (urls.length === 0) {
            return NextResponse.json({ error: "replicate: empty output" }, { status: 502 });
          }
          if (urls.length === 1) {
            return NextResponse.json({ url: urls[0] });
          }
          return NextResponse.json({ images: urls });
        }
        if (status === "failed" || status === "canceled") {
          return NextResponse.json({ error: `replicate: ${status}` }, { status: 502 });
        }
        // continue polling for starting/processing/queued
      }
    }

    // Legacy generator path: returns styled images array
    const productImageUrl: string | undefined = body.productImageUrl || body.imageUrl;
    const prompt: string | undefined = body.prompt;

    if (!productImageUrl) {
      // Mock/demo images
      const base = "/demo/tryon";
      const demo = [1, 2, 3, 4, 5].map((i) => `${base}/${i}.svg`);
      return NextResponse.json({ images: demo, mode: MODE });
    }

    const uploadFlag = String(process.env.UPLOAD_TO_CLOUDINARY || "1") !== "0";
    const saveFlag = String(process.env.SAVE_TO_SUPABASE || "1") !== "0";

    const urls = await generateTryOnImages({
      productImageUrl,
      prompt,
      upload: uploadFlag,
      saveAsset: saveFlag,
    });

    if (urls.length === 0) {
      return NextResponse.json({ error: "no images generated" }, { status: 500 });
    }
    if (urls.length === 1) {
      return NextResponse.json({ url: urls[0], mode: MODE });
    }
    return NextResponse.json({ images: urls, mode: MODE });
  } catch (e) {
    const message = e instanceof Error ? e.message : typeof e === "string" ? e : "unexpected_error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}