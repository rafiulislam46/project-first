import { NextResponse, NextRequest } from "next/server";
import { MODE } from "@/lib/config";
import { createHash, randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

/**
 * Basic API key auth + in-memory rate limiting helpers for API routes.
 * Used by routes directly and by middleware.
 */

const CACHE: {
  ratelimit: Map<string, { tokens: number; updatedAt: number }>;
} = {
  ratelimit: new Map(),
};

export function getEnv(key: string, def: string = ""): string {
  const v = process.env[key];
  return v === undefined || v === null ? def : String(v);
}

export function getApiKeys(): Set<string> {
  const keys = new Set<string>();
  const single = getEnv("API_KEY");
  if (single) keys.add(single.trim());
  const many = getEnv("API_KEYS");
  if (many) {
    many.split(",").map((k) => k.trim()).filter(Boolean).forEach((k) => keys.add(k));
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
  if (!limitPerMin || limitPerMin <= 0) return true;
  const now = Date.now();
  const minute = 60_000;
  const bucket = CACHE.ratelimit.get(id);
  if (!bucket) {
    CACHE.ratelimit.set(id, { tokens: limitPerMin - 1, updatedAt: now });
    return true;
  }
  // refill
  const elapsed = now - bucket.updatedAt;
  const refill = Math.floor((elapsed / minute) * limitPerMin);
  const tokens = Math.min(limitPerMin, bucket.tokens + Math.max(0, refill));
  if (tokens <= 0) {
    return false;
  }
  CACHE.ratelimit.set(id, { tokens: tokens - 1, updatedAt: now });
  return true;
}

/**
 * Simple JSON file store for lack of a database.
 * Files are placed under .data in project root.
 */
const dataDir = path.join(process.cwd(), ".data");
async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {}
}
async function readJSON<T>(name: string, fallback: T): Promise<T> {
  await ensureDataDir();
  const file = path.join(dataDir, `${name}.json`);
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
async function writeJSON<T>(name: string, value: T): Promise<void> {
  await ensureDataDir();
  const file = path.join(dataDir, `${name}.json`);
  await fs.writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

export type Model = {
  id: string;
  name: string;
  gender?: "male" | "female";
  styles?: { key: string; thumb?: string }[];
  createdAt: number;
  updatedAt: number;
};

export type Template = {
  id: string;
  name: string;
  category?: string;
  refUrl?: string;
  thumb?: string;
  createdAt: number;
  updatedAt: number;
};

export type Product = {
  id: string;
  name?: string;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
};

export const db = {
  async listModels(): Promise<Model[]> {
    return readJSON<Model[]>("models", []);
  },
  async getModel(id: string): Promise<Model | undefined> {
    const all = await db.listModels();
    return all.find((m) => m.id === id);
  },
  async createModel(data: Partial<Model>): Promise<Model> {
    const all = await db.listModels();
    const now = Date.now();
    const item: Model = {
      id: data.id || randomUUID(),
      name: data.name || "Untitled Model",
      gender: (data.gender as any) || undefined,
      styles: (data.styles as any) || [],
      createdAt: now,
      updatedAt: now,
    };
    all.push(item);
    await writeJSON("models", all);
    return item;
  },
  async updateModel(id: string, patch: Partial<Model>): Promise<Model | null> {
    const all = await db.listModels();
    const idx = all.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    const now = Date.now();
    const next: Model = { ...all[idx], ...patch, id, updatedAt: now };
    all[idx] = next;
    await writeJSON("models", all);
    return next;
  },
  async deleteModel(id: string): Promise<boolean> {
    const all = await db.listModels();
    const next = all.filter((m) => m.id !== id);
    const changed = next.length !== all.length;
    if (changed) await writeJSON("models", next);
    return changed;
  },

  async listTemplates(): Promise<Template[]> {
    return readJSON<Template[]>("templates", []);
  },
  async getTemplate(id: string): Promise<Template | undefined> {
    const all = await db.listTemplates();
    return all.find((t) => t.id === id);
  },
  async createTemplate(data: Partial<Template>): Promise<Template> {
    const all = await db.listTemplates();
    const now = Date.now();
    const item: Template = {
      id: data.id || randomUUID(),
      name: data.name || "Untitled Template",
      category: data.category,
      refUrl: data.refUrl,
      thumb: data.thumb,
      createdAt: now,
      updatedAt: now,
    };
    all.push(item);
    await writeJSON("templates", all);
    return item;
  },
  async updateTemplate(id: string, patch: Partial<Template>): Promise<Template | null> {
    const all = await db.listTemplates();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const now = Date.now();
    const next: Template = { ...all[idx], ...patch, id, updatedAt: now };
    all[idx] = next;
    await writeJSON("templates", all);
    return next;
  },
  async deleteTemplate(id: string): Promise<boolean> {
    const all = await db.listTemplates();
    const next = all.filter((t) => t.id !== id);
    const changed = next.length !== all.length;
    if (changed) await writeJSON("templates", next);
    return changed;
  },

  async listProducts(): Promise<Product[]> {
    return readJSON<Product[]>("products", []);
  },
  async getProduct(id: string): Promise<Product | undefined> {
    const all = await db.listProducts();
    return all.find((p) => p.id === id);
  },
  async createProduct(data: Partial<Product>): Promise<Product> {
    const all = await db.listProducts();
    const now = Date.now();
    const item: Product = {
      id: data.id || randomUUID(),
      name: data.name,
      imageUrl: data.imageUrl || "",
      createdAt: now,
      updatedAt: now,
    };
    all.push(item);
    await writeJSON("products", all);
    return item;
  },
  async updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
    const all = await db.listProducts();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const now = Date.now();
    const next: Product = { ...all[idx], ...patch, id, updatedAt: now };
    all[idx] = next;
    await writeJSON("products", all);
    return next;
  },
  async deleteProduct(id: string): Promise<boolean> {
    const all = await db.listProducts();
    const next = all.filter((p) => p.id !== id);
    const changed = next.length !== all.length;
    if (changed) await writeJSON("products", next);
    return changed;
  },
};

export function json<T>(data: T, init: number | ResponseInit = 200) {
  const status = typeof init === "number" ? init : init.status || 200;
  return NextResponse.json(data as any, typeof init === "number" ? { status } : init);
}

export function badRequest(message: string, details?: any) {
  return json({ error: message, details }, 400);
}
export function unauthorized(message: string = "Unauthorized") {
  return json({ error: message }, 401);
}
export function tooManyRequests(message: string = "Too Many Requests") {
  return json({ error: message }, 429);
}
export function notFound(message: string = "Not found") {
  return json({ error: message }, 404);
}