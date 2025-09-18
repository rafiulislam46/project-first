/**
 * Client-side credits for MODE=mock
 * Uses localStorage to persist remaining credits.
 *
 * Plans:
 * - Free: 5 images
 * - Pro: 100 images
 * - Business: 500 images
 * - Enterprise: unlimited (represented by -1)
 */

import { MODE, PLAN } from "@/lib/config";

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

export function getCredits(): number {
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

export function canGenerate(): boolean {
  if (MODE !== "mock") return true;
  const credits = getCredits();
  return credits === -1 || credits > 0;
}

// Attempt to use one credit. Returns true if allowed and decremented.
export function useOneCredit(): boolean {
  if (MODE !== "mock") return true;
  if (typeof window === "undefined") return false;

  ensureInitialized();
  try {
    const current = getCredits();
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