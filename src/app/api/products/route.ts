import { NextRequest } from "next/server";
import { db, json, badRequest } from "../_utils";
import { hasCloudinary, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/lib/cloudinary";

export async function GET() {
  const items = await db.listProducts();
  return json({ items });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    // allow JSON create without file upload
    const body = await req.json().catch(() => null);
    if (!body || !body.imageUrl) return badRequest("Missing imageUrl");
    const created = await db.createProduct({ name: body.name, imageUrl: body.imageUrl });
    return json(created, 201);
  }

  if (!contentType.includes("multipart/form-data")) {
    return badRequest("Expected multipart/form-data or application/json");
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const name = String(form.get("name") || "");

  if (!file) return badRequest("Missing file");

  if (!hasCloudinary()) {
    return json({ error: "Cloudinary is not configured" }, 500);
  }

  // Upload directly to Cloudinary unsigned upload
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

  const created = await db.createProduct({ name, imageUrl: secureUrl });
  return json(created, 201);
}