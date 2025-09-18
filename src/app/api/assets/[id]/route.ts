import { NextRequest } from "next/server";
import { HAS_SUPABASE } from "@/lib/config";
import { getServerSupabase } from "@/lib/supabase-server";
import { json, notFound } from "../../_utils";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return notFound("Missing id");

  if (!HAS_SUPABASE) {
    // client will delete locally; return ok
    return json({ ok: true });
  }

  const supabase = getServerSupabase();
  if (!supabase) return json({ ok: false }, 200);
  const { data: { user } } = await (supabase as any).auth.getUser();
  if (!user) return json({ ok: false }, 200);

  const { error } = await (supabase as any).from("assets").delete().eq("id", id).eq("user_id", user.id);
  if (error) return json({ ok: false }, 200);
  return json({ ok: true });
}