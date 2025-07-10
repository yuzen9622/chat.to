import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req: req });
  if (!token)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });
  const { id, name, email, image } = await req.json();
  try {
    const { error } = await supabase
      .from("users")
      .update({ email, name, image })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
