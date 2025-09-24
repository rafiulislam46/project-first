/**
 * Unified Supabase client exports for both server and client usage.
 * Keeps call sites simple and centralizes our setup.
 */
export { getClientSupabase as getSupabaseBrowserClient } from "./supabase-browser";
export { getServerSupabase as getSupabaseServerClient } from "./supabase-server";