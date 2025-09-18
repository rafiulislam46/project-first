import { NextResponse } from "next/server";

/**
 * Mock template API.
 * POST { templateId, productImageUrl, prompt? } -> returns { images: string[] } (5 demo URLs)
 * Falls back to existing files under /public/demo/template
 */
export async function POST(req: Request) {
  try {
    const _body = await req.json().catch(() => ({}));
    // We don't have file system access here; assume 1..5 and let client handle missing gracefully.
    const base = "/demo/template";
    const urls = [1, 2, 3, 4, 5].map((i) => `${base}/${i}.svg`);
    return NextResponse.json({ images: urls });
  } catch {
    return NextResponse.json({ images: [] });
  }
}