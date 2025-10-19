import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

// Map template IDs or names to human-friendly style prompts.
// Keep labels flexible to match UI without changing its text.
const STYLE_TEMPLATES: Record<string, string> = {
  luxury: "Luxury premium product advertisement style",
  "Minimalist Studio": "Minimalist studio backdrop with soft, diffused lighting and clean shadows",
  "Outdoor Lifestyle": "Outdoor lifestyle scene with natural light, shallow depth of field, and tasteful props",
  Futuristi: "Futuristic high-tech set with sleek gradients, rim lighting, and reflective surfaces",
  "Fan Image": "Stylized fan-inspired setting that showcases the product in a relatable scene",
  "Studio Light": "Professional studio lighting with softboxes and subtle reflections on a neutral background",
};

/**
 * Upload a Base64 image (data URL) to Cloudinary unsigned upload endpoint.
 * Returns the secure_url string.
 */
async function uploadToCloudinary(base64DataUrl: string): Promise<string> {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "";
  const uploadPreset =
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    "";

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const fd = new FormData();
  fd.append("file", base64DataUrl);
  fd.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
    method: "POST",
    body: fd,
  });

  const json = await res.json().catch(() => ({} as any));
  if (!res.ok || !json?.secure_url) {
    const msg =
      (json && (json.error?.message || json.message)) ||
      "Cloudinary upload failed";
    throw new Error(msg);
  }
  return json.secure_url as string;
}

/**
 * Request body contract (multipart/form-data or JSON):
 * - images: string[] Cloudinary URLs of uploaded product images (1..5)
 * - prompt?: string custom user prompt
 * - template?: string selected template label or id
 * - count?: number desired number of output images (1..5)
 */
export async function POST(req: NextRequest) {
  try {
    // Accept both JSON and multipart
    let images: string[] = [];
    let prompt = "";
    let template = "";
    let count = 1;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await req.json().catch(() => null);
      images = Array.isArray(json?.images) ? json.images : [];
      prompt = typeof json?.prompt === "string" ? json.prompt : "";
      template = typeof json?.template === "string" ? json.template : "";
      const c = Number(json?.count);
      count = Number.isFinite(c) ? Math.max(1, Math.min(5, c)) : 1;
    } else {
      const form = await req.formData();
      const rawImages = form.getAll("images");
      images = rawImages
        .map((v) => (typeof v === "string" ? v : (v as any)?.toString?.()))
        .filter(Boolean) as string[];
      prompt = (form.get("prompt") as string) || "";
      template = (form.get("template") as string) || "";
      const c = Number((form.get("count") as string) || "1");
      count = Number.isFinite(c) ? Math.max(1, Math.min(5, c)) : 1;
    }

    if (!images.length) {
      return NextResponse.json(
        { error: "No product images provided. Upload at least one image." },
        { status: 400 }
      );
    }
    if (images.length > 5) {
      images = images.slice(0, 5);
    }

    // Build a combined style prompt without altering UI labels.
    const styleText =
      STYLE_TEMPLATES[template] ||
      STYLE_TEMPLATES[template.trim()] ||
      STYLE_TEMPLATES[template.toLowerCase()] ||
      "";
    const finalPrompt =
      [
        "Generate a premium-quality product image based on the provided product images.",
        styleText ? `Style: ${styleText}.` : "",
        prompt ? `Additional instructions: ${prompt}` : "",
        "Ensure the product remains the hero, with clean composition, tasteful lighting, and photorealistic rendering. No logos or text overlays. Keep backgrounds consistent with the chosen style.",
      ]
        .filter(Boolean)
        .join(" ");

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GOOGLE_API_KEY environment variable." },
        { status: 500 }
      );
    }

    // Gemini generateContent request with image_url parts and image response
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const parts: any[] = [{ text: finalPrompt }];
    for (const url of images) {
      parts.push({ fileData: { fileUri: url } });
    }

    const body = {
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      generationConfig: {
        // ask Gemini to return images
        responseMimeType: "image/png",
        candidateCount: count,
      },
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      const errMsg =
        (json && (json.error?.message || json.message)) ||
        `Gemini API error (${res.status})`;
      return NextResponse.json({ error: errMsg }, { status: 502 });
    }

    // Parse inline_data images from candidates
    const candidates = Array.isArray(json?.candidates) ? json.candidates : [];
    if (!candidates.length) {
      return NextResponse.json(
        { error: "No candidates returned from Gemini." },
        { status: 502 }
      );
    }

    const base64Images: string[] = [];
    for (const cand of candidates) {
      const parts = cand?.content?.parts || [];
      for (const p of parts) {
        const mimeType = p?.inline_data?.mime_type || p?.inline_data?.mimeType;
        const data = p?.inline_data?.data || p?.inline_data?.data64 || p?.inline_data?.bytes;
        if (mimeType && data && typeof data === "string" && mimeType.startsWith("image/")) {
          // Prefer PNG as requested, but accept any image/* returned
          const dataUrl = `data:${mimeType};base64,${data}`;
          base64Images.push(dataUrl);
        }
      }
    }

    if (!base64Images.length) {
      // Some Gemini responses may place image in a single part; attempt fallback
      // If still none, return error to surface debugging
      return NextResponse.json(
        { error: "Gemini did not return image data." },
        { status: 502 }
      );
    }

    // Upload each generated image to Cloudinary to get public URLs
    const urls: string[] = [];
    for (const dataUrl of base64Images.slice(0, Math.min(count, 5))) {
      try {
        const url = await uploadToCloudinary(dataUrl);
        urls.push(url);
      } catch (e: any) {
        // If one upload fails, continue with the rest to minimize latency impact
        console.error("Cloudinary upload error:", e?.message || e);
      }
    }

    if (!urls.length) {
      return NextResponse.json(
        { error: "Failed to upload generated images." },
        { status: 502 }
      );
    }

    return NextResponse.json({ urls }, { status: 200 });
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}