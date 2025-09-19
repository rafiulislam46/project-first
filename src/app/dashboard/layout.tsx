import React from "react";
import { HAS_SUPABASE } from "@/lib/config";
import { getServerSupabase } from "@/lib/supabase-server";

/**
 * When Supabase is enabled, require an authenticated user for /dashboard.
 * Otherwise, allow anonymous access (mock mode).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (HAS_SUPABASE) {
    const supabase = getServerSupabase();
    if (supabase) {
      const { data: { user } } = await (supabase as any).auth.getUser();
      if (!user) {
        return (
          <section className="container py-12 md:py-16">
            <div className="rounded-2xl border bg-white p-6 shadow-soft-1">
              <h2 className="mb-2">Please sign in</h2>
              <p className="text-text-body">You need to be signed in to view your dashboard.</p>
            </div>
          </section>
        );
      }
    }
  }
  return <>{children}</>;
}