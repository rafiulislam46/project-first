import { NextRequest } from "next/server";
import { db, json, badRequest } from "../_utils";

export async function GET() {
  const items = await db.listModels();
  return json({ items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.name) return badRequest("Missing name");
  const created = await db.createModel({
    name: body.name,
    gender: body.gender,
    styles: Array.isArray(body.styles) ? body.styles : undefined,
  });
  return json(created, 201);
}