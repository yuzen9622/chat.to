"use client"; // 表示這是一個 Client Component
import { ChannelProvider } from 'ably/react';
import { useEffect } from 'react';

import { fetchRoomMessage } from '@/app/lib/api/message/messageApi';

import { clearReadMessage } from '../../../lib/util';
import { useAblyStore } from '../../../store/AblyStore';
import { useChatStore } from '../../../store/ChatStore';
import ChatInfo from './ChatInfo/index';
import ChatRoom from './ChatRoom';

import type { RoomInterface } from "../../../../types/type";
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
  }, [room, setCurrentChat, setCurrentMessage, cachedMessages]);

  useEffect(() => {
    setRoomId(roomId);
    setChatInfoOpen(false);
    setSidebarOpen(false);

    return () => {
      setRoomId("");
    };
  }, [roomId, setRoomId, setChatInfoOpen, setSidebarOpen]);

  return (
    <ChannelProvider channelName={roomId}>
      <ChatRoom roomId={roomId} />
      {currentChat && currentChat.id === roomId && <ChatInfo />}
    </ChannelProvider>
  );
}
