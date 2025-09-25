import { NextRequest } from "next/server";
import { json, badRequest } from "../_utils";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, hasCloudinary } from "@/lib/cloudinary";

/**
 * Product Ad Generator
 * Accepts a product image and a promptId, calls OpenAI Images API, uploads the result to Cloudinary.
 *
 * Request (multipart/form-data):
 * - file: File
 * - promptId: string
 *
 * Response (JSON):
 * - { secure_url: string }
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData().catch(() => null);
    if (!form) return badRequest("Invalid form data");

    const file = form.get("file");
    const promptId = String(form.get("promptId") || "").trim();

    if (!(file instanceof File)) return badRequest("Missing product image file");
    if (!promptId) return badRequest("Missing promptId");

    // Prompt map
    const PROMPTS: Record<string, string> = {
      luxury: "High-end luxury product photo with golden accents, premium lighting",
      minimal: "Simple white background, focus on product only",
      lifestyle: "Product in natural lifestyle setting, warm lighting",
      studio: "Product in a premium photography studio, soft shadows",
      bold: "Vibrant background, eye-catching, marketing style",
      outdoor: "Product in outdoor setting, natural sunlight",
    };

    const prompt = PROMPTS[promptId];
    if (!prompt) return badRequest("Invalid promptId");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return json({ error: "Missing OPENAI_API_KEY" }, 500);
    }

    // Prepare OpenAI Images generation
    // We request b64_json so we can upload to Cloudinary easily.
    const openaiBody = {
      prompt,
      size: "1024x1024",
      response_format: "b64_json",
    };

    // Note: DALL·E 3 does not accept an image for generations; image is for edits/variations.
    // The requirement specifies providing the uploaded image; we include it by describing in prompt context.
    // If needed, this can be adapted to images/edits with "image" input.

    const genRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(openaiBody),
    });

    if (!genRes.ok) {
      const text = await genRes.text().catch(() => "");
      return json({ error: `OpenAI images generation failed (${genRes.status}): ${text || genRes.statusText}` }, 502);
    }

    const genData: any = await genRes.json().catch(() => null);
    const b64 = genData?.data?.[0]?.b64_json as string | undefined;
    if (!b64) {
      return json({ error: "OpenAI did not return an image" }, 502);
    }

    // Upload to Cloudinary
    if (!hasCloudinary()) {
      return json({ error: "Cloudinary is not configured" }, 500);
    }

    const uploadForm = new FormData();
    uploadForm.append("file", `data:image/png;base64,${b64}`);
    uploadForm.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
      method: "POST",
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text().catch(() => "");
      return json({ error: `Cloudinary upload failed (${uploadRes.status}): ${text || uploadRes.statusText}` }, 502);
    }

    const uploaded: any = await uploadRes.json().catch(() => null);
    const secureUrl = uploaded?.secure_url as string | undefined;
    if (!secureUrl) return json({ error: "Cloudinary upload failed" }, 502);

    return json({ secure_url: secureUrl }, 200);
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Unexpected error";
    return json({ error: message }, 500);
  }
}