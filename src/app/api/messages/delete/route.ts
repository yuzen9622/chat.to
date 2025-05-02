import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getToken } from "next-auth/jwt";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authication" }, { status: 401 });
  try {
    const { id } = await request.json();
    console.log(id);
    const { data, error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id)
      .select("*");

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    if (data[0].meta_data) {
      await cloudinary.uploader.destroy(data[0].meta_data.public_id);
    }
    console.log(data);
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
