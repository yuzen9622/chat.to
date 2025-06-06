import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getToken } from "next-auth/jwt";

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

    const { data, error } = await supabase
      .from("rooms")
      .insert([{ room_name, room_type, room_img }])
      .select("*")
      .limit(1)
      .single();

    const roomMembers =
      room_members.map((id: string) => ({
        room_id: data.id,
        user_id: id,
      })) || [];
    roomMembers.push({ room_id: data.id, user_id: userId });

    if (error) {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }

    await supabase.from("room_members").insert(roomMembers);
    const { data: memberData, error: memberError } = await supabase
      .from("room_members")
      .select("rooms(*,room_members(*))")
      .eq("room_id", data.id)
      .eq("user_id", userId)
      .limit(1);

    if (memberError) {
      console.log(memberError);
      return NextResponse.json({ memberError }, { status: 500 });
    }

    return NextResponse.json(memberData[0].rooms, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};
