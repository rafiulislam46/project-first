import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

import { IS_MOCK } from "@/lib/config";

/**
 * Cloudinary environment configuration
 */
export const CLOUDINARY_CLOUD_NAME =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME)) ||
  "";

export const CLOUDINARY_API_KEY =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY)) ||
  "";

export const CLOUDINARY_API_SECRET =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET ||
      process.env.CLOUDINARY_API_SECRET)) ||
  "";

export const CLOUDINARY_UPLOAD_PRESET =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      process.env.CLOUDINARY_UPLOAD_PRESET)) ||
  "";

/**
 * Whether Cloudinary is configured well enough to use uploads (unsigned)
 */
export function hasCloudinary(): boolean {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

/**
 * Options for building a Cloudinary transformation and URL
 */
export type TransformOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "thumb" | "pad";
  gravity?: "auto" | "center" | "north" | "south" | "east" | "west" | "face";
  format?: "jpg" | "png" | "webp" | "avif";
  quality?: number | "auto";
  /** Optional publicId or text watermark */
  watermark?: (
    | { publicId: string }
    | { text: string; fontFamily?: string; fontSize?: number; fontWeight?: "normal" | "bold" }
  ) & {
    opacity?: number; // 0-100
    /**
     * position keyword: "north_east", "south_east", "north_west", "south_west", "center"
     */
    position?:
      | "north_east"
      | "south_east"
      | "north_west"
      | "south_west"
      | "center";
    /** Relative width when using image overlay (0-1). Default 0.25 */
    relativeWidth?: number;
    /** x/y offset in pixels */
    x?: number;
    y?: number;
  };
};

/**
 * Build a Cloudinary transformation string (no leading/trailing slashes)
 */
export function buildTransformation(opts: TransformOptions = {}): string {
  const parts: string[] = [];

  const crop = opts.crop ?? "fill";
  const gravity = opts.gravity ?? "auto";
  if (opts.width) parts.push(`w_${Math.round(opts.width)}`);
  if (opts.height) parts.push(`h_${Math.round(opts.height)}`);
  if (crop) parts.push(`c_${crop}`);
  if (gravity) parts.push(`g_${gravity}`);
  if (opts.quality) parts.push(`q_${opts.quality}`);
  // default to automatic format when requested but no explicit format in URL
  // (Note: format is applied at the end by appending .ext to the resource)

  // Watermark overlay (image or text)
  if (opts.watermark) {
    const wm = opts.watermark;
    const pos =
      wm.position === "north_east"
        ? "north_east"
        : wm.position === "south_east"
        ? "south_east"
        : wm.position === "north_west"
        ? "north_west"
        : wm.position === "south_west"
        ? "south_west"
        : "center";

    const opacity = typeof wm.opacity === "number" ? Math.max(0, Math.min(100, Math.round(wm.opacity))) : 70;
    const x = typeof wm.x === "number" ? `x_${Math.round(wm.x)}` : undefined;
    const y = typeof wm.y === "number" ? `y_${Math.round(wm.y)}` : undefined;

    if ("publicId" in wm) {
      const relW = wm.relativeWidth && wm.relativeWidth > 0 && wm.relativeWidth <= 1 ? wm.relativeWidth : 0.25;
      // overlay image chain
      // l_{publicId},w_{rel},g_{pos},o_{opacity},fl_relative
      const overlay = [
        `l_${encodePublicId(wm.publicId)}`,
        `w_${Math.round(relW * 100)}`,
        "fl_relative",
        `g_${pos}`,
        `o_${opacity}`,
        x,
        y,
      ]
        .filter(Boolean)
        .join(",");
      parts.push(overlay);
    } else if ("text" in wm) {
      const fontFamily = wm.fontFamily || "Arial";
      const fontWeight = wm.fontWeight === "bold" ? "bold" : "normal";
      const fontSize = wm.fontSize && wm.fontSize > 0 ? wm.fontSize : 48;

      // l_text:{fontFamily}_{size}_{weight}:{text},co_rgb:fff,g_{pos},o_{opacity}
      const encodedText = encodeOverlayText(wm.text);
      const overlay = [
        `l_text:${encodeURIComponent(`${fontFamily}_${fontSize}_${fontWeight}`)}:${encodedText}`,
        "co_rgb:ffffff",
        `g_${pos}`,
        `o_${opacity}`,
        x,
        y,
      ]
        .filter(Boolean)
        .join(",");
      parts.push(overlay);
    }
  }

  return parts.join(",");
}

function encodePublicId(id: string) {
  // Cloudinary public_ids may include slashes for folders; only encode special characters
  return encodeURIComponent(id).replace(/%2F/g, "/");
}

function encodeOverlayText(text: string) {
  // Per Cloudinary docs, some characters must be specially encoded
  return encodeURIComponent(text)
    .replace(/%2C/g, "%252C")
    .replace(/%2F/g, "%252F")
    .replace(/%3A/g, "%253A");
}

