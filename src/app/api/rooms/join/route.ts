import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const token = await getToken({ req: req });

  try {
    const { users_id, room_id } = await req.json();
    if (!token)
      return NextResponse.json({ error: "No authication" }, { status: 401 });

    const roomMembers = users_id.map((uid: string) => ({
      room_id: room_id,
      user_id: uid,
    }));

    const { data, error } = await supabase
      .from("room_members")
      .insert(roomMembers)
      .select("*")
      .limit(1)
      .single();
    const { data: roomData, error: roomsError } = await supabase
      .from("room_members")
      .select("rooms(*,room_members(*))")
      .eq("room_id", data.room_id)
      .limit(1)
      .single();
    if (error || roomsError) {
      return NextResponse.json({ error, roomsError }, { status: 500 });
    }

    return NextResponse.json(roomData, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};
