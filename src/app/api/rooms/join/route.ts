import { insertRoomMembers, selectRoom } from "@/app/lib/services/roomService";

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

    await insertRoomMembers(roomMembers);

    const room = await selectRoom(room_id);

    return NextResponse.json(room, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};
