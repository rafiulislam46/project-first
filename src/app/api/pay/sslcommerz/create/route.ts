import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

function env(key: string, def = ""): string {
  const v = process.env[key];
  return v === undefined || v === null ? def : String(v);
}

export async function POST(_req: NextRequest) {
  const storeId = env("SSL_STORE_ID");
  const storePass = env("SSL_STORE_PASS");
  const mode = env("SSL_MODE", "sandbox");
  const baseUrl = env("NEXT_PUBLIC_BASE_URL") || env("BASE_URL") || "";

  if (!storeId || !storePass) {
    return NextResponse.json({ error: "Missing SSL_STORE_ID or SSL_STORE_PASS" }, { status: 500 });
  }
  if (!baseUrl) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_BASE_URL" }, { status: 500 });
  }

  const isSandbox = mode.toLowerCase() !== "live";
  const initUrl = isSandbox
    ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
    : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

  // Create a unique transaction id
  const tranId = `pro_${Date.now()}_${randomUUID().slice(0, 8)}`;

  // Build callback URLs
  const successUrl = `${baseUrl}/api/pay/sslcommerz/success`;
  const failUrl = `${baseUrl}/api/pay/sslcommerz/fail`;
  const cancelUrl = `${baseUrl}/api/pay/sslcommerz/cancel`;

  // Amount: ৳1000 (BDT)
  const totalAmount = "1000";
  const currency = "BDT";

  const payload = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePass,
    total_amount: totalAmount,
    currency,
    tran_id: tranId,
    success_url: successUrl,
    fail_url: failUrl,
    cancel_url: cancelUrl,

    // required customer fields
    cus_name: "Pro Subscriber",
    cus_email: "customer@example.com",
    cus_add1: "Dhaka",
    cus_city: "Dhaka",
    cus_postcode: "1212",
    cus_country: "Bangladesh",
    cus_phone: "01700000000",

    // product details
    shipping_method: "NO",
    num_of_item: "1",
    product_name: "Pro plan subscription",
    product_category: "Subscription",
    product_profile: "non-physical-goods",

    // options
    emi_option: "0",
  });

  try {
    const res = await fetch(initUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
      // SSLCommerz requires server-to-server call
      cache: "no-store",
    });

    const data = await res.json().catch(async () => {
      const text = await res.text();
      return { raw: text };
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to create session", details: data }, { status: 502 });
    }

    // Expected keys: status, sessionkey, GatewayPageURL, redirectGatewayURL, failedreason, etc.
    return NextResponse.json(
      {
        ok: true,
        tran_id: tranId,
        ...data,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: "Network error creating session", details: String(err?.message || err) }, { status: 500 });
  }
}