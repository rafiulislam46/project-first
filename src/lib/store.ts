/**
 * Saved assets store with optional Supabase backend.
 * Falls back to window.localStorage in mock mode.
 */
import { HAS_SUPABASE } from "@/lib/config";

export type SavedItem = {
  id: string;
  kind: "tryon" | "template";
  src: string;
  createdAt: number;
};

const KEY = "mock_saved_items_v1";

function readAll(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedItem[];
  } catch {
    return [];
  }
}

function writeAll(items: SavedItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export async function listSaved(): Promise<SavedItem[]> {
  if (HAS_SUPABASE) {
    try {
      const res = await fetch("/api/assets", { cache: "no-store" });
      if (!res.ok) return [];
      const data = (await res.json()) as { items: SavedItem[] };
      // created_at is returned as ISO; normalize to number timestamp for compatibility
      return (data.items || []).map((i: any) => ({
        id: i.id,
        kind: i.kind,
        src: i.src || i.src_url || i.src_urls?.[0] || i.src, // basic normalization
        createdAt: typeof i.created_at === "string" ? Date.parse(i.created_at) : i.createdAt || Date.now(),
      })).sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  }
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveFavorite(kind: "tryon" | "template", src: string): Promise<SavedItem> {
  if (HAS_SUPABASE) {
    const payload = { kind, src_urls: [src], copy: {} };
    const res = await fetch("/api/assets", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) {
      // fallback to client cache if API fails
      const local = saveFavoriteLocal(kind, src);
      return local;
    }
    const data = (await res.json()) as { item: any };
    const item = data.item;
    return {
      id: item.id,
      kind: item.kind,
      src: src,
      createdAt: Date.parse(item.created_at),
    };
  }
  return saveFavoriteLocal(kind, src);
}

function saveFavoriteLocal(kind: "tryon" | "template", src: string): SavedItem {
  const items = readAll();
  const existing = items.find((i) => i.src === src && i.kind === kind);
  if (existing) return existing;

  const item: SavedItem = {
    id: `${kind}:${src}`,
    kind,
    src,
    createdAt: Date.now(),
  };
  items.push(item);
  writeAll(items);
  return item;
}

export async function removeFavorite(id: string) {
  if (HAS_SUPABASE) {
    try {
      await fetch(`/api/assets/${encodeURIComponent(id)}`, { method: "DELETE" });
      return;
    } catch {
      // noop
    }
  }
  const items = readAll().filter((i) => i.id !== id);
  writeAll(items);
}