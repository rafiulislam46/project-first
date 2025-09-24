import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as { file?: string } | null;
    const file = body?.file;
    if (!file) {
      return NextResponse.json({ error: "Missing 'file' in request body" }, { status: 400 });
    }

    const result = await cloudinary.uploader.upload(file, {
      resource_type: "image",
    });

    return NextResponse.json({ url: result.secure_url }, { status: 200 });
  } catch (error: any) {
    const message = typeof error?.message === "string" ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}