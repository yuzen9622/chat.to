import { ClientMessageInterface } from "@/types/type";
import { supabase } from "../../app/lib/supabasedb";
import { omit } from "lodash";
export const insertMessage = async (
  message: ClientMessageInterface
): Promise<ClientMessageInterface> => {
  const cleanedMessage = omit(message, ["sender_info"]);

  const { data, error } = await supabase
    .from("messages")
    .insert([cleanedMessage])
    .select("*,reply(*)")
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const selectMessages = async (
  roomId: string,
  start: number,
  end: number
): Promise<ClientMessageInterface[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*,reply(*),sender_info:users(id,name,image)")
    .eq("room", roomId)
    .order("created_at", { ascending: false })
    .range(start, end);
  if (error) throw error;

  return data || [];
};

export const deleteMessage = async (
  messageId: string
): Promise<ClientMessageInterface> => {
  const { data, error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId)
    .select("*");
  if (error) throw error;
  return data[0];
};

export const updateMessage = async (messageId: string, text: string) => {
  const { error } = await supabase
    .from("messages")
    .update({ text })
    .eq("id", messageId);
  if (error) throw error;
};

export const readMessage = async (roomId: string, userId: string) => {
  const { error } = await supabase.rpc("read", {
    room_id: roomId,
    user_id: userId,
  });
  if (error) throw error;
};