/**
 * Build a Cloudinary URL from a publicId or an existing Cloudinary URL
 * For non-Cloudinary URLs:
 * - In mock mode, returns input as-is.
 * - In live mode, if a full non-Cloudinary URL or local path is given, returns input as-is (no transform).
 */
export function buildCloudinaryUrl(
  publicIdOrUrl: string,
  opts: TransformOptions = {}
): string {
  const isFull = /^https?:\/\//i.test(publicIdOrUrl);
  const isCloudinaryUrl = /res\.cloudinary\.com/.test(publicIdOrUrl);

  if (!CLOUDINARY_CLOUD_NAME) {
    return publicIdOrUrl;
  }

  const tr = buildTransformation(opts);
  const fmt = opts.format ? `.${opts.format}` : "";

  if (isFull && isCloudinaryUrl) {
    // Inject transformation after "/upload/"
    const idx = publicIdOrUrl.indexOf("/upload/");
    if (idx >= 0) {
      const prefix = publicIdOrUrl.slice(0, idx + "/upload/".length);
      const rest = publicIdOrUrl.slice(idx + "/upload/".length);
      return tr ? `${prefix}${tr}/${rest}` : publicIdOrUrl;
    }
    return publicIdOrUrl;
  }

  if (isFull) {
    // Non-cloudinary full URL -> cannot transform
    return publicIdOrUrl;
  }

  // Assume it's a public_id
  const base = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  return tr ? `${base}/${tr}/${encodePublicId(publicIdOrUrl)}${fmt}` : `${base}/${encodePublicId(publicIdOrUrl)}${fmt}`;
}

/**
 * Result of an upload operation
 */
export type UploadResult = {
  publicId?: string;
  secureUrl: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  createdAt?: string;
  resourceType?: string;
  raw?: any;
};

/**
 * Upload an image either to local filesystem (MOCK) or to Cloudinary (LIVE).
 * - input can be:
 *   - a local absolute or relative filepath (string)
 *   - an http(s) URL (string)
 *   - a Buffer / ArrayBuffer
 *   - a Blob (in environments that support it)
 */
export async function uploadImage(
  input: string | Buffer | ArrayBuffer | Blob,
  opts?: {
    folder?: string;
    publicId?: string;
    tags?: string[];
    overwrite?: boolean;
    /**
     * File extension hint when saving locally in MOCK mode. Defaults to png.
     */
    localExt?: "png" | "jpg" | "jpeg" | "webp";
  }
): Promise<UploadResult> {
  if (IS_MOCK || !hasCloudinary()) {
    // Keep local files. If input is a remote URL or local path, return as-is.
    if (typeof input === "string") {
      // If it's a file path, prefer returning a public path if inside /public
      if (input.startsWith("http://") || input.startsWith("https://") || input.startsWith("/")) {
        return { secureUrl: input };
      }
      // For other relative paths, surface as-is
      return { secureUrl: input };
    }

    // If it's binary content, write to /public/generated and return the path
    const ext = opts?.localExt || "png";
    const fileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const outDir = path.join(process.cwd(), "public", "generated");
    await fs.mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, fileName);

    const buf =
      input instanceof Buffer
        ? input
        : input instanceof Blob
        ? Buffer.from(await input.arrayBuffer())
        : Buffer.from(input as ArrayBuffer);

    await fs.writeFile(outPath, buf);
    // Return as a public path for Next.js
    return { secureUrl: `/generated/${fileName}` };
  }

  // LIVE: upload to Cloudinary via unsigned upload
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const form = new FormData();
  form.set("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  if (opts?.folder) form.set("folder", opts.folder);
  if (opts?.publicId) form.set("public_id", opts.publicId);
  if (opts?.tags?.length) form.set("tags", opts.tags.join(","));
  if (typeof opts?.overwrite === "boolean") form.set("overwrite", String(opts.overwrite));

  if (typeof input === "string") {
    // URL or local path as string: let Cloudinary fetch remote URLs; local absolute paths won't work remotely
    form.set("file", input);
  } else if (input instanceof Blob) {
    form.set("file", input, (opts?.publicId || "upload") + ".png");
  } else {
    const buf =
      input instanceof Buffer ? input : Buffer.from(input as ArrayBuffer);
    // Convert to base64 data URI
    const b64 = buf.toString("base64");
    form.set("file", `data:image/png;base64,${b64}`);
  }

  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed (${res.status}): ${text || res.statusText}`);
  }

  const json = (await res.json()) as any;
  return {
    publicId: json.public_id,
    secureUrl: json.secure_url || json.url,
    width: json.width,
    height: json.height,
    bytes: json.bytes,
    format: json.format,
    createdAt: json.created_at,
    resourceType: json.resource_type,
    raw: json,
  };
}