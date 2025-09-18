import { NextRequest } from "next/server";
import { db, json, badRequest } from "../_utils";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

async function ensureUploadsDir() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch {}
}

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

  await ensureUploadsDir();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const hash = crypto.createHash("sha1").update(buffer).digest("hex").slice(0, 10);
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const filename = `${Date.now()}_${hash}.${ext}`;
  const filepath = path.join(uploadsDir, filename);
  await fs.writeFile(filepath, buffer);

  const url = `/uploads/${filename}`;
  const created = await db.createProduct({ name, imageUrl: url });
  return json(created, 201);
}