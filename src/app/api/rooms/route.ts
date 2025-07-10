import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabasedb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getToken } from "next-auth/jwt";
import { RoomInterface } from "@/types/type";
import { selectRoom, selectUserRooms } from "@/server/services/roomService";
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "No Authentication" }, { status: 500 });
  const rooms = await selectUserRooms(session.user.id);

  const roomIds = (rooms as RoomInterface[]).map(
    (room: RoomInterface) => room?.id
  ) as string[];

  const { data: lastMessages, error: msgError } = await supabase.rpc(
    "get_last_messages",
    { room_ids: roomIds }
  );

  if (msgError)
    return NextResponse.json({ error: msgError.message }, { status: 500 });

  return NextResponse.json({ rooms, lastMessages }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (token)
    return NextResponse.json({ error: "No authication" }, { status: 401 });
  try {
    const { room_id } = await request.json();
    const room = await selectRoom(room_id);

    return NextResponse.json(room, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
