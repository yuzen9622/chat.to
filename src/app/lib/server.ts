import { supabase } from "./supabasedb";

export const getRoomById = async (roomId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("room_members")
      .select("rooms(*, room_members(*))")
      .eq("user_id", userId)
      .eq("room_id", roomId)
      .limit(1);
    if (error || !data) {
      console.error("Room not found or user is not a member:", error);
      return { room: null, messages: [] };
    }

    const { data: msgData, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("room", roomId)

      .order("created_at", { ascending: false })
      .range(0, 20);

    if (msgError) {
      console.error("Failed to fetch messages:", msgError);
      return { room: data[0].rooms[0], messages: [] };
    }
    msgData.reverse();
    return { room: data[0].rooms, messages: msgData };
  } catch (error) {
    console.log(error);
    return { room: null, messages: [] };
  }
};

export const getReplyMessage = async (messageId: string) => {
  try {
    if (!messageId) return null;
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("id", messageId)
      .limit(1)
      .single();
    if (error) {
      return null;
    }
    return data;
  } catch (error) {
    console.log(error);
  }
};
