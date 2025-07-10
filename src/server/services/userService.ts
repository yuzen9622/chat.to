import { ProviderType, UserInterface } from "@/types/type";
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

export const findUserByEmail = async (
  email: string,
  provider: ProviderType
): Promise<UserInterface> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("provider", provider)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const queryUsers = async (
  query: string,
  userId: string
): Promise<UserInterface[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("id,email,name,image")
    .ilike("name", query)
    .neq("id", userId);
  if (error) throw error;
  return data;
};
