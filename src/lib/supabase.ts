import { createBrowserClient } from "@supabase/ssr";
import { HAS_SUPABASE, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

/**
 * Creates (and memoizes) a Supabase client for browser/client components.
 * Returns null if Supabase is not configured.
 */
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getClientSupabase() {
  if (!HAS_SUPABASE) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}