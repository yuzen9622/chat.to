import { supabase } from "./supabasedb";

export const getRoomById = async (roomId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("room_members")
      .select("rooms(*, room_members(*,users(id,name,image)))")
      .eq("user_id", userId)
      .eq("room_id", roomId)
      .limit(1);

    if (error || !data) {
      console.error("Room not found or user is not a member:", error);
      return { room: null };
    }

    supabase
      .rpc("read", {
        room_id: roomId,
        user_id: userId,
      })
      .then(({ error }) => console.log(error));

    const { data: msgData, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("room", roomId)

      .order("created_at", { ascending: false })
      .range(0, 20);

    if (msgError) {
      console.error("Failed to fetch messages:", msgError);
      return { room: data[0].rooms };
    }
    msgData.reverse();

    return { room: data[0].rooms };
  } catch (error) {
    console.log(error);
    return { room: null };
  }
};

export const getReplyMessage = async (messageId: string) => {
  try {
    if (!messageId) return null;
    const controller = new AbortController();
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .abortSignal(controller.signal)
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
