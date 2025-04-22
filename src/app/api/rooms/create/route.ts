import { supabase } from "@/app/lib/supabasedb";
import { UserInterface } from "@/app/lib/type";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const POST = async (request: NextRequest) => {
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
      .eq("user_id", userId);

    console.log(memberData);

    if (memberError) {
      console.log(memberError);
      return NextResponse.json({ memberError }, { status: 500 });
    }
    const rooms = memberData.map((item) => item.rooms);
    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};
