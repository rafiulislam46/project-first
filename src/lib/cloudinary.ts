"use server";

import { v2 as cloudinary } from "cloudinary";

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
 * Initialize Cloudinary SDK once (server-side)
 */
let cloudinaryConfigured = false;
function ensureCloudinaryConfig() {
  if (cloudinaryConfigured) return;
  if (CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY || undefined,
      api_secret: CLOUDINARY_API_SECRET || undefined,
      secure: true,
    });
    cloudinaryConfigured = true;
  }
}

/**
 * Whether Cloudinary is configured well enough to use uploads.
 * Accept either:
 * - unsigned uploads (cloud_name + upload_preset), or
 * - signed uploads (cloud_name + api_key + api_secret)
 */
export function hasCloudinary(): boolean {
  const hasUnsigned = !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
  const hasSigned = !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
  return hasUnsigned || hasSigned;
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
};

/**
 * Build a Cloudinary URL from a publicId or return input URL unchanged.
 * Uses official Cloudinary SDK url() helper.
 */
export function buildCloudinaryUrl(publicIdOrUrl: string, opts: TransformOptions = {}): string {
  const isFull = /^https?:\/\//i.test(publicIdOrUrl);
  if (isFull) return publicIdOrUrl;
  if (!CLOUDINARY_CLOUD_NAME) return publicIdOrUrl;

  ensureCloudinaryConfig();

  const transformation: any = {};
  if (opts.width) transformation.width = Math.round(opts.width);
  if (opts.height) transformation.height = Math.round(opts.height);
  if (opts.crop) transformation.crop = opts.crop;
  if (opts.gravity) transformation.gravity = opts.gravity;
  if (opts.quality) transformation.quality = opts.quality;

  const url = cloudinary.url(publicIdOrUrl, {
    secure: true,
    sign_url: false,
    resource_type: "image",
    transformation: [transformation],
    format: opts.format,
  });

  return url;
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
 * Helper to upload a raw image buffer via Cloudinary SDK.
 * Uses signed upload when API credentials exist, otherwise unsigned upload with preset.
 */
export async function uploadImageBuffer(
  buf: Buffer,
  opts?: {
    folder?: string;
    publicId?: string;
    tags?: string[];
    overwrite?: boolean;
    resource_type?: "image" | "auto";
    formatHint?: "png" | "jpg" | "jpeg" | "webp";
  }
): Promise<string> {
  if (!hasCloudinary()) {
    // If Cloudinary is not configured, return empty string to let caller handle error.
    return "";
  }

  ensureCloudinaryConfig();

  const common: Record<string, any> = {
    folder: opts?.folder,
    public_id: opts?.publicId,
    overwrite: typeof opts?.overwrite === "boolean" ? opts.overwrite : undefined,
    tags: opts?.tags?.length ? opts.tags.join(",") : undefined,
    resource_type: opts?.resource_type || "image",
  };

  const isSigned = !!(CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

  const result: any = await new Promise((resolve, reject) => {
    const cb = (error: any, res: any) => (error ? reject(error) : resolve(res));
    if (isSigned) {
      const stream = cloudinary.uploader.upload_stream(common, cb);
      stream.end(buf);
    } else {
      // unsigned upload requires upload_preset
      const stream = (cloudinary.uploader as any).unsigned_upload_stream(
        CLOUDINARY_UPLOAD_PRESET,
        common,
        cb
      );
      stream.end(buf);
    }
  });

  return String(result.secure_url || result.url || "");
}

/**
 * Upload an image (string URL or binary) via Cloudinary SDK.
 * Uses signed upload when API credentials exist, otherwise unsigned upload with preset.
 */
export async function uploadImage(
  input: string | Buffer | ArrayBuffer | Blob,
  opts?: {
    folder?: string;
    publicId?: string;
    tags?: string[];
    overwrite?: boolean;
  }
): Promise<UploadResult> {
  if (!hasCloudinary()) {
    // If not configured, passthrough strings; otherwise return empty.
    if (typeof input === "string") return { secureUrl: input };
    return { secureUrl: "" };
  }

  ensureCloudinaryConfig();

  const common: Record<string, any> = {
    folder: opts?.folder,
    public_id: opts?.publicId,
    overwrite: typeof opts?.overwrite === "boolean" ? opts.overwrite : undefined,
    tags: opts?.tags?.length ? opts.tags.join(",") : undefined,
    resource_type: "image",
  };

  const isSigned = !!(CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

  let result: any;

  if (typeof input === "string") {
    if (isSigned) {
      result = await cloudinary.uploader.upload(input, common);
    } else {
      // unsigned upload (remote URLs are supported)
      result = await (cloudinary.uploader as any).unsigned_upload(input, CLOUDINARY_UPLOAD_PRESET, common);
    }
  } else {
    const buf =
      input instanceof Buffer
        ? input
        : input instanceof Blob
        ? Buffer.from(await input.arrayBuffer())
        : Buffer.from(input as ArrayBuffer);

    result = await new Promise((resolve, reject) => {
      const cb = (error: any, res: any) => (error ? reject(error) : resolve(res));
      if (isSigned) {
        const stream = cloudinary.uploader.upload_stream(common, cb);
        stream.end(buf);
      } else {
        const stream = (cloudinary.uploader as any).unsigned_upload_stream(
          CLOUDINARY_UPLOAD_PRESET,
          common,
          cb
        );
        stream.end(buf);
      }
    });
  }

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url || result.url,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format,
    createdAt: result.created_at,
    resourceType: result.resource_type,
    raw: result,
  };
}