import { NoteInterface } from "@/types/type";
import { supabase } from "../../app/lib/supabasedb";
export const selectNote = async (
  userIds: string[]
): Promise<NoteInterface[]> => {
  const { data, error } = await supabase
    .from("user_note")
    .select("*,user:users(id,image,name)")
    .in("user_id", userIds)
    .order("created_at");
  if (error) throw error;
  return data;
};

export const updateNote = async (
  userId: string,
  text: string
): Promise<NoteInterface> => {
  const { data, error } = await supabase
    .from("user_note")
    .update([{ text }])
    .eq("user_id", userId)
    .select("*,user:users(id,image,name)")
    .single();
  if (error) throw error;
  return data;
};

export const insertNote = async (
  userId: string,
  text: string,
  isPublic: boolean
): Promise<NoteInterface> => {
  const { data, error } = await supabase
    .from("user_note")
    .insert([{ text, user_id: userId, public: isPublic }])
    .select("*")
    .single();
  if (error) throw error;
  return data;
};

export const deleteNote = async (noteId: number) => {
  const { error } = await supabase.from("user_note").delete().eq("id", noteId);
  if (error) throw error;
};
