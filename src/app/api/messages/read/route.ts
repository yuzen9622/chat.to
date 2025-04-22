import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const { roomId, userId } = await request.json();
  try {
    const { data, error } = await supabase.rpc("read", {
      room_id: roomId,
      user_id: userId,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};
