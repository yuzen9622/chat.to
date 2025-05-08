"use client"; // 表示這是一個 Client Component
import { RoomInterface, MessageInterface } from "../lib/type";
import { ChannelProvider } from "ably/react";
import ChatRoom from "./ChatRoom";
import { useEffect } from "react";
import { useChatStore } from "../store/ChatStore";
import { useAblyStore } from "../store/AblyStore";

import ChatInfo from "./ChatInfo";
import { useSession } from "next-auth/react";
import { clearReadMessage } from "../lib/util";

export default function ChatRoomWrapper({
  room,
  messages,
  roomId,
}: {
  room: RoomInterface;
  messages: MessageInterface[];
  roomId: string;
}) {
  const {
    setCurrentChat,
    setCurrentMessage,
    currentChat,
    setChatInfoOpen,
    setSidebarOpen,
  } = useChatStore();
  const { setRoomId } = useAblyStore();
  const userId = useSession()?.data?.userId;

  useEffect(() => {
    if (!room || !messages) return;

    setCurrentChat(room);
    setCurrentMessage(() => messages);
    clearReadMessage(room.id);
    return () => {
      setCurrentChat(null);
    };
  }, [room, messages, userId, setCurrentChat, setCurrentMessage]);

  useEffect(() => {
    setRoomId(roomId);
    setChatInfoOpen(false);
    setSidebarOpen(false);
    return () => {
      setRoomId("");
    };
  }, [roomId, userId, setRoomId, setChatInfoOpen, setSidebarOpen]);

  return (
    <ChannelProvider channelName={roomId}>
      <ChatRoom roomId={roomId} />
      {currentChat && currentChat.id === roomId && <ChatInfo />}
    </ChannelProvider>
  );
}
