"use client";
import React, { useMemo } from "react";
import ListItem from "./ListItem";

import { House, MessageSquareMore, Users, Bell } from "lucide-react";
import { useAuthStore } from "../store/AuthStore";
import { useChatStore } from "../store/ChatStore";
import { useSession } from "next-auth/react";

export default function BarList() {
  const { friendRequests } = useAuthStore();
  const { notify } = useChatStore();
  const userId = useSession()?.data?.userId;
  const roomNotfiyCount = useMemo(() => {
    const isExist: string[] = [];
    notify.forEach((n) => {
      if (n.is_read.includes(userId!)) return;
      if (!isExist.find((r) => r === n.room)) {
        isExist.push(n.room);
      }
    });
    return isExist.length;
  }, [notify, userId]);
  return (
    <>
      <ListItem href="/">
        <House className="sm:mr-2" />
        <span className="hidden sm:block">Home</span>
      </ListItem>
      <ListItem href="/chat" notify={roomNotfiyCount}>
        <MessageSquareMore className="sm:mr-2" />
        <span className="hidden sm:block">Chats</span>
      </ListItem>
      <ListItem href="/friend" notify={friendRequests?.length}>
        <Users className="sm:mr-2" />
        <span className="hidden sm:block">Friends</span>
      </ListItem>
      <ListItem href="/notify">
        <Bell className="sm:mr-2" />
        <span className="hidden sm:block">Notify</span>
      </ListItem>
    </>
  );
}
