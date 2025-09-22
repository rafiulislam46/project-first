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

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, { cookies });
}