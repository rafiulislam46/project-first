import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { HAS_SUPABASE, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

/**
 * Singleton Supabase client for browser usage (App Router client components).
 * Returns null if env vars are not configured so the app can still render.
 */
let browserClient: SupabaseClient | null = null;

export function getClientSupabase(): SupabaseClient | null {
  if (!HAS_SUPABASE) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}