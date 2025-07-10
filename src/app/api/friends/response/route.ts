import { updateFriendRequest } from "@/server/services/friendRequestService";
import { InsertFriend } from "@/server/services/friendService";
import { findPrivateRoom } from "@/server/services/roomService";
import { getToken } from "next-auth/jwt";

import { NextRequest, NextResponse } from "next/server";
import { v4 as v4uuid } from "uuid";
export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });
  try {
    const { id, status } = await request.json();
    const data = await updateFriendRequest(id, status);

    if (status !== "accepted") {
      return NextResponse.json({}, { status: 200 });
    }

    const room = await findPrivateRoom(data.sender_id, data.receiver_id);

    const roomId = room ? room.room_id : v4uuid();

    const friendData = [
      {
        user_id: data.sender_id,
        friend_id: data.receiver_id,
        personal_room_id: roomId,
      },
      {
        user_id: data.receiver_id,
        friend_id: data.sender_id,
        personal_room_id: roomId,
      },
    ];

    const friends = await InsertFriend(friendData);

    return NextResponse.json(friends, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
