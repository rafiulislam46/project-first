import { NextRequest } from "next/server";
import { json, badRequest } from "../_utils";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, hasCloudinary } from "@/lib/cloudinary";

/**
 * Product Ad Generator
 * Accepts a product image and a promptId, calls Google AI Studio (Gemini) multimodal generateContent,
 * uploads the returned image to Cloudinary and returns the secure_url.
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

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return json({ error: "Missing GOOGLE_API_KEY" }, 500);
    }

    // Read the uploaded image as base64 (required by Gemini inline_data)
    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const b64Input = buffer.toString("base64");
    const mimeType = (file as File).type || "image/png";

    // Gemini generateContent with image+text, requesting an image response
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `Create a single product advertisement image based on this product photo and the style: ${prompt}` },
            {
              inline_data: {
                mime_type: mimeType,
                data: b64Input,
              },
            },
          ],
        },
      ],
      // Ask for binary image output
      generationConfig: {
        response_mime_type: "image/png",
        // Optional, tune size/quality if supported by the model/version. Keeping defaults.
      },
    };

    const genRes = await fetch(geminiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!genRes.ok) {
      const text = await genRes.text().catch(() => "");
      return json({ error: `Gemini generation failed (${genRes.status}): ${text || genRes.statusText}` }, 502);
    }

    const genData: any = await genRes.json().catch(() => null);

    // Gemini returns image bytes in candidates[0].content.parts[].inline_data.data when response_mime_type is image/*
    const candidates = genData?.candidates;
    const parts = candidates?.[0]?.content?.parts || [];
    let outputB64: string | undefined;
    for (const p of parts) {
      const data = p?.inline_data?.data;
      if (typeof data === "string" && data.length > 0) {
        outputB64 = data;
        break;
      }
    }
    if (!outputB64) {
      return json({ error: "Gemini did not return an image" }, 502);
    }

    // Upload to Cloudinary
    if (!hasCloudinary()) {
      return json({ error: "Cloudinary is not configured" }, 500);
    }

    const uploadForm = new FormData();
    uploadForm.append("file", `data:image/png;base64,${outputB64}`);
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