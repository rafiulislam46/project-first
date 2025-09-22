import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.formData().catch(() => null);
  console.log("[SSLCommerz Success]", body ? Object.fromEntries(body.entries()) : "no body");
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  console.log("[SSLCommerz Success - GET]", req.nextUrl.searchParams.toString());
  return NextResponse.json({ ok: true });
}