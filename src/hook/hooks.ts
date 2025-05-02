"use client";
import { supabase } from "@/app/lib/supabasedb";
import { MessageInterface, NoteInterface, UserInterface } from "@/app/lib/type";
import { getAllUserById, roomSort } from "@/app/lib/util";
import { useAuthStore } from "@/app/store/AuthStore";
import { useChatStore } from "@/app/store/ChatStore";
import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { InboundMessage, RealtimeChannel } from "ably";
import { RoomMemberInterface } from "@/app/lib/type";

export const useLastMessage = (roomId: string) => {
  const { lastMessages, setLastMessages } = useChatStore();

  const [lastMessageFromDB, setLastMessageFromDB] =
    useState<MessageInterface | null>(null);
  const cachedMessage = useMemo(() => {
    return lastMessages[roomId];
  }, [lastMessages, roomId]);

  useEffect(() => {
    const fetchLastMessage = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("room", roomId)
        .eq("status", "send")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        setLastMessageFromDB(null);
        console.log("Error fetching last message:", error);
      }
      if (!data) return;
      setLastMessageFromDB(data);
      setLastMessages(data);
    };

    if (!cachedMessage || cachedMessage.status === "failed") {
      fetchLastMessage();
    }
    roomSort();
  }, [cachedMessage, setLastMessages, lastMessages, roomId]);

  return cachedMessage || lastMessageFromDB;
};

export const useRoomNotify = (roomId: string) => {
  const { notify, currentChat } = useChatStore();
  const user = useSession().data?.user;

  const roomNotify = useMemo(
    () =>
      notify.filter(
        (item) =>
          item.room === roomId &&
          user &&
          !item.is_read?.includes(user.id) &&
          item.sender !== user?.id &&
          currentChat?.id !== item.room
      ),
    [notify, currentChat, user, roomId]
  );
  return roomNotify.length;
};

export const useRoomUser = () => {
  const [users, setUsers] = useState<Record<
    string,
    { id: string; name: string; image: string }
  > | null>(null);
  const { currentMessage, setCurrentUsers, currentUser } = useChatStore();
  useEffect(() => {
    const userSet = [...new Set(currentMessage.map((msg) => msg.sender))];
    const catchedUser = currentUser.reduce((result, cu) => {
      if (userSet.includes(cu.id)) {
        result[cu.id] = cu;
      }
      return result;
    }, {} as Record<string, { id: string; name: string; image: string }>);
    setUsers(catchedUser);
  }, [currentUser, currentMessage]);

  useEffect(() => {
    const fetchUsers = async () => {
      const userSet = [...new Set(currentMessage.map((msg) => msg.sender))];
      const { data } = await supabase
        .from("users")
        .select("id,image,name")
        .in("id", userSet);
      if (!data) return;
      const map = data.reduce((result, ru) => {
        result[ru.id] = ru;
        setCurrentUsers(ru);
        return result;
      }, {} as Record<string, { id: string; name: string; image: string }>);
      setUsers(map);
    };
    fetchUsers();
  }, [currentMessage, setCurrentUsers]);
  return users;
};

export const useUserProfile = (userId: string | undefined) => {
  const [user, setUser] = useState<UserInterface | null>(null);
  const {
    currentUser,
    setCurrentUsers,
    onboardingUsers,
    addOnboardingUser,
    removeOnboardingUser,
  } = useChatStore();

  useEffect(() => {
    if (!userId || onboardingUsers.has(userId)) return;
    const cachedUser = currentUser.find((user) => user.id === userId);

    if (cachedUser) {
      setUser(cachedUser);
      return;
    }

    const fetchUser = async () => {
      try {
        addOnboardingUser(userId);

        const { data } = await supabase
          .from("users")
          .select("id,image,name")
          .eq("id", userId);
        if (data) {
          setCurrentUsers(data[0]);
          setUser(data[0]);
        }
      } catch (error) {
        console.log(error);
      } finally {
        removeOnboardingUser(userId);
      }
    };

    fetchUser();
  }, [
    userId,
    currentUser,
    setCurrentUsers,
    addOnboardingUser,
    removeOnboardingUser,
  ]);

  return user;
};

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
    const handleEdit = (message: InboundMessage) => {
      const { newRoom } = message.data;
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
      if (
        !rooms.some((r) => r.id === newMessage.room) ||
        rooms.some((r) =>
          r.room_members.some((rm) => rm.user_id === userId && rm.is_deleted)
        )
      ) {
        return;
      }

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
