import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard
 * Returns app health and simple counts from Supabase.
 * Always returns JSON; never throws.
 */
export async function GET() {
  console.log("API /dashboard called");
  try {
    const supabase = await getServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        {
          ok: true,
          supabase: false,
          counts: { models: 0, templates: 0, assets: 0 },
          warning: "Supabase not configured",
        },
        { status: 200 }
      );
    }

    const [modelsCount, templatesCount, assetsCount] = await Promise.all([
      supabase.from("catalog_models").select("id", { count: "exact", head: true }),
      supabase.from("catalog_templates").select("id", { count: "exact", head: true }),
      supabase.from("assets").select("id", { count: "exact", head: true }),
    ]);

    const counts = {
      models: modelsCount.count ?? 0,
      templates: templatesCount.count ?? 0,
      assets: assetsCount.count ?? 0,
    };

    return NextResponse.json({ ok: true, supabase: true, counts }, { status: 200 });
  } catch (e: any) {
    console.error("API /dashboard error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "unexpected_error", counts: { models: 0, templates: 0, assets: 0 } },
      { status: 200 }
    );
  }
}