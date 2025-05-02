import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, roomId } = await req.json();

    const { error } = await supabase
      .from("room_members")
      .update({ is_deleted: false })
      .eq("user_id", userId)
      .eq("room_id", roomId);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
