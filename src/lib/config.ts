export type AppMode = "mock" | "live";

const envMode =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_MODE || process.env.MODE)) ||
  "mock";

export const MODE: AppMode = (envMode?.toLowerCase() as AppMode) || "mock";
export const IS_MOCK = MODE === "mock";