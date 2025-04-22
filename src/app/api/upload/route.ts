import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const base64File = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64File}`;
    let resourceType: "image" | "video" | "raw" = "image";
    if (file.type.startsWith("video/") || file.type.startsWith("audio")) {
      resourceType = "video";
    } else if (!file.type.startsWith("image/")) {
      resourceType = "raw";
    }
    const uploadRes = await cloudinary.uploader.upload(dataUri, {
      folder: "chat-app",
      resource_type: resourceType,
    });

    return NextResponse.json(
      { url: uploadRes.secure_url, public_id: uploadRes.public_id },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}
