import { NextRequest } from "next/server";
import { db, json, badRequest, notFound } from "../../_utils";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const item = await db.getTemplate(params.id);
  if (!item) return notFound("Template not found");
  return json(item);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const patch = await req.json().catch(() => null);
  if (!patch) return badRequest("Invalid JSON");
  const updated = await db.updateTemplate(params.id, patch);
  if (!updated) return notFound("Template not found");
  return json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const ok = await db.deleteTemplate(params.id);
  if (!ok) return notFound("Template not found");
  return json({ ok: true });
}