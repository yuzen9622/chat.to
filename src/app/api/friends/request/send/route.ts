import { InsertFriendRequest } from "@/server/services/friendRequestService";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });
  try {
    const { sender_id, receiver_id } = await request.json();

    const data = await InsertFriendRequest(sender_id, receiver_id);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}
