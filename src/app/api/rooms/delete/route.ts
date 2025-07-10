import {
  deleteGroup,
  deletePersonalRoom,
} from "@/app/lib/services/roomService";

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req: req });

  const { room_id, user_id, room_type } = await req.json();
  if (!token || token.sub !== user_id)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });

  try {
    if (room_type === "personal") {
      await deletePersonalRoom(room_id, user_id);
    } else {
      await deleteGroup(room_id, user_id);
    }

    return NextResponse.json({ success: true, error: null }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
