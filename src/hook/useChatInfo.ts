"use client";
import { RoomInterface } from "@/types/type";

import { useMemo } from "react";
export const useChatInfo = (
  currentChat: RoomInterface,

  userId: string
) => {
  const recipientUser = useMemo(() => {
    if (!currentChat || !userId) return null;
    const recipientId = currentChat.room_members.find(
      (id) => id.user_id !== userId
    );
    return recipientId?.user;
  }, [currentChat, userId]);

  const displayName = useMemo(() => {
    if (!currentChat) return null;

    return currentChat.room_name === ""
      ? recipientUser?.name
      : currentChat.room_name;
  }, [currentChat, recipientUser]);
  return { recipientUser, displayName };
};
