import { NextRequest, NextResponse } from "next/server";
import { rateLimitOk, requireApiKey, tooManyRequests, unauthorized } from "./app/api/_utils";
import { createServerClient } from "@supabase/ssr";
import { HAS_SUPABASE, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

// Apply to API routes and gated pages
export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/generator/:path*"],
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Gate selected pages behind auth if Supabase is configured
  const isGated = pathname.startsWith("/dashboard") || pathname.startsWith("/generator");
  if (HAS_SUPABASE && isGated) {
    const res = NextResponse.next();

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: any) {
          res.cookies.set({ name, value, ...(options || {}) });
        },
        remove(name: string, options?: any) {
          res.cookies.set({ name, value: "", ...(options || {}), maxAge: 0 });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(url);
    }

    // Return the response that may include updated cookies
    return res;
  }

  // API: auth (optional if no keys configured)
  if (pathname.startsWith("/api")) {
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
  }

  return NextResponse.next();
}