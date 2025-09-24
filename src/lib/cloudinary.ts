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
 * Server-side signed upload from a Buffer.
 * Safe to import in client code, but will throw if called in the browser.
 */
export async function uploadImageBuffer(buffer: Buffer, folder = "uploads") {
  if (!cloudinary) {
    throw new Error("uploadImageBuffer is server-only");
  }
  return new Promise((resolve, reject) => {
    cloudinary!.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(buffer);
  });
}

/**
 * Helper to check Cloudinary environment variables without importing the SDK on the client.
 * Use this in both client and server code to decide whether uploads are available.
 */
export function hasCloudinary(): boolean {
  const hasUnsigned =
    !!(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  const hasSigned =
    !!(process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET);
  return hasUnsigned || hasSigned;
}