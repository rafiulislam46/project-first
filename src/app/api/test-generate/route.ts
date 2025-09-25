import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const promptId = form.get("promptId");
    const file = form.get("file");

    console.log("✅ API HIT /test-generate", {
      promptId,
      hasFile: !!file,
    });

    // Dummy image response (testing only)
    return NextResponse.json({
      url: "https://dummyimage.com/600x400/000/fff&text=Generated+OK",
    });
  } catch (err: any) {
    console.error("❌ API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}