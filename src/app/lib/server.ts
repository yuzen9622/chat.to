import { redis } from "./redis";
import { supabase } from "./supabasedb";
import { MessageInterface } from "./type";

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

    supabase.rpc("read", {
      room_id: roomId,
      user_id: userId,
    });
    const cachedMessage = (await redis.lrange(
      `room:${roomId}`,
      -21,
      -1
    )) as MessageInterface[];

    if (cachedMessage.length > 0) {
      return { room: data[0].rooms, messages: cachedMessage };
    }
    const { data: msgData, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("room", roomId)

      .order("created_at", { ascending: false })
      .range(0, 20);

    if (msgError) {
      console.error("Failed to fetch messages:", msgError);
      return { room: data[0].rooms, messages: [] };
    }
    msgData.reverse();
    const pipeline = redis.pipeline();
    msgData.forEach((msg) => pipeline.rpush(`room:${roomId}`, msg));
    pipeline.ltrim(`room:${roomId}`, -21, -1);
    pipeline.expire(`room:${roomId}`, 3600);
    await pipeline.exec();
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
