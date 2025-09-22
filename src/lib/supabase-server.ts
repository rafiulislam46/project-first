"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { HAS_SUPABASE, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

/**
 * Creates a Supabase server client for App Router using @supabase/ssr.
 * Returns null if Supabase is not configured.
 */
export async function getServerSupabase() {
  if (!HAS_SUPABASE) return null;

  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // In some contexts (e.g. during rendering), cookies may be immutable.
        }
      },
      remove(name, _options) {
        try {
          cookieStore.delete(name);
        } catch {
          // In some contexts (e.g. during rendering), cookies may be immutable.
        }
      },
    },
  });
}