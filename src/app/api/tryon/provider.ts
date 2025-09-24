import { MODE, HAS_SUPABASE } from "@/lib/config";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, hasCloudinary } from "@/lib/cloudinary";
import { getServerSupabase } from "@/lib/supabase-server";

/**
 * Try-on generation options
 */
export type TryOnOptions = {
  productImageUrl: string;
  prompt?: string;
  /**
   * When true and Cloudinary is configured, upload results to Cloudinary.
   * If false or Cloudinary not configured, returns direct upstream URLs.
   */
  upload?: boolean;
  /**
   * Associate saved asset with current user if Supabase present.
   */
  saveAsset?: boolean;
};

export const STYLES = ["studio_clean", "lifestyle_indoor", "street_casual", "luxury_black_gold", "color_gradient"] as const;
export type StyleKey = (typeof STYLES)[number];

/**
 * Small concurrency queue with retry/backoff and timeout guards.
 */
export async function runWithQueue<T>(
  tasks: (() => Promise<T>)[],
  opts: { concurrency?: number; timeoutMs?: number; retries?: number; backoffBaseMs?: number; backoffFactor?: number } = {}
): Promise<T[]> {
  const concurrency = Math.max(1, opts.concurrency ?? 2);
  const timeoutMs = Math.max(1_000, opts.timeoutMs ?? 60_000);
  const retries = Math.max(0, opts.retries ?? 2);
  const backoffBaseMs = Math.max(100, opts.backoffBaseMs ?? 500);
  const backoffFactor = Math.max(1.1, opts.backoffFactor ?? 2);

  function withTimeout<R>(p: Promise<R>): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const to = setTimeout(() => reject(new Error("timeout")), timeoutMs);
      p.then((v) => {
        clearTimeout(to);
        resolve(v);
      }).catch((e) => {
        clearTimeout(to);
        reject(e);
      });
    });
  }

  async function withRetry<R>(fn: () => Promise<R>): Promise<R> {
    let attempt = 0;
    let delay = backoffBaseMs;
    for (;;) {
      try {
        return await withTimeout(fn());
      } catch (err) {
        if (attempt >= retries) throw err;
        await new Promise((r) => setTimeout(r, delay));
        delay = Math.round(delay * backoffFactor);
        attempt += 1;
      }
    }
  }

  const results: T[] = [];
  let idx = 0;
  let active = 0;

  return await new Promise<T[]>((resolve, reject) => {
    const next = () => {
      if (idx >= tasks.length && active === 0) {
        resolve(results);
        return;
      }
      while (active < concurrency && idx < tasks.length) {
        const i = idx++;
        const task = tasks[i];
        active += 1;
        withRetry(task)
          .then((res) => {
            results[i] = res;
            active -= 1;
            next();
          })
          .catch((e) => {
            reject(e);
          });
      }
    };
    next();
  });
}

/**
 * Main orchestration for try-on generation.
 * Returns array of URLs (uploaded or direct).
 */
export async function generateTryOnImages(opts: TryOnOptions): Promise<string[]> {
  const wantsLive = MODE === "live" && (process.env.REPLICATE_API_TOKEN || process.env.HF_TOKEN);
  if (!wantsLive) {
    // MOCK: return demo images under /public/demo/tryon
    return [1, 2, 3, 4, 5].map((i) => `/demo/tryon/${i}.svg`);
  }

  const { productImageUrl, prompt } = opts;
  const doUpload = !!opts.upload && hasCloudinary();

  const tasks = STYLES.map((style) => async () => {
    const url = await generateOne({ imageUrl: productImageUrl, style, prompt });
    if (!doUpload) return url;

    // Unsigned upload to Cloudinary from URL
    const uploadedUrl = await uploadUrlToCloudinary(url, ["tryon", String(style)]);
    return uploadedUrl;
  });

  const urls = await runWithQueue(tasks, { concurrency: 3, retries: 2, timeoutMs: 90_000, backoffBaseMs: 800 });

  // Optionally save to Supabase as an asset row
  if (opts.saveAsset && HAS_SUPABASE) {
    try {
      const supabase = await getServerSupabase();
      if (supabase) {
        const { data: { user } } = await (supabase as any).auth.getUser();
        if (user) {
          await (supabase as any).from("assets").insert({
            user_id: user.id,
            kind: "tryon",
            src_urls: urls,
            copy: { prompt: prompt || "", productImageUrl },
          });

          // Also store each URL in images table
          const rows = urls.map((u) => ({ user_id: user.id, url: u }));
          await (supabase as any).from("images").insert(rows);
        }
      }
    } catch {
      // ignore save errors
    }
  }

  return urls;
}

