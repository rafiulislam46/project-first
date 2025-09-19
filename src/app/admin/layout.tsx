import React from "react";
import { HAS_SUPABASE } from "@/lib/config";
import { getServerSupabase } from "@/lib/supabase-server";

/**
 * Server-side role check for /admin.
 * Allows access when Supabase is not configured.
 * When configured, only user with user_metadata.role === "admin" can access.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (HAS_SUPABASE) {
    const supabase = getServerSupabase();
    if (supabase) {
      const {
        data: { user },
      } = await (supabase as any).auth.getUser();
      const role = (user?.user_metadata as any)?.role;
      if (!user || role !== "admin") {
        // Render a minimal unauthorized message while preserving shell
        return (
          <section className="container py-12 md:py-16">
            <div className="rounded-2xl border bg-white p-6 shadow-soft-1">
              <h2 className="mb-2">Unauthorized</h2>
              <p className="text-text-body">You do not have permission to access the admin area.</p>
            </div>
          </section>
        );
      }
    }
  }
  return <>{children}</>;
}