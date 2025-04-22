"use client"; // 表示這是一個 Client Component
import { RoomInterface, MessageInterface } from "../lib/type";
import { ChannelProvider } from "ably/react";
import ChatRoom from "./ChatRoom";
import { useEffect } from "react";
import { useChatStore } from "../store/ChatStore";
import { useAblyStore } from "../store/AblyStore";

import { readMessage } from "../lib/util";
import ChatInfo from "./ChatInfo";
import { useSession } from "next-auth/react";

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
    readMessage(room.id, userId!);
    setCurrentChat(room);
    setCurrentMessage(() => messages);
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
