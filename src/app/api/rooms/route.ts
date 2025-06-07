import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabasedb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getToken } from "next-auth/jwt";
import { RoomInterface } from "@/types/type";
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "No Authentication" }, { status: 500 });
  const { data, error } = await supabase
    .from("room_members")
    .select("rooms(*, room_members(*,user:users(id,name,image)))")
    .eq("user_id", session.userId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  const rooms = data.map((item) => item.rooms) as unknown;

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
  if (!token)
    return NextResponse.json({ error: "No authication" }, { status: 401 });
  const { room_name } = await request.json();

  const { data, error } = await supabase.from("rooms").insert([{ room_name }]);
  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(data, { status: 200 });
  }
}
