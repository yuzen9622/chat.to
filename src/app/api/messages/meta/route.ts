import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });
  const { metaType, roomId } = await request.json();
  try {
    if (!metaType || !roomId) throw new Error("No meta type.");

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room", roomId)
      .eq("type", metaType)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
