import { RoomInterface } from "@/types/type";
import { supabase } from "../supabasedb";

export const selectRoom = async (roomId: string): Promise<RoomInterface> => {
  const { data, error } = await supabase
    .from("rooms")
    .select("*, room_members(*)")
    .eq("id", roomId);

  if (error || !data) {
    throw error;
  }
  return data[0] as RoomInterface;
};

export const selectUserRooms = async (
  userId: string
): Promise<RoomInterface[]> => {
  const { data, error } = await supabase
    .from("room_members")
    .select("rooms(*,room_members(*,user:users(id,name,image)))")
    .eq("user_id", userId);
  if (error) {
    throw error;
  }
  if (!data) throw "No room select";

  const getRooms = data.map((d) => d.rooms) as unknown;
  return getRooms as RoomInterface[];
};

export const deletePersonalRoom = async (
  roomId: string,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from("room_members")
    .update({ is_deleted: true })
    .eq("room_id", roomId)
    .eq("user_id", userId);
  if (error) throw error;
};

export const deleteGroup = async (roomId: string, userId: string) => {
  const { error } = await supabase
    .from("room_members")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", userId);
  if (error) throw error;
};

export const insertRoom = async (
  roomName: string,
  roomType: string,
  roomImg: string
): Promise<RoomInterface> => {
  const { data, error } = await supabase
    .from("rooms")
    .insert([{ room_name: roomName, room_type: roomType, room_img: roomImg }])
    .select("*")
    .limit(1)
    .single();

  if (error) throw error;

  return data;
};

export const insertRoomMembers = async (
  roomMembers: { user_id: string; room_id: string }[]
) => {
  const { error } = await supabase.from("room_members").insert(roomMembers);
  if (error) throw error;
};
