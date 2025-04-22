import { supabase } from "@/app/lib/supabasedb";
import { MessageInterface, UserInterface } from "@/app/lib/type";
import { roomSort } from "@/app/lib/util";
import { useAuthStore } from "@/app/store/AuthStore";
import { useChatStore } from "@/app/store/ChatStore";
import { useEffect, useState, useMemo } from "react";

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
  const { user } = useAuthStore();

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
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .limit(1)
          .single();
        if (error) {
          console.log(error);
        }
        if (data) {
          setCurrentUsers(data);
          setUser(data);
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
