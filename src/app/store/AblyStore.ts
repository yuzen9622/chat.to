"use client";
import { create } from "zustand";
import { useEffect } from "react";
import { useChannel } from "ably/react";
import type { RealtimeChannel, PresenceMessage, Realtime } from "ably";
interface AblyState {
  channel: RealtimeChannel | null;
  room: RealtimeChannel | null;
  onlineUsers: PresenceMessage[];
  roomId: string | "default";
  ably: Realtime | null;
  setAbly: (ably: Realtime) => void;
  setRoomId: (id: string) => void;
  setOnlineUsers: (user: PresenceMessage[]) => void;
  setChannel: (channel: RealtimeChannel) => void;
  setRoom: (room: RealtimeChannel) => void;
}

export const useAblyStore = create<AblyState>((set) => ({
  channel: null,
  room: null,
  onlineUsers: [],
  ably: null,
  roomId: "default",
  setRoomId: (id: string) => {
    set({ roomId: id });
  },
  setAbly: (ably: Realtime) => set({ ably: ably }),
  setOnlineUsers: (user) => set({ onlineUsers: user }),
  setChannel: (channel: RealtimeChannel) => set({ channel }),
  setRoom: (room: RealtimeChannel) => set({ room }),
}));

export const useAblyChannel = (channelName: string) => {
  const { setChannel } = useAblyStore.getState();
  const { channel: newChannel } = useChannel(channelName);

  useEffect(() => {
    const setupChannel = async () => {
      try {
        await newChannel.attach();
        console.log("New channel attached");

        // 如果使用 token 驗證
        await newChannel.presence.enter();
        console.log("Entered presence");
        setChannel(newChannel);
      } catch (error) {
        console.error("Error setting up channel:", error);
      }
    };

    setupChannel();

    return () => {
      newChannel?.presence.leave();
    };
  }, [newChannel, setChannel]);

  return newChannel;
};

export const useAblyRoom = (roomName: string) => {
  const { setRoom } = useAblyStore.getState();

  const { channel: newChannel } = useChannel(roomName);

  useEffect(() => {
    if (!newChannel || !roomName) return;

    const setupChannel = async () => {
      try {
        await newChannel.attach();
        await newChannel.presence.enter();
        setRoom(newChannel);
      } catch (error) {
        console.error("Error setting up channel:", error);
      }
    };
    setupChannel();
    return () => {
      newChannel.presence.leave();
    };
  }, [newChannel, setRoom, roomName]);

  return newChannel;
};
