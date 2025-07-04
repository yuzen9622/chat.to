import { selectRoom } from "@/app/lib/services/roomService";
import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { roomId, userId, room_type, friendId } = await request.json();
  try {
    if (room_type === "personal") {
      const { data: isExist, error: roomError } = await supabase.rpc(
        "find_private_room",
        { uid1: userId, uid2: friendId }
      );

      if (isExist?.length > 0 && !roomError) {
        await supabase
          .from("room_members")
          .update({ is_deleted: false })
          .eq("room_id", isExist[0].room_id)
          .eq("user_id", userId);

        const room = await selectRoom(isExist[0].room_id);

        if (room) return NextResponse.json(room, { status: 200 });
      } else {
        const { error } = await supabase.from("room_members").upsert(
          [
            { room_id: roomId, user_id: userId },
            { room_id: roomId, user_id: friendId },
          ],
          {
            onConflict: "room_id, user_id",
          }
        );
        const room = await selectRoom(roomId);

        if (error) {
          return NextResponse.json({ error }, { status: 500 });
        }
        if (room) return NextResponse.json(room, { status: 200 });
      }
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
