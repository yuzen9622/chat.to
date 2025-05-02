import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ error: "No authication" }, { status: 401 });
  }
  try {
    const { roomId } = await params;
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room", roomId)
      .order("created_at", { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
