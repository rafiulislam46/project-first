import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const incoming = await req.formData().catch(() => null);

    const fileField = incoming?.get("file");
    const base64Field = incoming?.get("base64");

    if (!fileField && !base64Field) {
      return NextResponse.json(
        { error: "Provide 'file' (File) or 'base64' (string) in form data" },
        { status: 400 }
      );
    }

    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      "";
    const uploadPreset =
      process.env.CLOUDINARY_UPLOAD_PRESET ||
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      "";

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        {
          error:
            "Missing Cloudinary configuration. Ensure CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET (or NEXT_PUBLIC_*) are set.",
        },
        { status: 500 }
      );
    }

    const data = new FormData();

    if (fileField instanceof File) {
      // Directly append the File from the request
      data.append("file", fileField);
    } else if (typeof base64Field === "string" && base64Field) {
      // Append the base64 data URI or raw base64 string directly
      data.append("file", base64Field);
    } else if (base64Field instanceof File) {
      // In case client sent the base64 as a File object
      data.append("file", base64Field);
    } else if (typeof fileField === "string" && fileField) {
      // If a URL or a base64 string was provided under 'file'
      data.append("file", fileField);
    } else {
      return NextResponse.json(
        { error: "Invalid 'file' or 'base64' provided" },
        { status: 400 }
      );
    }

    data.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: data,
    });

    const json = await res.json().catch(() => ({} as any));

    if (!res.ok) {
      const msg =
        (json && (json.error?.message || json.message)) ||
        "Cloudinary upload failed";
      return NextResponse.json({ error: msg }, { status: res.status || 500 });
    }

    return NextResponse.json({ secure_url: json.secure_url }, { status: 200 });
  } catch (error: any) {
    const message =
      typeof error?.message === "string" ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}