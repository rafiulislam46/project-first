import { NextRequest, NextResponse } from "next/server";
import { rateLimitOk, requireApiKey, tooManyRequests, unauthorized } from "./app/api/_utils";

// Apply to API routes only
export const config = {
  matcher: ["/api/:path*"],
};

export default async function middleware(req: NextRequest) {
  // auth (optional if no keys configured)
  const key = requireApiKey(req);
  const keysConfigured =
    !!process.env.API_KEY || (!!process.env.API_KEYS && process.env.API_KEYS.split(",").filter(Boolean).length > 0);
  if (keysConfigured && !key) {
    return unauthorized() as any;
  }

  // rate limit based on API key if present, otherwise IP
  const id =
    key ||
    req.ip ||
    req.headers.get("x-forwarded-for") ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "anon";

  if (!rateLimitOk(String(id))) {
    return tooManyRequests() as any;
  }

  return NextResponse.next();
}