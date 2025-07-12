import { ablyEventManager } from "@/app/lib/ably/ablyManager";
import { useChatStore } from "@/app/store/ChatStore";
import { ClientMessageInterface } from "@/types/type";
import { InboundMessage } from "ably";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export const useNotifyListener = () => {
  const {
    rooms,
    setLastMessages,
    setNewNotify,
    currentChat,
    lastMessages,
    setNotify,
  } = useChatStore();
  const userId = useSession()?.data?.userId;
  useEffect(() => {
    if (!ablyEventManager) return;
    const handleNotify = (message: InboundMessage) => {
      const {
        action,
        newMessage,
      }: { action: string; newMessage: ClientMessageInterface } = message.data;

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

      newMessage.status = "send";
      const lastMessage = lastMessages[newMessage.room];

      if (action === "send") {
        setLastMessages({ ...newMessage, isFetching: true });
        if (
          (newMessage.room !== currentChat?.id || !currentChat) &&
          newMessage.sender !== userId
        ) {
          setNewNotify({ type: "message", data: newMessage });
        }
      } else if (action === "edit") {
        if (!lastMessage || lastMessage.id !== newMessage.id) return;
        setLastMessages({ ...newMessage, isFetching: true });
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
    ablyEventManager.subscribe("notify", handleNotify);
    return () => {
      ablyEventManager.unsubscribe("notify", handleNotify);
    };
  }, [
    setNotify,
    userId,
    currentChat,
    setLastMessages,
    lastMessages,
    rooms,
    setNewNotify,
  ]);
};
