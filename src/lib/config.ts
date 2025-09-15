export type AppMode = "mock" | "live";

const envMode =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_MODE || process.env.MODE)) ||
  "mock";

export const MODE: AppMode = (envMode?.toLowerCase() as AppMode) || "mock";
export const IS_MOCK = MODE === "mock";

/** Plan */
type Plan = "free" | "pro" | "team";
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