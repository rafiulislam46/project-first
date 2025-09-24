import { NextResponse } from "next/server";
import { MODE } from "@/lib/config";
import { generateTryOnImages } from "./provider";

/**
 * Replicate prediction shape (partial, sufficient for typing without implicit any).
 */
interface ReplicatePrediction {
  id: string;
  version: string;
  status:
    | "starting"
    | "processing"
    | "succeeded"
    | "failed"
    | "canceled"
    | "queued";
  created_at?: string;
  started_at?: string | null;
  completed_at?: string | null;
  output?: unknown;
  error?: unknown;
  logs?: string | null;
  metrics?: Record<string, unknown>;
}

interface TryOnBody {
  human_img?: string;
  garm_img?: string;
  // Back-compat fields from existing route
  productImageUrl?: string;
  imageUrl?: string;
  prompt?: string;
}

/**
 * Try-on API.
 *
 * Modes:
 * - If body contains { human_img, garm_img }, call Replicate idm-vton and return the full response.
 * - Otherwise, preserve existing behavior for { productImageUrl, prompt? }.
 */
export async function POST(req: Request) {
  try {
    const body: TryOnBody = (await req.json().catch(() => null)) || {};

    // New Replicate Virtual Try-On path
    if (typeof body.human_img === "string" && typeof body.garm_img === "string") {
      const token = process.env.REPLICATE_API_TOKEN;
      if (!token) {
        return NextResponse.json(
          { error: "Missing REPLICATE_API_TOKEN on server" },
          { status: 500 }
        );
      }

      const version =
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
            human_img: body.human_img,
            garm_img: body.garm_img,
            garment_des: "test cloth",
            category: "upper_body",
          },
        }),
      });

      const data: ReplicatePrediction = (await resp.json()) as ReplicatePrediction;
      // Return full Replicate response regardless of status so the client can poll if needed.
      return NextResponse.json<ReplicatePrediction>(data, { status: resp.status });
    }

    // Legacy path preserved for compatibility with existing app features
    const productImageUrl: string | undefined =
      body.productImageUrl || body.imageUrl;
    const prompt: string | undefined = body.prompt;

    if (!productImageUrl) {
      // For compatibility, still return mock if missing in mock mode
      const base = "/demo/tryon";
      const demo = [1, 2, 3, 4, 5].map((i) => `${base}/${i}.svg`);
      return NextResponse.json({ urls: demo, mode: MODE });
    }

    const uploadFlag = String(process.env.UPLOAD_TO_CLOUDINARY || "1") !== "0";
    const saveFlag = String(process.env.SAVE_TO_SUPABASE || "1") !== "0";

    const urls = await generateTryOnImages({
      productImageUrl,
      prompt,
      upload: uploadFlag,
      saveAsset: saveFlag,
    });

    return NextResponse.json({ urls, mode: MODE });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : typeof e === "string" ? e : "unexpected_error";
    // Graceful fallback for legacy path
    const base = "/demo/tryon";
    const demo = [1, 2, 3, 4, 5].map((i) => `${base}/${i}.svg`);
    return NextResponse.json(
      { urls: demo, error: message, mode: MODE },
      { status: 200 }
    );
  }
}

/**
 * Optional: GET /api/tryon?id=... to poll a Replicate prediction by id without exposing the token.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Missing REPLICATE_API_TOKEN on server" },
      { status: 500 }
    );
  }

  const resp = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data: ReplicatePrediction = (await resp.json()) as ReplicatePrediction;
  return NextResponse.json<ReplicatePrediction>(data, { status: resp.status });
}