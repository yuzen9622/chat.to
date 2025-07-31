"use client";
import { useMemo } from 'react';

import type { RoomInterface } from "@/types/type";

export const useChatInfo = (
  currentChat: RoomInterface | null,

  userId: string
) => {
  const recipientUser = useMemo(() => {
    if (!currentChat || !userId) return void 0;
    const recipientId = currentChat.room_members.find(
      (id) => id.user_id !== userId
    );
    return recipientId ? recipientId.user : void 0;
  }, [currentChat, userId]);

  const displayName = useMemo(() => {
    if (!currentChat) return void 0;
    if (currentChat.room_type === "group") {
      const users = currentChat.room_members.map((rm) => rm.user.name);
      return currentChat.room_name === ""
        ? users.join(",")
        : currentChat.room_name;
    }
    return recipientUser?.name;
  }, [currentChat, recipientUser]);
  return { recipientUser, displayName };
};
