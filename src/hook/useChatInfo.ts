"use client";
import { RoomInterface } from "@/types/type";
import { useChatStore } from "@/app/store/ChatStore";
import { useMemo } from "react";
export const useChatInfo = (
  currentChat: RoomInterface,

  userId: string
) => {
  const { currentUser } = useChatStore();

  const recipientUser = useMemo(() => {
    if (!currentChat || !userId) return null;
    const recipientId = currentChat.room_members.find(
      (id) => id.user_id !== userId
    );
    return recipientId;
  }, [currentChat, userId]);
  const displayName = useMemo(() => {
    if (!currentChat) return null;
    const user = currentUser.find((u) => u.id === recipientUser?.user_id);

    return currentChat.room_name === "" ? user?.name : currentChat.room_name;
  }, [currentChat, recipientUser, currentUser]);
  return { recipientUser, displayName };
};
