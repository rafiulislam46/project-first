import { NextRequest } from "next/server";
import { json } from "../../../_utils";

/**
 * SSLCommerz IPN/Redirect handler (success/fail/cancel).
 * Persist a basic transaction record to .data for admin viewing.
 */
import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), ".data");
const txFile = path.join(dataDir, "transactions.json");

async function appendTx(record: any) {
  await fs.mkdir(dataDir, { recursive: true }).catch(() => {});
  let current: any[] = [];
  try {
    const raw = await fs.readFile(txFile, "utf8");
    current = JSON.parse(raw);
    if (!Array.isArray(current)) current = [];
  } catch {}
  current.push({ ...record, receivedAt: Date.now() });
  await fs.writeFile(txFile, JSON.stringify(current, null, 2), "utf8");
}

export async function POST(req: NextRequest) {
  let body: any = null;
  try {
    // SSLCommerz posts form-encoded; NextRequest.formData can parse
    const form = await req.formData().catch(() => null);
    if (form) {
      body = Object.fromEntries(form as any);
    } else {
      body = await req.json().catch(() => ({}));
    }
  } catch {
    body = {};
  }

  // Persist a simple record; real implementation should verify hash with store_passwd
  await appendTx({
    gateway: "sslcommerz",
    data: body,
    ip: req.ip || req.headers.get("x-forwarded-for") || "unknown",
  });

  // For simplicity return JSON (in production, redirect user to a status page)
  return json({ status: "received" }, 200);
}