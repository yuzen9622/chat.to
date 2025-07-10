import { supabase } from "@/app/lib/supabasedb";
import { FriendInterface } from "@/types/type";

export const deleteFriend = async (userId: string, friendId: string) => {
  const { error } = await supabase
    .from("friends")
    .delete()
    .or(
      `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
    );
  if (error) throw error;
};

export const InsertFriend = async (
  friends: {
    user_id: string;
    friend_id: string;
    personal_room_id: string;
  }[]
): Promise<FriendInterface[]> => {
  const { data, error } = await supabase
    .from("friends")
    .upsert(friends)
    .select("*,user:users!friends_friend_id_fkey(id,name,image)");
  if (error) throw error;
  return data;
};

export const selectUserFriends = async (
  userId: string
): Promise<FriendInterface[]> => {
  const { data, error } = await supabase
    .from("friends")
    .select("*, user:users!friends_friend_id_fkey(id,name,image)")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
};
