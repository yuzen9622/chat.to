"use client";

import { useMemo } from "react";

import { useChatStore } from "@/app/store/ChatStore";

export const useLastMessage = (roomId: string) => {
  const { lastMessages } = useChatStore();

  const cachedMessage = useMemo(() => {
    return lastMessages[roomId];
  }, [lastMessages, roomId]);

  return cachedMessage;
};
