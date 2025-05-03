"use client";
import React, { useEffect, useRef } from "react";
import { useChannel, usePresenceListener } from "ably/react";
import { useAblyStore } from "../store/AblyStore";
import SideBar from "./SideBar";
import { useAuthStore } from "../store/AuthStore";
import moment from "moment";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import NotifyBar from "./NotifyBar";
import { InboundMessage } from "ably";
import { useChatStore } from "../store/ChatStore";
import { useSession } from "next-auth/react";
import { MessageInterface } from "../lib/type";
import {
  useFriendListner,
  useNoteListner,
  useRoomActionListner,
} from "@/hook/hooks";

moment.locale("zh-tw");
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setOnlineUsers, setChannel } = useAblyStore();

  const { initialize } = useAuthStore();
  const { channel } = useChannel("chatta-chat-channel");
  const userId = useSession()?.data?.userId;
  const didRun = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    if (didRun.current) return;

    if (userId) {
      initialize(userId);
    }
    didRun.current = true;
  }, [userId, initialize]);

  useEffect(() => {
    setChannel(channel);

    channel.presence.enter();

    return () => {
      if (channel) {
        channel.presence.leave();
      }
    };
  }, [channel, setChannel]);

  useFriendListner(channel);
  useRoomActionListner(channel);
  const {
    rooms,
    setLastMessages,
    setNewNotify,
    currentChat,
    lastMessages,
    setNotify,
  } = useChatStore();

  useEffect(() => {
    if (!channel) return;
    const handleNotify = (message: InboundMessage) => {
      const {
        action,
        newMessage,
      }: { action: string; newMessage: MessageInterface } = message.data;
      console.log(newMessage, action);
      const messageRoom = rooms.find(
        (r) =>
          r.id === newMessage.room &&
          r.room_members.some((rm) => rm.user_id === userId)
      );
      if (
        !messageRoom ||
        messageRoom.room_members.find(
          (rm) => rm.user_id === userId && rm.is_deleted
        )
      ) {
        return;
      }
      console.log(newMessage, action);
      newMessage.status = "send";
      const lastMessage = lastMessages[newMessage.room];

      if (action === "send") {
        console.log(newMessage);
        setLastMessages(newMessage);
        if (newMessage.room !== currentChat?.id || !currentChat) {
          setNewNotify({ type: "message", data: newMessage });
        }
      } else if (action === "edit") {
        if (!lastMessage || lastMessage.id !== newMessage.id) return;
        setLastMessages(newMessage);
        if (newMessage.room !== currentChat?.id) {
          setNewNotify({ type: "message", data: newMessage });
        }
      } else if (action === "delete") {
        if (!lastMessage || lastMessage.id !== newMessage.id) return;
        setLastMessages({
          ...lastMessage,
          text: "已刪除訊息",
          status: "failed",
        });
      }
      if ((userId && newMessage.sender === userId) || !userId) {
        return;
      }

      setNotify((prevNotify) => {
        if (!userId) return prevNotify;

        if (action === "delete") {
          return prevNotify.filter((msg) => msg.id !== newMessage.id);
        }
        if (prevNotify.some((item) => item.id === newMessage.id)) {
          return prevNotify.map((msg) => {
            if (msg.id === newMessage.id) {
              return { ...msg, text: newMessage.text };
            }
            return msg;
          });
        }
        if (
          currentChat &&
          newMessage.room === currentChat.id &&
          action === "send" &&
          newMessage.is_read.some((read_user: string) => read_user !== userId)
        ) {
          const isRead = newMessage.is_read;
          isRead.push(userId);
          return [
            ...prevNotify,
            {
              ...newMessage,
              status: "send",
              is_read: isRead,
            },
          ];
        }
        if (action === "edit") {
          return prevNotify;
        }
        return [...prevNotify, { ...newMessage, status: "send" }];
      });
    };
    channel.subscribe("notify", handleNotify);
    return () => {
      channel.unsubscribe("notify");
    };
  }, [
    channel,
    setNotify,
    userId,
    currentChat,
    setLastMessages,
    lastMessages,
    rooms,
    setNewNotify,
  ]);
  useNoteListner(channel);

  const { presenceData } = usePresenceListener("chatta-chat-channel");
  useEffect(() => {
    setOnlineUsers(presenceData);
  }, [presenceData, setOnlineUsers]);

  const isChatRoom = pathname.includes("/chat/");
  return (
    <div className="flex flex-col-reverse w-full h-full overflow-hidden sm:flex-row">
      <NotifyBar />

      <div
        className={twMerge(
          "transition-all duration-200 ",
          isChatRoom && "hidden sm:block"
        )}
      >
        {!pathname.includes("/auth") && <SideBar />}
      </div>

      {children}
    </div>
  );
}
