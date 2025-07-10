import { UserInterface } from "@/types/type";
import { supabase } from "../../app/lib/supabasedb";

export const fetchUserInfo = async (userId: string): Promise<UserInterface> => {
  const { data, error } = await supabase
    .from("users")
    .select("id,image,name")
    .eq("id", userId);
  if (error) {
    console.log(error);
    throw error;
  }
  return data[0] as UserInterface;
};
