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
    const fileResponse: Array<{ url: string; public_id: string }> = [];
    const files = formData.getAll("files") as File[];
    if (!files) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    for (const file of files) {
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
      fileResponse.push({
        url: uploadRes.secure_url,
        public_id: uploadRes.public_id,
      });
    }

    return NextResponse.json({ data: fileResponse }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}
