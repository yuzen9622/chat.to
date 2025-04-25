import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { room_id, user_id } = await req.json();
  try {
    const { error } = await supabase
      .from("room_members")
      .delete()
      .eq("room_id", room_id)
      .eq("user_id", user_id);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }
    return NextResponse.json({ success: true, error: null }, { status: 500 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 }
    );
  }
}
