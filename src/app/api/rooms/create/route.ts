import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getToken } from "next-auth/jwt";
import { insertRoom, selectRoom } from "@/server/services/roomService";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const POST = async (request: NextRequest) => {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authication" }, { status: 401 });
  try {
    const { userId, room_name, room_type, room_members, room_img } =
      await request.json();

    const newRoom = await insertRoom(room_name, room_type, room_img);

    const roomMembers =
      room_members.map((id: string) => ({
        room_id: room.id,
        user_id: id,
      })) || [];

    roomMembers.push({ room_id: newRoom.id, user_id: userId });

    await supabase.from("room_members").insert(roomMembers);
    const room = await selectRoom(newRoom.id);

    return NextResponse.json(room, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};
