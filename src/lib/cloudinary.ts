// IMPORTANT: This module must be safe to import in client bundles.
// Do not import Node-only Cloudinary SDK here. Use only NEXT_PUBLIC_ envs.

export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

/**
 * Returns true if Cloudinary unsigned upload is configured.
 * Safe for both client and server bundles.
 */
export function hasCloudinary(): boolean {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}