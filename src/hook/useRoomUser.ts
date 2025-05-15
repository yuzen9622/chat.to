"use client";

import { useChatStore } from "@/app/store/ChatStore";
import { useMemo } from "react";

export const useRoomUser = () => {
  const { currentChat } = useChatStore();

  const roomUsers = useMemo(() => {
    if (!currentChat) return null;
    const roomInfo: Record<
      string,
      { id: string; name: string; image: string }
    > | null = {};

    currentChat.room_members.map((rm) => {
      if (rm.users) {
        roomInfo[rm.user_id] = rm.users;
      }
    });
    return roomInfo;
  }, [currentChat]);

  return roomUsers;
};
