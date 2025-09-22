import React from "react";
import { HAS_SUPABASE } from "@/lib/config";
import { getServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AdminNav from "./ui/admin-nav";

/**
 * Server-side role check and admin shell for /admin.
 * - If Supabase not configured, allow access (mock mode).
 * - If configured, only user with user_metadata.role === "admin" can access.
 * - Non-admin users are redirected to the homepage.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (HAS_SUPABASE) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const {
        data: { user },
      } = await (supabase as any).auth.getUser();
      const role = (user?.user_metadata as any)?.role;
      if (!user || role !== "admin") {
        redirect("/");
      }
    }
  }

  return (
    <div className="container py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4">
        {/* Sidebar */}
        <div className="lg:sticky lg:top-20 h-max">
          <AdminNav />
        </div>

        {/* Main content */}
        <div className="min-h-[60vh]">
          {children}
        </div>
      </div>
    </div>
  );
}