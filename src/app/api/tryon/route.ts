import { NextResponse } from "next/server";

/**
 * Mock try-on API.
 * POST { modelId, productImageUrl, prompt? } -> returns { images: string[] } (5 demo URLs)
 */
export async function POST(req: Request) {
  try {
    const _body = await req.json().catch(() => ({}));
    // In mock mode we ignore inputs and serve demo URLs
    const base = "/demo/tryon";
    const urls = [1, 2, 3, 4, 5].map((i) => `${base}/${i}.svg`);
    return NextResponse.json({ images: urls });
  } catch {
    return NextResponse.json({ images: [] });
  }
}