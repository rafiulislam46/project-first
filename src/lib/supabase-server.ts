import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { HAS_SUPABASE, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

/**
 * Creates a Supabase server client for App Router using @supabase/ssr.
 * Returns null if Supabase is not configured.
 */
export function getServerSupabase() {
  if (!HAS_SUPABASE) return null;

  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: Parameters<typeof cookieStore.set>[0] extends object ? any : any) {
        // In server components, cookies().set can throw during render; ignore in that case.
        try {
          cookieStore.set({ name, value, ...(options || {}) });
        } catch {
          // no-op
        }
      },
      remove(name: string, options?: any) {
        try {
          cookieStore.set({ name, value: "", ...(options || {}), maxAge: 0 });
        } catch {
          // no-op
        }
      },
    },
  });
}