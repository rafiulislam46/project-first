// IMPORTANT: This module must be safe to import in client bundles.
// Do not import Node-only Cloudinary SDK on the client.

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Conditionally require the Cloudinary SDK only on the server.
let cloudinary: import("cloudinary").v2 | null = null;
if (typeof window === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { v2 } = require("cloudinary");
  cloudinary = v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });
}

/**
 * Helper to check Cloudinary environment variables without importing the SDK on the client.
 * Use this in both client and server code to decide whether uploads are available.
 */
export function checkCloudinaryConfig(): boolean {
  const hasUnsigned =
    !!(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  const hasSigned =
    !!(process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET);
  return hasUnsigned || hasSigned;
}

// Backward alias if other parts import hasCloudinary
export const hasCloudinary = checkCloudinaryConfig;

/**
 * Server-side signed upload from a Buffer.
 * Overloads:
 * - uploadImageBuffer(buffer, folder): Promise<any> (Cloudinary result)
 * - uploadImageBuffer(buffer, { folder?, formatHint? }): Promise<string> (secure URL)
 * Safe to import in client code, but will throw if called in the browser.
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string
): Promise<any>;
export async function uploadImageBuffer(
  buffer: Buffer,
  options: { folder?: string; formatHint?: string }
): Promise<string>;
export async function uploadImageBuffer(
  buffer: Buffer,
  folderOrOptions: string | { folder?: string; formatHint?: string } = "uploads"
): Promise<any> {
  if (!cloudinary) {
    throw new Error("uploadImageBuffer is server-only");
  }
  const folder =
    typeof folderOrOptions === "string"
      ? folderOrOptions || "uploads"
      : folderOrOptions.folder || "uploads";

  const result: any = await new Promise((resolve, reject) => {
    cloudinary!.uploader
      .upload_stream({ folder }, (error, res) => {
        if (error) return reject(error);
        resolve(res);
      })
      .end(buffer);
  });

  if (typeof folderOrOptions === "object") {
    return String(result?.secure_url || "");
  }
  return result;
}

/**
 * Upload an image to Cloudinary.
 * - In the browser: accepts a File and performs unsigned upload via upload preset.
 * - On the server: accepts a URL string and uses Cloudinary SDK to upload by URL.
 * Returns a normalized object { secureUrl }.
 */
export async function uploadImage(
  fileOrUrl: File | string,
  options?: {
    folder?: string;
    tags?: string[];
    overwrite?: boolean;
  }
): Promise<{ secureUrl: string }> {
  // Client/browser: File via unsigned upload preset
  if (typeof window !== "undefined") {
    if (!(fileOrUrl instanceof File)) {
      throw new Error("uploadImage in browser requires a File");
    }
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME ||
      "";
    const uploadPreset = CLOUDINARY_UPLOAD_PRESET || "";
    if (!cloudName || !uploadPreset) {
      throw new Error("Missing Cloudinary unsigned config");
    }

    const form = new FormData();
    form.append("file", fileOrUrl);
    form.append("upload_preset", uploadPreset);
    if (options?.folder) form.append("folder", options.folder);
    if (options?.tags?.length) form.append("tags", options.tags.join(","));
    if (typeof options?.overwrite === "boolean") {
      form.append("overwrite", String(options.overwrite));
    }

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      { method: "POST", body: form }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Cloudinary unsigned upload failed: ${text || res.status}`);
    }
    const data = await res.json().catch(() => ({}));
    return { secureUrl: String(data?.secure_url || "") };
  }

  // Server: URL via Cloudinary SDK if available, otherwise fetch and upload buffer
  const url = String(fileOrUrl);
  const folder = options?.folder || "uploads";
  if (cloudinary) {
    const result = await cloudinary.uploader.upload(url, {
      folder,
      tags: options?.tags,
      overwrite: options?.overwrite,
    } as any);
    return { secureUrl: String((result as any)?.secure_url || "") };
  }

  // Fallback: download and upload as buffer
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch image for upload: ${text || res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const secureUrl = await uploadImageBuffer(buf, { folder });
  return { secureUrl };
}