/**
 * Provider selection wrapper (Replicate preferred, falls back to HF).
 */
async function generateOne(args: { imageUrl: string; style: StyleKey; prompt?: string }): Promise<string> {
  if (process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_MODEL_VERSION) {
    return await generateWithReplicate(args);
  }
  if (process.env.HF_TOKEN && process.env.HF_TRYON_MODEL) {
    return await generateWithHF(args);
  }
  // As last resort, return source image (acts like passthrough)
  return args.imageUrl;
}

/**
 * Replicate implementation:
 * - POST /v1/predictions
 * - poll until completed
 * Expects:
 * - REPLICATE_API_TOKEN
 * - REPLICATE_MODEL_VERSION (version hash)
 */
async function generateWithReplicate(args: { imageUrl: string; style: StyleKey; prompt?: string }): Promise<string> {
  const token = String(process.env.REPLICATE_API_TOKEN);
  const version = String(process.env.REPLICATE_MODEL_VERSION);
  const input = {
    image: args.imageUrl,
    style: args.style,
    prompt: args.prompt || "",
  };

  const createRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version, input }),
  });

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => "");
    throw new Error(`replicate create failed ${createRes.status}: ${text || createRes.statusText}`);
  }

  const created = (await createRes.json()) as { id: string };
  const id = created.id;
  // poll
  for (;;) {
    await new Promise((r) => setTimeout(r, 1200));
    const getRes = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { "Authorization": `Token ${token}` },
      cache: "no-store",
    });
    if (!getRes.ok) {
      const text = await getRes.text().catch(() => "");
      throw new Error(`replicate poll failed ${getRes.status}: ${text || getRes.statusText}`);
    }
    const data = (await getRes.json()) as any;
    if (data.status === "succeeded") {
      // Replicate returns output: string | string[]
      const out = data.output;
      const first = Array.isArray(out) ? out[0] : out;
      if (!first || typeof first !== "string") throw new Error("replicate: empty output");
      return first;
    }
    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(`replicate: ${data.status}`);
    }
    // else: starting, processing, etc. loop
  }
}

/**
 * HuggingFace Inference API implementation (generic image-to-image).
 * Expects:
 * - HF_TOKEN
 * - HF_TRYON_MODEL (e.g., "user/tryon-model")
 * Returns a URL uploaded to Cloudinary when configured, otherwise upstream URL.
 */
async function generateWithHF(args: { imageUrl: string; style: StyleKey; prompt?: string }): Promise<string> {
  const token = String(process.env.HF_TOKEN);
  const model = String(process.env.HF_TRYON_MODEL);
  const endpoint = `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`;

  // Send json with image url and style; many community models accept flexible schema.
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: {
        image_url: args.imageUrl,
        style: args.style,
        prompt: args.prompt || "",
      },
      options: { wait_for_model: true },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`hf failed ${res.status}: ${text || res.statusText}`);
  }

  // Response may be bytes (image/*) or JSON; handle both
  const contentType = res.headers.get("content-type") || "";
  if (contentType.startsWith("image/")) {
    const buf = Buffer.from(await res.arrayBuffer());
    if (hasCloudinary()) {
      return await uploadBufferToCloudinary(buf);
    }
    // If Cloudinary not configured, return data URL fallback
    const b64 = buf.toString("base64");
    const ext = contentType.includes("jpeg") ? "jpeg" : contentType.includes("png") ? "png" : "octet-stream";
    return `data:image/${ext};base64,${b64}`;
  }

  const data = await res.json().catch(() => null);
  if (data && typeof data.url === "string") {
    // If HF returns a URL and Cloudinary is configured and upload requested elsewhere, just return URL.
    return data.url;
  }
  // Fallback: return source image
  return args.imageUrl;
}

/**
 * Helpers to perform unsigned uploads to Cloudinary using fetch.
 */
async function uploadBufferToCloudinary(buffer: Buffer): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([buffer]));
  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`cloudinary upload failed ${res.status}: ${text || res.statusText}`);
  }
  const json = (await res.json()) as any;
  const url = json?.secure_url as string | undefined;
  if (!url) throw new Error("cloudinary: missing secure_url");
  return url;
}

async function uploadUrlToCloudinary(url: string, tags?: string[]): Promise<string> {
  // Fetch remote image then upload as buffer
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`download failed ${r.status}: ${text || r.statusText}`);
  }
  const buf = Buffer.from(await r.arrayBuffer());
  return await uploadBufferToCloudinary(buf);
}