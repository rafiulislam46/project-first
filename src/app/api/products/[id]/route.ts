import { NextRequest } from "next/server";
import { db, json, badRequest, notFound } from "../../_utils";
import { promises as fs } from "fs";
import path from "path";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const item = await db.getProduct(params.id);
  if (!item) return notFound("Product not found");
  return json(item);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const patch = await req.json().catch(() => null);
  if (!patch) return badRequest("Invalid JSON");
  const updated = await db.updateProduct(params.id, patch);
  if (!updated) return notFound("Product not found");
  return json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const item = await db.getProduct(params.id);
  if (!item) return notFound("Product not found");
  // attempt to delete local file if inside /uploads
  try {
    if (item.imageUrl?.startsWith("/uploads/")) {
      const filepath = path.join(process.cwd(), "public", item.imageUrl);
      await fs.unlink(filepath).catch(() => {});
    }
  } catch {}
  const ok = await db.deleteProduct(params.id);
  if (!ok) return notFound("Product not found");
  return json({ ok: true });
}