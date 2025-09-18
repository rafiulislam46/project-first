export type AppMode = "mock" | "live";

const envMode =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_MODE || process.env.MODE)) ||
  "mock";

export const MODE: AppMode = (envMode?.toLowerCase() as AppMode) || "mock";
export const IS_MOCK = MODE === "mock";

/** Plan */
export type Plan = "free" | "pro" | "business" | "enterprise";
const envPlan =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_PLAN || process.env.PLAN)) ||
  "free";
export const PLAN: Plan = (envPlan?.toLowerCase() as Plan) || "free";
export const IS_FREE = PLAN === "free";

/** Optional asset manifest URL */
export const ASSET_MANIFEST_URL =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_ASSET_MANIFEST_URL ||
      process.env.ASSET_MANIFEST_URL)) ||
  "";

/** Supabase configuration presence */
export const SUPABASE_URL =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)) ||
  "";
export const SUPABASE_ANON_KEY =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)) ||
  "";
export const HAS_SUPABASE = !!(SUPABASE_URL && SUPABASE_ANON_KEY);