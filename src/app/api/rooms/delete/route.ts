import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req: req });

  const { room_id, user_id, room_type } = await req.json();
  if (!token || token.sub !== user_id)
    return NextResponse.json({ error: "No authication" }, { status: 401 });
  try {
    if (room_type === "personal") {
      const { error } = await supabase
        .from("room_members")
        .update({ is_deleted: true })
        .eq("room_id", room_id)
        .eq("user_id", user_id);
      if (error) {
        return NextResponse.json({ success: false, error }, { status: 500 });
      }
      return NextResponse.json({ success: true, error: null }, { status: 200 });
    }
    const { error } = await supabase
      .from("room_members")
      .delete()
      .eq("room_id", room_id)
      .eq("user_id", user_id);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }
    return NextResponse.json({ success: true, error: null }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 }
    );
  }
}
