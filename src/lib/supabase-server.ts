import { cookies, headers } from "next/headers";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { HAS_SUPABASE } from "@/lib/config";

/**
 * Creates a Supabase server client using next/headers stores.
 * Returns null if Supabase is not configured.
 */
export function getServerSupabase() {
  if (!HAS_SUPABASE) return null;
  return createPagesServerClient({ cookies, headers });
}