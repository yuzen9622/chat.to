"use client"; // 表示這是一個 Client Component
import { RoomInterface } from "../lib/type";
import { ChannelProvider } from "ably/react";
import ChatRoom from "./ChatRoom";
import { useEffect } from "react";
import { useChatStore } from "../store/ChatStore";
import { useAblyStore } from "../store/AblyStore";

import ChatInfo from "./ChatInfo";
import { useSession } from "next-auth/react";
import { clearReadMessage, fetchRoomMessage } from "../lib/util";

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
    currentChat,
    setChatInfoOpen,
    setSidebarOpen,
  } = useChatStore();
  const { setRoomId } = useAblyStore();
  const userId = useSession()?.data?.userId;

  // useEffect(() => {
  //   const getNewMessage = async () => {
  //     try {
  //       const newMessages = await fetchRoomMessage(roomId, 0, 20);
  //       if (newMessages) {
  //         setCurrentMessage(() => newMessages);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   getNewMessage();
  // }, [roomId, setCurrentMessage]);

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
    getRoomMessages();

    clearReadMessage(room.id);
    return () => {
      setCurrentChat(null);
    };
  }, [room, userId, setCurrentChat, setCurrentMessage]);

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
