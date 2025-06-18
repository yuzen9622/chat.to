"use client"; // 表示這是一個 Client Component
import { RoomInterface } from "../../../../types/type";
import { ChannelProvider } from "ably/react";
import ChatRoom from "./ChatRoom";
import { useEffect } from "react";
import { useChatStore } from "../../../store/ChatStore";
import { useAblyStore } from "../../../store/AblyStore";

import ChatInfo from "./ChatInfo";
import { useSession } from "next-auth/react";
import { clearReadMessage, fetchRoomMessage } from "../../../lib/util";

export default function ChatRoomWrapper({
  room,
  roomId,
}: {
  room: RoomInterface;
  roomId: string;
}) {
  const {
    setCurrentChat,
    setCurrentMessage,
    cachedMessages,
    currentChat,
    setChatInfoOpen,
    setSidebarOpen,
  } = useChatStore();
  const { setRoomId } = useAblyStore();
  const userId = useSession()?.data?.userId;

  useEffect(() => {
    if (!room) return;

    setCurrentChat(room);

    const getRoomMessages = async () => {
      try {
        const data = await fetchRoomMessage(room.id, 0, 20);
        setCurrentMessage(() => data);
      } catch (error) {
        console.log(error);
      }
    };
    if (cachedMessages.get(room.id)) {
      const getCached = cachedMessages.get(room.id);
      if (getCached) {
        setCurrentMessage((prev) => {
          if (prev.length === 0) {
            return getCached;
          }
          return prev;
        });
      }
    }
    getRoomMessages();

    clearReadMessage(room.id);
    return () => {
      setCurrentChat(null);
    };
  }, [room, userId, setCurrentChat, setCurrentMessage, cachedMessages]);

  useEffect(() => {
    setRoomId(roomId);
    setChatInfoOpen(false);
    setSidebarOpen(false);

    return () => {
      setRoomId("");
    };
  }, [
    roomId,
    userId,
    setRoomId,
    setChatInfoOpen,
    setSidebarOpen,
    cachedMessages,
    setCurrentMessage,
  ]);

  return (
    <ChannelProvider channelName={roomId}>
      <ChatRoom roomId={roomId} />
      {currentChat && currentChat.id === roomId && <ChatInfo />}
    </ChannelProvider>
  );
}
