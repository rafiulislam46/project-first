import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

/**
 * GET /api/models
 * Reads models from Supabase public.catalog_models and returns { items }.
 * Always returns JSON and never throws.
 */
export async function GET() {
  console.log("API /models called");
  try {
    const supabase = await getServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { items: [], warning: "Supabase not configured (NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY)" },
        { status: 200 }
      );
    }

    const { data, error } = await supabase
      .from("catalog_models")
      .select("id, name, gender, thumb_url, styles")
      .order("id", { ascending: true });

    if (error) {
      console.error("API /models supabase error:", error);
      return NextResponse.json({ items: [], error: error.message }, { status: 200 });
    }

    return NextResponse.json({ items: data || [] }, { status: 200 });
  } catch (e: any) {
    console.error("API /models unexpected error:", e);
    return NextResponse.json(
      { items: [], error: e?.message || "unexpected_error" },
      { status: 200 }
    );
  }
}

/**
 * POST /api/models
 * For compatibility, accept creating mock models when Supabase is not used.
 * In production, prefer managing catalog via SQL/seed.
 */
export async function POST(req: NextRequest) {
  console.log("API /models POST called");
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const supabase = await getServerSupabase();
    if (!supabase) {
      // No Supabase configured; echo back payload as created mock (does not persist)
      return NextResponse.json(
        {
          id: body.id || body.name,
          name: body.name,
          gender: body.gender ?? null,
          styles: Array.isArray(body.styles) ? body.styles : [],
          thumb_url: body.thumb_url ?? null,
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
      gender: body.gender ?? null,
      thumb_url: body.thumb_url ?? null,
      styles: Array.isArray(body.styles) ? body.styles : null,
    };

    const { data, error } = await supabase.from("catalog_models").upsert(insert).select("*").limit(1);
    if (error) {
      console.error("API /models POST supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 200 });
    }
    return NextResponse.json(data?.[0] || insert, { status: 201 });
  } catch (e: any) {
    console.error("API /models POST unexpected error:", e);
    return NextResponse.json({ error: e?.message || "unexpected_error" }, { status: 200 });
  }
}