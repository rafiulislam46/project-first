/**
 * Local mock store using window.localStorage
 */
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

export function listSaved(): SavedItem[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveFavorite(kind: "tryon" | "template", src: string): SavedItem {
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

export function removeFavorite(id: string) {
  const items = readAll().filter((i) => i.id !== id);
  writeAll(items);
}