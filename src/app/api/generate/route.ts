import { NextRequest } from "next/server";
import { json, badRequest } from "../_utils";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, hasCloudinary } from "@/lib/cloudinary";

/**
 * Upload API: accepts a File via NextRequest.formData() and uploads to Cloudinary unsigned upload.
 *
 * Request (multipart/form-data):
 * - file: File
 *
 * Response (JSON):
 * - { url: string } on success, otherwise { error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null);
    if (!formData) return badRequest("Invalid form data");

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return badRequest("No file provided");
    }

    if (!hasCloudinary()) {
      return json({ error: "Cloudinary is not configured" }, 500);
    }

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
      method: "POST",
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text().catch(() => "");
      return json({ error: `Cloudinary upload failed (${uploadRes.status}): ${text || uploadRes.statusText}` }, 502);
    }

    const uploaded: any = await uploadRes.json();
    const secureUrl = uploaded?.secure_url as string | undefined;

    if (!secureUrl) {
      return json({ error: "Cloudinary upload failed" }, 502);
    }

    return json({ url: secureUrl }, 200);
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Unexpected error";
    return json({ error: message }, 500);
  }
}