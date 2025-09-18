import { cookies, headers } from "next/headers";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { SUPABASE_URL, SUPABASE_ANON_KEY, HAS_SUPABASE } from "@/lib/config";

/**
 * Creates a Supabase server client using next/headers cookies store.
 * Returns null if Supabase is not configured.
 */
export function getServerSupabase() {
  if (!HAS_SUPABASE) return null;
  const cookieStore = cookies();
  // Adapter compatible with auth-helpers
  const cookieAdapter = {
    get(name: string) {
      try {
        return cookieStore.get(name)?.value;
      } catch {
        return undefined;
      }
    },
    set() {},
    remove() {},
  };
  const supabase = createPagesServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get: cookieAdapter.get as any,
      set: cookieAdapter.set as any,
      remove: cookieAdapter.remove as any,
    },
    headers: {
      // forward headers for RLS policies if needed
      "x-forwarded-host": headers().get("x-forwarded-host") || undefined,
      "x-forwarded-for": headers().get("x-forwarded-for") || undefined,
    } as any,
  });
  return supabase;
}