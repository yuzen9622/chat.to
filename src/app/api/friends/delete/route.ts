import { removeFriendRequest } from "@/server/services/friendRequestService";
import { deleteFriend } from "@/server/services/friendService";

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });

  try {
    const { user_id, friend_id } = await request.json();

    await Promise.all([
      removeFriendRequest(user_id, friend_id),
      deleteFriend(user_id, friend_id),
    ]);

    return NextResponse.json({ success: true, error: null }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
