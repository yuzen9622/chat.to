import type { RealtimeChannel } from "ably";
import { useEffect } from "react";

import { registerAblyListeners } from "@/app/lib/ably/ablyListener";

import { useCallListener } from "./useCallListener";
import { useFriendListener } from "./useFriendListener";
import { useNoteListener } from "./useNoteListener";
import { useNotifyListener } from "./useNotifyListener";
import { useRoomListener } from "./useRoomListener";
import { useSignalListener } from "./useSignalListener";
import { useTypingListener } from "./useTypingListener";

export const useRealtime = (channel: RealtimeChannel) => {
  useFriendListener();
  useRoomListener();
  useNotifyListener();
  useNoteListener();
  useTypingListener();

  useSignalListener(channel);
  useCallListener(channel);

  useEffect(() => {
    if (!channel) return;
    const cleanup = registerAblyListeners(channel);
    return () => cleanup(); // 清除訂閱
  }, [channel]);
};
