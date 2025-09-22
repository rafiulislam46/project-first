import { HAS_SUPABASE } from "@/lib/config";
import { getServerSupabase } from "@/lib/supabase-server";
import { json, notFound } from "../../_utils";

type Params = { params: { id: string } };

export async function DELETE(_req: Request, { params }: Params) {
  if (!HAS_SUPABASE) {
    return json({ ok: true });
  }
  const supabase = await getServerSupabase();
  if (!supabase) return json({ ok: false });

  const { data: { user } } = await (supabase as any).auth.getUser();
  if (!user) return json({ ok: false });

  const { error } = await (supabase as any)
    .from("assets")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) return notFound("Not found");
  return json({ ok: true });
}