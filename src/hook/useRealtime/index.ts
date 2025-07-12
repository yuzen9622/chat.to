import { useFriendListener } from "./useFriendListener";

import { registerAblyListeners } from "@/app/lib/ably/ablyListener";
import { useEffect } from "react";
import { RealtimeChannel } from "ably";
import { useRoomListener } from "./useRoomListener";
import { useNotifyListener } from "./useNotifyListener";
import { useNoteListener } from "./useNoteListener";
import { useSignalListener } from "./useSignalListener";
import { useCallListener } from "./useCallListener";
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
