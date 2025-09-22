import { NextRequest } from "next/server";
import { HAS_SUPABASE } from "@/lib/config";
import { getServerSupabase } from "@/lib/supabase-server";
import { badRequest, json } from "../../_utils";

/**
 * GET: return current user's plan and remaining credits.
 * In Supabase mode, reads from profiles table.
 * In mock mode, returns 0 (client will handle).
 */
export async function GET(_req: NextRequest) {
  if (!HAS_SUPABASE) {
    return json({ plan: "free", credits: 0 });
  }
  const supabase = await getServerSupabase();
  if (!supabase) return json({ plan: "free", credits: 0 });

  const { data: { user }, error: userErr } = await (supabase as any).auth.getUser();
  if (userErr || !user) {
    return json({ plan: "free", credits: 0 }, 200);
  }

  const { data, error } = await (supabase as any)
    .from("profiles")
    .select("plan, credits")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return json({ plan: "free", credits: 0 }, 200);
  return json({ plan: data?.plan || "free", credits: typeof data?.credits === "number" ? data!.credits : 0 });
}

/**
 * POST /api/user/credits/use - consume one credit if available.
 * Returns { ok: boolean, remaining?: number }
 */
export async function POST(_req: NextRequest) {
  if (!HAS_SUPABASE) {
    // client-side mock handles credits; return ok so flow continues
    return json({ ok: true });
  }
  const supabase = await getServerSupabase();
  if (!supabase) return json({ ok: false }, 200);

  const { data: { user } } = await (supabase as any).auth.getUser();
  if (!user) return json({ ok: false }, 200);

  // Single-statement decrement guarded at DB level
  // Try to decrement if credits > 0 or allow if -1 (unlimited)
  const { data, error } = await (supabase as any).rpc("use_one_credit", { p_user_id: user.id });

  if (error) {
    return json({ ok: false }, 200);
  }
  return json({ ok: data?.ok ?? false, remaining: data?.remaining });
}