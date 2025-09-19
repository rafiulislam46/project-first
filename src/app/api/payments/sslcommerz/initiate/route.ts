import { NextRequest } from "next/server";
import { json } from "../../../_utils";

/**
 * Initiate SSLCommerz payment.
 * In production, configure:
 * - SSLCZ_STORE_ID
 * - SSLCZ_STORE_PASSWD
 * - APP_BASE_URL (e.g., https://your-app.com)
 *
 * Returns { status, gateway_url? } or { status: "not_configured" }.
 */
export async function POST(req: NextRequest) {
  const storeId = process.env.SSLCZ_STORE_ID || "";
  const storePasswd = process.env.SSLCZ_STORE_PASSWD || "";
  const baseUrl = process.env.APP_BASE_URL || "";

  if (!storeId || !storePasswd || !baseUrl) {
    return json({ status: "not_configured" }, 200);
    }

  const body = await req.json().catch(() => ({}));
  const amount = Number(body?.amount || 19);
  const currency = (body?.currency || "BDT").toString();
  const cus_name = (body?.name || "Customer").toString();
  const cus_email = (body?.email || "customer@example.com").toString();

  const payload = {
    store_id: storeId,
    store_passwd: storePasswd,
    total_amount: amount,
    currency,
    tran_id: `tx_${Date.now()}`,
    success_url: `${baseUrl}/api/payments/sslcommerz/ipn`,
    fail_url: `${baseUrl}/api/payments/sslcommerz/ipn`,
    cancel_url: `${baseUrl}/api/payments/sslcommerz/ipn`,
    emi_option: 0,
    cus_name,
    cus_email,
    cus_add1: "N/A",
    cus_city: "N/A",
    cus_postcode: "0000",
    cus_country: "BD",
  };

  const endpoint = process.env.SSLCZ_MODE === "live"
    ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
    : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!data || !data.GatewayPageURL) {
      return json({ status: "error", details: data }, 200);
    }
    return json({ status: "ok", gateway_url: data.GatewayPageURL, tran_id: payload.tran_id }, 200);
  } catch (e) {
    return json({ status: "error", error: "network_error" }, 200);
  }
}