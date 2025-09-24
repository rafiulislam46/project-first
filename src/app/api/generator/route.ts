import { NextResponse } from "next/server";

/**
 * POST /api/generator
 * Accepts either JSON or multipart/form-data with:
 * - human_img: URL of human/model image
 * - garm_img: URL of clothing image
 * Calls Replicate idm-vton and returns the prediction JSON.
 *
 * Always returns JSON and never throws.
 */
export async function POST(req: Request) {
  console.log("API /generator called");
  try {
    // Support both JSON and multipart forms
    let human_img: string | null = null;
    let garm_img: string | null = null;

    const contentType = (req.headers.get("content-type") || "").toLowerCase();
    if (contentType.includes("application/json")) {
      const body = (await req.json().catch(() => ({}))) as any;
      human_img = typeof body.human_img === "string" ? body.human_img : null;
      garm_img = typeof body.garm_img === "string" ? body.garm_img : null;
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      human_img = String(form.get("human_img") || "");
      garm_img = String(form.get("garm_img") || "");
      if (!human_img) human_img = null;
      if (!garm_img) garm_img = null;
    }

    if (!human_img || !garm_img) {
      return NextResponse.json(
        { error: "Missing human_img or garm_img" },
        { status: 400 }
      );
    }

    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      console.error("API /generator missing REPLICATE_API_TOKEN");
      return NextResponse.json(
        { error: "Server misconfigured: REPLICATE_API_TOKEN is missing" },
        { status: 500 }
      );
    }

    const version =
      process.env.REPLICATE_IDM_VTON_VERSION ||
      "0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985";

    const resp = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        version,
        input: {
          human_img,
          garm_img,
          garment_des: "virtual try-on",
          category: "upper_body",
        },
      }),
      cache: "no-store",
    });

    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (e: any) {
    console.error("API /generator unexpected error:", e);
    return NextResponse.json(
      { error: e?.message || "unexpected_error" },
      { status: 200 }
    );
  }
}

/**
 * GET /api/generator?id=...
 * Poll a prediction by id (proxy to Replicate) so token stays server-side.
 */
export async function GET(req: Request) {
  console.log("API /generator GET called");
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Server misconfigured: REPLICATE_API_TOKEN is missing" },
        { status: 500 }
      );
    }
    const resp = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (e: any) {
    console.error("API /generator GET unexpected error:", e);
    return NextResponse.json({ error: e?.message || "unexpected_error" }, { status: 200 });
  }
}