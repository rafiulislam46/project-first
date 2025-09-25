import { NextRequest, NextResponse } from "next/server";

const PROMPT_MAP: Record<string, string> = {
  luxury: "Luxury Ad Style",
  minimal: "Minimal Background",
  lifestyle: "Lifestyle Scene",
  studio: "Clean Studio Shot",
  colorful: "Vibrant Color Pop",
  vintage: "Vintage Film Look",
  neon: "Neon Aesthetic",
  outdoor: "Outdoor Natural Light",
};

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const promptIdRaw = form.get("promptId");
    const file = form.get("file");

    const promptId =
      typeof promptIdRaw === "string" ? promptIdRaw : (promptIdRaw as any)?.toString?.() ?? "";
    const promptText = PROMPT_MAP[promptId] ?? "Luxury Ad Style";

    console.log("✅ API HIT /api/test-generate", {
      promptId,
      promptText,
      hasFile: !!file,
    });

    const apiKey = process.env.GOOGLE_API_KEY;

    // Make a best-effort call to Gemini 2.0 Flash; continue even if it fails.
    let geminiResponseJson: unknown = null;
    try {
      if (!apiKey) {
        console.warn("⚠️ Missing GOOGLE_API_KEY. Skipping Gemini API call.");
      } else {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const body = {
          contents: [
            {
              parts: [
                {
                  text: `Apply style: ${promptText} to the uploaded product image.`,
                },
              ],
            },
          ],
        };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          // avoid caching in edge/runtime
          cache: "no-store",
        });

        // Attempt to parse response JSON even on non-2xx to aid debugging.
        try {
          geminiResponseJson = await res.json();
        } catch {
          geminiResponseJson = { note: "No JSON body returned from Gemini." };
        }

        console.log("📝 Gemini API status:", res.status, res.statusText);
        console.log("📝 Gemini API response:", geminiResponseJson);
      }
    } catch (apiErr: any) {
      console.error("❌ Gemini API call error:", apiErr?.message ?? apiErr);
    }

    // Return a dummy placeholder URL so the frontend continues to work.
    return NextResponse.json({
      url: "https://dummyimage.com/600x400/000/fff&text=Gemini+OK",
    });
  } catch (err: any) {
    console.error("❌ API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}