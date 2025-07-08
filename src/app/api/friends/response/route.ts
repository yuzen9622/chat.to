import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";

import { NextRequest, NextResponse } from "next/server";
import { v4 as v4uuid } from "uuid";
export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });
  try {
    const { id, status } = await request.json();
    const { data, error } = await supabase
      .from("friends_requests")
      .update({ status: status })
      .eq("id", id)
      .select("*");

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    if (status !== "accepted") {
      return NextResponse.json({}, { status: 200 });
    }
    console.log(data);
    const { data: isExist, error: roomError } = await supabase.rpc(
      "find_private_room",
      { uid1: data[0].sender_id, uid2: data[0].receiver_id }
    );

    const room_id =
      isExist?.length && !roomError ? isExist[0]?.room_id : v4uuid();

    const friendData = [
      {
        user_id: data[0].sender_id,
        friend_id: data[0].receiver_id,
        personal_room_id: room_id,
      },
      {
        user_id: data[0].receiver_id,
        friend_id: data[0].sender_id,
        personal_room_id: room_id,
      },
    ];
    const { error: friendError } = await supabase
      .from("friends")
      .insert(friendData);

    await supabase
      .from("rooms")
      .insert([{ id: room_id, room_type: "personal" }]);

    if (friendError) {
      return NextResponse.json({ friendError }, { status: 500 });
    }

    const { data: users, error: userError } = await supabase
      .from("friends")
      .select("*, user:users!friends_friend_id_fkey(id,name,image)")
      .eq("personal_room_id", room_id);

    if (userError) {
      return NextResponse.json({ userError }, { status: 500 });
    }

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
