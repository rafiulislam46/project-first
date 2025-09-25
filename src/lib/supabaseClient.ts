import { createClient } from "@supabase/supabase-js";
import { HAS_SUPABASE, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

let client: ReturnType<typeof createClient> | null = null;

/**
 * Returns a memoized Supabase client for browser usage.
 * If env vars are missing, returns null to allow the app to render without auth.
 */
export function getSupabaseClient() {
  if (!HAS_SUPABASE) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}