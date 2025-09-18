import { NextRequest } from "next/server";
import { HAS_SUPABASE } from "@/lib/config";
import { getServerSupabase } from "@/lib/supabase-server";
import { json, badRequest } from "../_utils";

/**
 * GET: list current user's saved assets
 * POST: create a new saved asset { kind: "tryon"|"template", src_urls: string[]|jsonb, copy?: json }
 */
export async function GET(_req: NextRequest) {
  if (!HAS_SUPABASE) {
    // no-op in mock; client will read from localStorage
    return json({ items: [] });
  }
  const supabase = getServerSupabase();
  if (!supabase) return json({ items: [] });

  const { data: { user } } = await (supabase as any).auth.getUser();
  if (!user) return json({ items: [] });

  const { data, error } = await (supabase as any)
    .from("assets")
    .select("id, kind, src_urls, copy, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return json({ items: [] });
  // Normalize for client convenience
  const items = (data || []).map((r: any) => ({
    id: r.id,
    kind: r.kind,
    src_urls: r.src_urls,
    copy: r.copy,
    created_at: r.created_at,
  }));
  return json({ items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");
  const { kind, src_urls, copy } = body;
  if (!kind || !src_urls) return badRequest("Missing kind or src_urls");

  if (!HAS_SUPABASE) {
    // client will persist locally; echo back
    return json({
      item: {
        id: `${kind}:${Array.isArray(src_urls) ? src_urls[0] : "item"}`,
        kind,
        src_urls,
        copy: copy || {},
        created_at: new Date().toISOString(),
      },
    });
  }

  const supabase = getServerSupabase();
  if (!supabase) return json({ error: "Supabase not configured" }, 200);

  const { data: { user } } = await (supabase as any).auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 200);

  const payload = {
    user_id: user.id,
    kind: String(kind),
    src_urls: src_urls,
    copy: copy || {},
  };

  const { data, error } = await (supabase as any).from("assets").insert(payload).select("id, kind, src_urls, copy, created_at").single();
  if (error) return json({ error: "Insert failed" }, 200);
  return json({ item: data });
}