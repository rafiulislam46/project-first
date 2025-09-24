import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

/**
 * GET /api/templates
 * Reads templates from Supabase public.catalog_templates and returns { items }.
 * Always returns JSON and never throws.
 */
export async function GET() {
  console.log("API /templates called");
  try {
    const supabase = await getServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { items: [], warning: "Supabase not configured (NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY)" },
        { status: 200 }
      );
    }

    const { data, error } = await supabase
      .from("catalog_templates")
      .select("id, name, category, ref_url, thumb")
      .order("id", { ascending: true });

    if (error) {
      console.error("API /templates supabase error:", error);
      return NextResponse.json({ items: [], error: error.message }, { status: 200 });
    }

    // Normalize ref_url to refUrl for front-end, keep thumb as-is
    const items = (data || []).map((t: any) => ({
      ...t,
      refUrl: t.ref_url ?? null,
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    console.error("API /templates unexpected error:", e);
    return NextResponse.json(
      { items: [], error: e?.message || "unexpected_error" },
      { status: 200 }
    );
  }
}

/**
 * POST /api/templates
 * Upserts a catalog template in Supabase; no-op mock response when Supabase not configured.
 */
export async function POST(req: NextRequest) {
  console.log("API /templates POST called");
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const supabase = await getServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        {
          id: body.id || body.name,
          name: body.name,
          category: body.category ?? null,
          refUrl: body.refUrl ?? null,
          thumb: body.thumb ?? null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          warning: "Supabase not configured; POST is a no-op",
        },
        { status: 201 }
      );
    }

    const insert = {
      id: String(body.id || body.name).toLowerCase().replace(/\s+/g, "_"),
      name: body.name,
      category: body.category ?? null,
      ref_url: body.refUrl ?? body.ref_url ?? null,
      thumb: body.thumb ?? null,
    };

    const { data, error } = await supabase.from("catalog_templates").upsert(insert).select("*").limit(1);
    if (error) {
      console.error("API /templates POST supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 200 });
    }
    const row = data?.[0] || insert;
    return NextResponse.json({ ...row, refUrl: row.ref_url ?? null }, { status: 201 });
  } catch (e: any) {
    console.error("API /templates POST unexpected error:", e);
    return NextResponse.json({ error: e?.message || "unexpected_error" }, { status: 200 });
  }
}