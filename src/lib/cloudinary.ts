/**
 * Helper to check Cloudinary environment variables without importing the SDK.
 * Use this in both client and server code to decide whether uploads are available.
 */
export function hasCloudinary(): boolean {
  // Client-side uses NEXT_PUBLIC_* only; server-side may also have signed credentials.
  const hasUnsigned = !!(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  const hasSigned = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  return hasUnsigned || hasSigned;
}