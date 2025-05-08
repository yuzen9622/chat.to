"use client";
import { RoomInterface } from "@/app/lib/type";
import { useChatStore } from "@/app/store/ChatStore";
import { useMemo } from "react";
export const useChatInfo = (
  currentChat: RoomInterface,

  userId: string
) => {
  const { currentUser } = useChatStore();

  const recipentUser = useMemo(() => {
    if (!currentChat || !userId) return null;
    const recipentId = currentChat.room_members.find(
      (id) => id.user_id !== userId
    );
    return recipentId;
  }, [currentChat, userId]);
  const displayName = useMemo(() => {
    if (!currentChat) return null;
    const user = currentUser.find((u) => u.id === recipentUser?.user_id);

    return currentChat.room_name === "" ? user?.name : currentChat.room_name;
  }, [currentChat, recipentUser, currentUser]);
  return { recipentUser, displayName };
};
