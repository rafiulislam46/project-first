/**
 * Credits API with Supabase integration (if configured), falling back to localStorage mock.
 *
 * Plans:
 * - Free: 5 images
 * - Pro: 100 images
 * - Business: 500 images
 * - Enterprise: unlimited (represented by -1)
 */

import { MODE, PLAN, HAS_SUPABASE } from "@/lib/config";

const KEY = "mock_credits_v1";

// Return -1 for unlimited
export function getPlanAllowance(): number {
  switch (PLAN) {
    case "free":
      return 5;
    case "pro":
      return 100;
    case "business":
      return 500;
    case "enterprise":
      return -1; // unlimited
    default:
      return 5;
  }
}

// Initialize credits if missing (mock mode only)
function ensureInitialized() {
  if (typeof window === "undefined") return;
  if (MODE !== "mock") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === null) {
      const allowance = getPlanAllowance();
      // store -1 for unlimited
      window.localStorage.setItem(KEY, String(allowance));
    }
  } catch {
    // ignore
  }
}

export async function getCredits(): Promise<number> {
  if (HAS_SUPABASE) {
    try {
      const res = await fetch("/api/user/credits", { cache: "no-store" });
      if (!res.ok) return 0;
      const data = (await res.json()) as { credits: number };
      return typeof data.credits === "number" ? data.credits : 0;
    } catch {
      return 0;
    }
  }
  if (typeof window === "undefined") return 0;
  ensureInitialized();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === null) return 0;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return 0;
    return n;
  } catch {
    return 0;
  }
}

export async function canGenerate(): Promise<boolean> {
  if (HAS_SUPABASE) {
    const n = await getCredits();
    return n === -1 || n > 0;
  }
  if (MODE !== "mock") return true;
  const credits = await getCredits();
  return credits === -1 || credits > 0;
}

// Attempt to use one credit. Returns true if allowed and decremented.
export async function useOneCredit(): Promise<boolean> {
  if (HAS_SUPABASE) {
    try {
      const res = await fetch("/api/user/credits/use", { method: "POST" });
      if (!res.ok) return false;
      const data = (await res.json()) as { ok: boolean };
      return !!data.ok;
    } catch {
      return false;
    }
  }

  if (MODE !== "mock") return true;
  if (typeof window === "undefined") return false;

  ensureInitialized();
  try {
    const current = await getCredits();
    if (current === -1) return true; // unlimited
    if (current <= 0) return false;
    const next = current - 1;
    window.localStorage.setItem(KEY, String(next));
    return true;
  } catch {
    return false;
  }
}

// Admin/testing utility
export function resetCredits() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    ensureInitialized();
  } catch {
    // ignore
  }
}