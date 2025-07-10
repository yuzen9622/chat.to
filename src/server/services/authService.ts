import { supabase } from "@/app/lib/supabasedb";
import { UserInterface } from "@/types/type";

export const register = async (
  email: string,
  name: string,
  password: string,
  image?: string
): Promise<UserInterface> => {
  const { data, error } = await supabase
    .from("users")
    .insert([{ name, image, password, email }])
    .select("*")
    .single();
  if (error) throw error;
  return data;
};
