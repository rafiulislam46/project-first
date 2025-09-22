import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.formData().catch(() => null);
  console.log("[SSLCommerz Cancel]", body ? Object.fromEntries(body.entries()) : "no body");
  return NextResponse.json({ ok: false, canceled: true });
}

export async function GET(req: NextRequest) {
  console.log("[SSLCommerz Cancel - GET]", req.nextUrl.searchParams.toString());
  return NextResponse.json({ ok: false, canceled: true });
}