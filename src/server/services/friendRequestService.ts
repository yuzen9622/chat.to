import { supabase } from "@/app/lib/supabasedb";
import { FriendRequestInterface, friendStatus } from "@/types/type";

export const removeFriendRequest = async (userId: string, friendId: string) => {
  const { error } = await supabase
    .from("friends_requests")
    .delete()
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`
    );

  if (error) throw error;
};

export const deleteFriendRequestById = async (requestId: string) => {
  const { error } = await supabase
    .from("friend_request")
    .delete()
    .eq("id", requestId);
  if (error) throw error;
};

export const InsertFriendRequest = async (
  senderId: string,
  receiverId: string
): Promise<FriendRequestInterface> => {
  const { data, error } = await supabase
    .from("friends_requests")
    .insert([
      { receiver_id: receiverId, sender_id: senderId, status: "pending" },
    ])
    .select(
      "*,receiver_info:receiver_id(id,name,image),sender_info:sender_id(id,name,image)"
    )
    .limit(1)
    .single();
  if (error) throw error;
  return data;
};

export const selectUserFriendRequest = async (
  userId: string
): Promise<FriendRequestInterface[]> => {
  const { data, error } = await supabase
    .from("friends_requests")
    .select(
      "*,receiver_info:receiver_id(id,name,image),sender_info:sender_id(id,name,image)"
    )
    .or(`receiver_id.eq.${userId},sender_id.eq.${userId}`);

  if (error) throw error;
  return data;
};

export const updateFriendRequest = async (
  requestId: string,
  status: friendStatus
): Promise<FriendRequestInterface> => {
  const { data, error } = await supabase
    .from("friends_requests")
    .update({ status: status })
    .eq("id", requestId)
    .select(
      "*,receiver_info:receiver_id(id,name,image),sender_info:sender_id(id,name,image)"
    )
    .single();
  if (error) throw error;
  return data;
};
