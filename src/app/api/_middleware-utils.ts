import { NextResponse, NextRequest } from "next/server";

/**
 * Minimal utilities for middleware-only usage.
 * Avoids importing Node.js-only modules (fs, path) so it can run in the Edge runtime.
 */

function getEnv(key: string, def: string = ""): string {
  const v = (typeof process !== "undefined" && process.env && process.env[key]) || undefined;
  return v === undefined || v === null ? def : String(v);
}

function getApiKeys(): Set<string> {
  const keys = new Set<string>();
  const single = getEnv("API_KEY");
  if (single) keys.add(single.trim());
  const many = getEnv("API_KEYS");
  if (many) {
    many
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
      .forEach((k) => keys.add(k));
  }
  return keys;
}

export function requireApiKey(req: NextRequest | Request): string | null {
  const headerKey =
    (req as any).headers?.get?.("x-api-key") ||
    (req as any).headers?.get?.("authorization")?.replace(/^Bearer\s+/i, "") ||
    (req as any).headers?.get?.("Authorization")?.replace(/^Bearer\s+/i, "");
  const keys = getApiKeys();
  if (!keys.size) return null; // no auth configured
  if (!headerKey || !keys.has(headerKey)) return null;
  return headerKey;
}

export function rateLimitOk(id: string, limitPerMin: number = Number(getEnv("RATE_LIMIT_PER_MIN", "60"))): boolean {
  // Lightweight token bucket implemented in a module-scoped map.
  // This is best-effort in middleware and may reset on cold starts.
  if (!limitPerMin || limitPerMin <= 0) return true;
  const now = Date.now();
  const minute = 60_000;
  // Use globalThis to avoid per-request reinitialization in edge
  const rt = (globalThis as any).__rateLimitCache || ((globalThis as any).__rateLimitCache = new Map());
  const bucket = rt.get(id);
  if (!bucket) {
    rt.set(id, { tokens: limitPerMin - 1, updatedAt: now });
    return true;
  }
  const elapsed = now - bucket.updatedAt;
  const refill = Math.floor((elapsed / minute) * limitPerMin);
  const tokens = Math.min(limitPerMin, bucket.tokens + Math.max(0, refill));
  if (tokens <= 0) {
    return false;
  }
  rt.set(id, { tokens: tokens - 1, updatedAt: now });
  return true;
}

export function unauthorized(message: string = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function tooManyRequests(message: string = "Too Many Requests") {
  return NextResponse.json({ error: message }, { status: 429 });
}