import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authication" }, { status: 401 });
  try {
    const { id, text } = await request.json();

    const { error } = await supabase
      .from("messages")
      .update({ text })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json({});
  } catch (error) {
    console.log(error);
  }
}
