import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { metaType, roomId } = await request.json();
  try {
    if (!metaType || !roomId) throw new Error("No meta type.");

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room", roomId)
      .eq("type", metaType);

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
