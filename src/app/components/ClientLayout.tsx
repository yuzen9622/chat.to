"use client";
import React, { useEffect, useRef } from "react";
import { useChannel, usePresenceListener } from "ably/react";

import { useAblyStore } from "../store/AblyStore";

import SideBar from "./SideBar";
import { InboundMessage } from "ably";
import { useChatStore } from "../store/ChatStore";
import { useAuthStore } from "../store/AuthStore";
import moment from "moment";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import NotifyBar from "./NotifyBar";
import {
  MessageInterface,
  RoomMemberInterface,
  UserInterface,
} from "../lib/type";
import { useSession } from "next-auth/react";
moment.locale("zh-tw");
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setOnlineUsers, setChannel } = useAblyStore();
  const {
    setNotify,
    currentChat,
    setLastMessages,
    rooms,
    setRoom,
    lastMessages,
    setCurrentChat,
    setNewNotify,
  } = useChatStore();

  const { initialize, setFriendRequest, setFriends } = useAuthStore();
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

  useEffect(() => {
    if (!channel) return;
    return () => {
      channel.unsubscribe("tying");
    };
  }, [channel]);

  useEffect(() => {
    if (!channel) return;
    const handleNotify = (message: InboundMessage) => {
      const {
        action,
        newMessage,
      }: { action: string; newMessage: MessageInterface } = message.data;
      if (!rooms.some((r) => r.id === newMessage.room)) return;
      newMessage.status = "send";
      const lastMessage = lastMessages[newMessage.room];
      if (action === "send") {
        setLastMessages(newMessage);
        if (newMessage.room !== currentChat?.id) {
          setNewNotify({ type: "message", data: newMessage });
        }
      }
      if (action === "edit") {
        if (!lastMessage || lastMessage.id !== newMessage.id) return;
        setLastMessages(newMessage);
        if (newMessage.room !== currentChat?.id) {
          setNewNotify({ type: "message", data: newMessage });
        }
      }
      if (action === "delete") {
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

  useEffect(() => {
    if (!channel) return;
    const handleCreate = (message: InboundMessage) => {
      const { newRoom, newRoomMembers } = message.data;
      console.log(newRoomMembers, newRoom);
      if (!userId) return;

      setRoom((prev) => {
        if (
          !prev.some((roomInfo) => roomInfo.id === newRoom.id) &&
          newRoomMembers.includes(userId)
        ) {
          return [...prev, newRoom];
        }
        return prev;
      });
    };
    const handleJoin = (message: InboundMessage) => {
      const { newRoom } = message.data;
      if (!userId) return;
      if (
        !newRoom ||
        !newRoom.room_members.some(
          (m: RoomMemberInterface) => m.user_id === userId
        )
      )
        return;

      if (newRoom.id === currentChat?.id) {
        setCurrentChat(newRoom);
      }

      setRoom((prevRooms) => {
        if (!prevRooms.some((room) => room.id === newRoom.id)) {
          return [...prevRooms, newRoom];
        }
        return prevRooms.map((room) => {
          if (room.id === newRoom.id) {
            return newRoom;
          }
          return room;
        });
      });
    };

    const handleRoomAction = (message: InboundMessage) => {
      const { action } = message.data;
      if (action === "join") {
        handleJoin(message);
      } else if (action === "create") {
        handleCreate(message);
      }
    };
    channel.subscribe("room_action", handleRoomAction);
    return () => {
      channel.unsubscribe("room_action");
    };
  }, [channel, rooms, setRoom, userId, currentChat, setCurrentChat]);

  // useEffect(() => {
  //   if (!channel) return;
  //   const handleCreate = (message: InboundMessage) => {
  //     const room = message.data;
  //     console.log(room);

  //     setRoom((prev) => {
  //       if (prev.some((roomInfo) => roomInfo.id === room.id)) {
  //         return prev;
  //       }
  //       return [...prev, room];
  //     });
  //   };
  //   channel.subscribe("create_room", handleCreate);
  //   return () => {
  //     channel.unsubscribe("create_room");
  //   };
  // }, [channel, setRoom]);

  useEffect(() => {
    const handleFriendAction = (message: InboundMessage) => {
      const { action, data } = message.data;
      if (action === "request") {
        setFriendRequest((prev) => {
          const isExsist = prev.some((request) => request.id === data.id);
          if (isExsist) {
            return prev.map((fr) => (fr.id === data.id ? data : fr));
          }
          return [...prev, data];
        });
      } else if (action === "response") {
        setFriendRequest((prev) => {
          const newPrev = prev.map((request) => {
            if (request.id === data.id || data.status !== "accepted") {
              request.status = data.status;
            }
            return request;
          });
          return newPrev.filter((request) => request.status === "pending");
        });
        if (data.status !== "accepted") return;
        const currentFriend = data.friends.find(
          (friend: UserInterface) => friend.id !== userId
        );
        setFriends(currentFriend);
      } else if (action === "delete") {
        setFriends((prev) => {
          return prev.filter((f) => f.id !== data);
        });
      }
    };

    channel.subscribe("friend_action", handleFriendAction);
    return () => {
      channel.unsubscribe("friend_action");
    };
  }, [channel, setFriendRequest, userId, setFriends]);

  const { presenceData } = usePresenceListener("chatta-chat-channel");
  useEffect(() => {
    setOnlineUsers(presenceData);
  }, [presenceData, setOnlineUsers]);

  const isChatRoom = pathname.includes("/chat/");
  console.log(pathname);
  return (
    <div className="flex flex-col-reverse h-full overflow-hidden sm:flex-row">
      <NotifyBar />
      <div
        className={twMerge(
          "transition-all duration-200",
          isChatRoom && "hidden sm:block"
        )}
      >
        {!pathname.includes("/auth") && <SideBar />}
      </div>
      {children}
    </div>
  );
}
