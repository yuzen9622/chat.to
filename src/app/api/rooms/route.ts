import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabasedb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
export async function GET() {
  const session = await getServerSession(authOptions);
  console.log(session);
  if (!session)
    return NextResponse.json({ error: "No Authentication" }, { status: 500 });
  const { data, error } = await supabase
    .from("room_members")
    .select("rooms(*, room_members(*))")
    .eq("user_id", session.userId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  const rooms = data.map((item) => item.rooms);

  return NextResponse.json(rooms, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { room_name } = await request.json();

  const { data, error } = await supabase.from("rooms").insert([{ room_name }]);
  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(data, { status: 200 });
  }
}
