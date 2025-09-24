import { NextRequest } from "next/server";
import { HAS_SUPABASE } from "@/lib/config";
import { getServerSupabase } from "@/lib/supabase-server";
import { json } from "../_utils";

export const dynamic = "force-dynamic";

/**
 * GET: list saved assets for current user (supabase mode).
 * POST: create a saved asset.
 * Fallback: when not configured, return empty list or echo payload to keep UI stable.
 */
export async function GET() {
  if (!HAS_SUPABASE) return json({ items: [] });
  const supabase = await getServerSupabase();
  if (!supabase) return json({ items: [] });
  const { data: { user } } = await (supabase as any).auth.getUser();
  if (!user) return json({ items: [] });

  const { data, error } = await (supabase as any)
    .from("assets")
    .select("id, kind, src_urls, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return json({ items: [] });
  return json({ items: data || [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!HAS_SUPABASE) {
    // Return a local echo structure to satisfy client expectations
    return json({ item: { id: `local_${Date.now()}`, kind: body.kind, src_urls: body.src_urls, created_at: new Date().toISOString() } });
  }
  const supabase = await getServerSupabase();
  if (!supabase) return json({ item: null });

  const { data: { user } } = await (supabase as any).auth.getUser();
  if (!user) return json({ item: null });

  const payload = {
    user_id: user.id,
    kind: String(body.kind || "template"),
    src_urls: Array.isArray(body.src_urls) ? body.src_urls : [],
    copy: body.copy || {},
  };

  const { data, error } = await (supabase as any)
    .from("assets")
    .insert(payload)
    .select("id, kind, src_urls, created_at")
    .single();

  if (error) return json({ item: null });
  return json({ item: data });
}