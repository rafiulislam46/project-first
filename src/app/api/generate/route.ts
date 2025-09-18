import { NextRequest } from "next/server";
import { IS_MOCK } from "@/lib/config";
import { db, json, badRequest } from "../_utils";

/**
 * Trigger AI generation with chosen model/template/product/prompt
 * POST { modelId?, templateId?, productId?, productImageUrl?, prompt? }
 * Returns { jobId, status, images?[] }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const { modelId, templateId, productId, productImageUrl, prompt } = body;

  // resolve inputs
  let imageUrl = productImageUrl as string | undefined;
  if (productId && !imageUrl) {
    const product = await db.getProduct(productId);
    imageUrl = product?.imageUrl;
  }

  if (!imageUrl) {
    return badRequest("Missing product image (provide productId or productImageUrl)");
  }

  if (IS_MOCK) {
    // Return demo images to keep UI flow intact
    const base = "/demo/tryon";
    const images = [1, 2, 3, 4, 5].map((i) => `${base}/${i}.svg`);
    return json({ jobId: "mock-job", status: "completed", images });
  }

  // LIVE: call upstream model API if configured (pseudo implementation)
  const provider = process.env.GENERATE_PROVIDER || "";
  if (!provider) {
    return json({ jobId: "unconfigured", status: "not_configured" }, 501);
  }

  // Example shape; replace with actual provider integration
  // This keeps the contract RESTful without binding to a vendor.
  switch (provider.toLowerCase()) {
    case "replicate":
      // Expect REPLICATE_API_TOKEN and MODEL_VERSION
      if (!process.env.REPLICATE_API_TOKEN || !process.env.MODEL_VERSION) {
        return json({ jobId: "replicate", status: "not_configured" }, 501);
      }
      // NOTE: Implement async polling or webhooks as needed. For now, respond 202 accepted.
      return json(
        {
          jobId: `replicate_${Date.now()}`,
          status: "queued",
          provider: "replicate",
        },
        202
      );
    default:
      return json({ jobId: "unknown", status: "not_configured" }, 501);
  }
}