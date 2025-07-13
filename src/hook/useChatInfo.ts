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
    if (currentChat.room_type) {
      const users = currentChat.room_members.map((rm) => rm.user.name);
      return currentChat.room_name === ""
        ? users.join(",")
        : currentChat.room_name;
    }
    return recipientUser?.name;
  }, [currentChat, recipientUser]);
  return { recipientUser, displayName };
};
