import { NextResponse } from "next/server";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, hasCloudinary } from "@/lib/cloudinary";

/**
 * POST /api/generator
 * Dual-mode:
 * - If multipart/form-data with "file" is provided, uploads to Cloudinary unsigned endpoint and returns { url }.
 * - Otherwise expects JSON or multipart values for idm-vton (human_img, garm_img) and proxies to Replicate.
 *
 * Always returns JSON and never throws.
 */
export async function POST(req: Request) {
  console.log("API /generator called");
  try {
    const contentType = (req.headers.get("content-type") || "").toLowerCase();

    // Branch 1: Cloudinary upload when a file is posted
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (file instanceof File) {
        if (!hasCloudinary()) {
          return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
        }
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        uploadForm.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
          method: "POST",
          body: uploadForm,
        });
        const uploaded = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok) {
          return NextResponse.json(
            { error: uploaded?.error?.message || uploadRes.statusText || "Cloudinary upload failed" },
            { status: 502 }
          );
        }
        const url = uploaded?.secure_url;
        if (!url) {
          return NextResponse.json({ error: "Cloudinary upload failed" }, { status: 502 });
        }
        return NextResponse.json({ url }, { status: 200 });
      }
    }

    // Branch 2: Replicate idm-vton when URLs are provided
    // Support both JSON and multipart forms without files
    let human_img: string | null = null;
    let garm_img: string | null = null;

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