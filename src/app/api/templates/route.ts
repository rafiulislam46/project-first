import { NextRequest } from "next/server";
import { db, json, badRequest } from "../_utils";

export async function GET() {
  const items = await db.listTemplates();
  return json({ items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.name) return badRequest("Missing name");
  const created = await db.createTemplate({
    name: body.name,
    category: body.category,
    refUrl: body.refUrl,
    thumb: body.thumb,
  });
  return json(created, 201);
}