// Gemini 2.5 Flash integration (server-safe)
// Usage: import { genAI, modelName, runtime, generateAdVariants } from "@/lib/gemini"

import { GoogleGenerativeAI } from "@google/generative-ai";

// Required by project rules
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const modelName = "gemini-2.5-flash";
export const runtime = "nodejs";

/**
 * Generate up to 4 ad style prompts/variants using Gemini.
 * This does not create images itself; callers can pair results with image generation
 * or use Cloudinary overlays/backgrounds.
 */
export async function generateAdVariants(opts: {
  productName?: string;
  brand?: string;
  mode: "random" | "template" | "custom";
  templateName?: string;
  customPrompt?: string;
  count?: number; // 1-8 (enforced to 4 default for UI)
}): Promise<{ prompts: string[] }> {
  const count = Math.min(8, Math.max(1, Number(opts.count || 4)));

  const sys = [
    "You are a senior ad creative assistant.",
    "Return short, vivid visual directions for product ad images.",
    "No paragraphs. Each line is one concise scene. Avoid camera jargon.",
  ].join(" ");

  const user = (() => {
    const base =
      `Product: ${opts.productName || "Unknown product"}; Brand: ${opts.brand || "Brand"}; Mode: ${opts.mode}. `;
    if (opts.mode === "template") {
      return base + `Template: ${opts.templateName || "Premium Minimal"}. Generate ${count} cohesive variants.`;
    }
    if (opts.mode === "custom") {
      return base + `Custom style: ${opts.customPrompt || "sleek studio with soft gradient"}.
Generate exactly ${count} variants.`;
    }
    // random
    return base + `Generate exactly ${count} diverse variants with luxury, clean, and lifestyle angles.`;
  })();

  const model = genAI.getGenerativeModel({ model: modelName });
  const res = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: sys }] },
      { role: "user", parts: [{ text: user }] },
    ],
  });

  const text = res.response.text().trim();
  // Split into lines; sanitize empty
  const prompts = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, count);

  // Ensure we return exactly count items
  while (prompts.length < count) prompts.push("Premium studio with soft gradient and subtle rim light");
  return { prompts };
}