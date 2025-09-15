import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* Motion helpers */
import { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 }
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

/* Asset manifest + placeholders */

import { ASSET_MANIFEST_URL } from "@/lib/config";

export type AssetManifest = {
  models?: { id: string; name?: string; gender?: string; styles?: { key: string; thumb?: string }[] }[];
  templates?: { id: string; name?: string; category?: string; refUrl?: string; thumb?: string }[];
  demos?: {
    tryon?: string[];
    template?: string[];
  };
};

/** Fetch JSON helper with graceful fallback */
async function safeFetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Load local JSON from /public/data */
export async function loadLocalJSON<T>(path: string): Promise<T | null> {
  return safeFetchJSON<T>(path);
}

/**
 * Load asset manifest if ASSET_MANIFEST_URL is set.
 * If it fails, returns null so callers can fallback to local JSON.
 */
export async function loadAssetManifest(): Promise<AssetManifest | null> {
  if (!ASSET_MANIFEST_URL) return null;
  return safeFetchJSON<AssetManifest>(ASSET_MANIFEST_URL);
}

/** Merge helpers */

export function overrideModelsWithManifest(local: any[], manifest: AssetManifest | null) {
  if (!manifest?.models?.length) return local;
  const byId = new Map(manifest.models.map((m) => [m.id.toLowerCase(), m]));
  return local.map((m) => {
    const over = byId.get(String(m.id).toLowerCase());
    if (!over) return m;
    return {
      ...m,
      name: over.name ?? m.name,
      gender: over.gender ?? m.gender,
      styles: (m.styles || []).map((s: any) => {
        const found = over.styles?.find((x) => x.key === s.key);
        return found ? { ...s, thumb: found.thumb ?? s.thumb } : s;
      }),
    };
  });
}

export function overrideTemplatesWithManifest(local: any[], manifest: AssetManifest | null) {
  if (!manifest?.templates?.length) return local;
  const byId = new Map(manifest.templates.map((t) => [t.id.toLowerCase(), t]));
  return local.map((t) => {
    const over = byId.get(String(t.id).toLowerCase());
    if (!over) return t;
    return {
      ...t,
      name: over.name ?? t.name,
      category: over.category ?? t.category,
      refUrl: over.refUrl ?? t.refUrl,
      thumb: over.thumb ?? t.thumb,
    };
  });
}

export function getDemoImages(manifest: AssetManifest | null, kind: "tryon" | "template"): string[] {
  if (!manifest?.demos?.[kind]?.length) return [];
  return manifest.demos![kind]!.filter(Boolean) as string[];
}

/* Selection persistence */

const SELECTED_MODEL_KEY = "selected_model_id";
const SELECTED_TEMPLATE_KEY = "selected_template_id";

export function getSelectedModelId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SELECTED_MODEL_KEY);
  } catch {
    return null;
  }
}

export function setSelectedModelId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) {
      window.localStorage.setItem(SELECTED_MODEL_KEY, id);
    } else {
      window.localStorage.removeItem(SELECTED_MODEL_KEY);
    }
  } catch {
    // ignore
  }
}

export function getSelectedTemplateId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SELECTED_TEMPLATE_KEY);
  } catch {
    return null;
  }
}

export function setSelectedTemplateId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) {
      window.localStorage.setItem(SELECTED_TEMPLATE_KEY, id);
    } else {
      window.localStorage.removeItem(SELECTED_TEMPLATE_KEY);
    }
  } catch {
    // ignore
  }
}