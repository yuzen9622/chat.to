"use client";
import {
  MessageInterface,
  NoteInterface,
  RoomInterface,
  UserInterface,
} from "@/app/lib/type";

import { useAuthStore } from "@/app/store/AuthStore";
import { useChatStore } from "@/app/store/ChatStore";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { InboundMessage, RealtimeChannel } from "ably";
import { RoomMemberInterface } from "@/app/lib/type";

export const useFriendListner = (channel: RealtimeChannel) => {
  const { setFriendRequest, setFriends } = useAuthStore();
  const userId = useSession().data?.userId;
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
};

export const useRoomActionListner = (channel: RealtimeChannel) => {
  const { setRoom, rooms, currentChat, setCurrentChat } = useChatStore();
  const userId = useSession()?.data?.userId;
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
      const { newRoom }: { newRoom: RoomInterface } = message.data;
      if (!userId) return;
      if (
        !newRoom ||
        !newRoom.room_members.some(
          (m: RoomMemberInterface) => m.user_id === userId
        ) ||
        newRoom.room_type === "personal"
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
    const handleEdit = (message: InboundMessage) => {
      const { newRoom }: { newRoom: RoomInterface } = message.data;
      console.log(newRoom);
      if (newRoom.id === currentChat?.id) {
        setCurrentChat(newRoom);
      }
      setRoom((prev) => {
        return prev.map((r) => {
          if (r.id === newRoom.id) {
            return newRoom;
          }
          return r;
        });
      });
    };
    const handleRoomAction = (message: InboundMessage) => {
      const { action } = message.data;
      if (action === "join") {
        handleJoin(message);
      } else if (action === "create") {
        handleCreate(message);
      } else if (action === "edit") {
        handleEdit(message);
      }
    };
    channel.subscribe("room_action", handleRoomAction);
    return () => {
      channel.unsubscribe("room_action");
    };
  }, [channel, rooms, setRoom, userId, currentChat, setCurrentChat]);
};

export const useNotifyListner = (channel: RealtimeChannel) => {
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
};

export const useNoteListner = (channel: RealtimeChannel) => {
  const { setFriendNote, friends } = useAuthStore();
  useEffect(() => {
    const handleNote = (message: InboundMessage) => {
      const { note }: { note: NoteInterface } = message.data;
      console.log(note);
      if (friends?.some((f) => f.id === note.user_id)) {
        setFriendNote((prev) => {
          if (!prev.some((n) => n.id === note.id)) {
            return [note, ...prev];
          }
          return prev.map((n) => (n.id === note.id ? note : n));
        });
      }
    };
    channel.subscribe("note_action", handleNote);

    return () => {
      channel.unsubscribe("note_action");
    };
  }, [channel, setFriendNote, friends]);
};

export const useUserListner = (channel: RealtimeChannel) => {
  const { setCurrentUsers, currentUser } = useChatStore();
  useEffect(() => {
    if (!channel) return;
    const handleUserChange = (message: InboundMessage) => {
      const { user }: { user: UserInterface } = message.data;
      if (!currentUser.find((cu) => cu.id === user.id)) return;
      setCurrentUsers(user);
    };
    channel.subscribe("user_action", handleUserChange);
    return () => {
      channel?.unsubscribe("user_action");
    };
  }, [channel, setCurrentUsers, currentUser]);
};
