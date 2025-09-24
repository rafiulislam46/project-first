import { v2 as cloudinary } from "cloudinary";

/**
 * Server-side Cloudinary configuration.
 * Ensures secrets are never exposed to client bundles.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadImageBuffer(buffer: Buffer, folder = "uploads") {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
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