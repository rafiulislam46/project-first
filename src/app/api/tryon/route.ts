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

    // Replicate Virtual Try-On path — use REST (fofr/virtual-try-on) and poll
    if (typeof body.human_img === "string" && typeof body.garm_img === "string") {
      const token = process.env.REPLICATE_API_TOKEN;
      if (!token) {
        return NextResponse.json({ error: "Missing REPLICATE_API_TOKEN on server" }, { status: 500 });
      }

      // Model/version: default to fofr/virtual-try-on:latest; allow override via env
      const modelVersion = String(process.env.REPLICATE_MODEL_VERSION || "fofr/virtual-try-on:latest");
      const personUrl = body.human_img;
      const productUrl = body.garm_img;

      // 4) Create prediction
      const createRes = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: modelVersion,
          input: {
            // Common VTO model keys; adjust via env/model if needed
            person_image: personUrl,
            garment_image: productUrl,
          },
        }),
      });

      if (!createRes.ok) {
        const text = await createRes.text().catch(() => "");
        console.error("[TRYON] create prediction failed", createRes.status, text);
        return NextResponse.json(
          { error: `Replicate create failed (${createRes.status}): ${text}` },
          { status: 502 }
        );
      }

      const prediction = await createRes.json();
      const startedAt = Date.now();
      console.log("[TRYON] prediction id", prediction?.id);

      // 5) Poll until completed (avoid 502 from timeouts/unhandled)
      let outputUrl: string | null = null;
      const maxWaitMs = 120_000; // 2 min
      const pollEveryMs = 1500;
      let waited = 0;

      while (waited < maxWaitMs) {
        const getRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: { "Authorization": `Bearer ${token}` },
          cache: "no-store",
        });

        if (!getRes.ok) {
          const t = await getRes.text().catch(() => "");
          console.error("[TRYON] get prediction failed", getRes.status, t);
          return NextResponse.json(
            { error: `Replicate get failed (${getRes.status}): ${t}` },
            { status: 502 }
          );
        }

        const data = await getRes.json();

        if (data.status === "succeeded") {
          // Some models return array of urls in data.output
          const out = Array.isArray(data.output) ? data.output : [data.output];
          outputUrl = (out.find((v: any) => typeof v === "string" && v) as string) || null;
          console.log("[TRYON] succeeded in", Date.now() - startedAt, "ms", { outputUrl });
          break;
        }

        if (data.status === "failed" || data.error) {
          console.error("[TRYON] failed", data.error || data.status);
          return NextResponse.json(
            { error: data.error || "Replicate prediction failed" },
            { status: 502 }
          );
        }

        await new Promise((r) => setTimeout(r, pollEveryMs));
        waited += pollEveryMs;
      }

      if (!outputUrl) {
        return NextResponse.json(
          { error: "Generation timed out" },
          { status: 504 }
        );
      }

      // 6) Respond with EXACT shape the frontend expects
      return NextResponse.json({ images: [outputUrl] }, { status: 200 });
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