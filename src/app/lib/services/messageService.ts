import { ClientMessageInterface } from "@/types/type";
import { supabase } from "../supabasedb";

export const insertMessage = async (
  message: ClientMessageInterface
): Promise<ClientMessageInterface> => {
  const { data, error } = await supabase
    .from("messages")
    .insert([message])
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
    .select("*,reply(*)")
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
