import { NextResponse } from "next/server";
import { MODE } from "@/lib/config";
import { generateTryOnImages } from "./provider";

/**
 * Try-on API.
 * POST { productImageUrl, prompt? } -> returns { urls: string[] }
 * Live mode: generates 5 styles concurrently with retries/timeouts.
 * Mock mode: returns 5 demo URLs.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) || {};
    const productImageUrl: string | undefined = body.productImageUrl || body.imageUrl;
    const prompt: string | undefined = body.prompt;

    if (!productImageUrl) {
      // For compatibility, still return mock if missing in mock mode
      const base = "/demo/tryon";
      const demo = [1, 2, 3, 4, 5].map((i) => `${base}/${i}.svg`);
      return NextResponse.json({ urls: demo, mode: MODE });
    }

    const uploadFlag = String(process.env.UPLOAD_TO_CLOUDINARY || "1") !== "0";
    const saveFlag = String(process.env.SAVE_TO_SUPABASE || "1") !== "0";

    const urls = await generateTryOnImages({
      productImageUrl,
      prompt,
      upload: uploadFlag,
      saveAsset: saveFlag,
    });

    return NextResponse.json({ urls, mode: MODE });
  } catch (e: any) {
    // Graceful fallback
    const base = "/demo/tryon";
    const demo = [1, 2, 3, 4, 5].map((i) => `${base}/${i}.svg`);
    return NextResponse.json({ urls: demo, error: e?.message || "unexpected_error", mode: MODE }, { status: 200 });
  }
}