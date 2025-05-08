"use client";

import { supabase } from "@/app/lib/supabasedb";
import { useChatStore } from "@/app/store/ChatStore";
import { useEffect, useState } from "react";

export const useRoomUser = () => {
  const [users, setUsers] = useState<Record<
    string,
    { id: string; name: string; image: string }
  > | null>(null);
  const { currentMessage, setCurrentUsers, currentUser, currentChat } =
    useChatStore();
  useEffect(() => {
    const userSet = currentChat?.room_members.map((rm) => rm.user_id);
    if (!userSet) return;
    const catchedUser = currentUser.reduce((result, cu) => {
      if (userSet.includes(cu.id)) {
        result[cu.id] = cu;
      }
      return result;
    }, {} as Record<string, { id: string; name: string; image: string }>);
    if (catchedUser) {
      setUsers(catchedUser);
    }
  }, [currentUser, currentChat]);

  useEffect(() => {
    const fetchUsers = async () => {
      const userSet = currentChat?.room_members.map((rm) => rm.user_id);
      if (!userSet) return;
      const { data } = await supabase
        .from("users")
        .select("id,image,name")
        .in("id", userSet);
      if (!data || data.length == 0) return;
      const map = data.reduce((result, ru) => {
        result[ru.id] = ru;
        setCurrentUsers(ru);
        return result;
      }, {} as Record<string, { id: string; name: string; image: string }>);
      setUsers(map);
    };
    if (!users) {
      fetchUsers();
    }
  }, [currentMessage, setCurrentUsers, users, currentChat]);
  return users;
};
