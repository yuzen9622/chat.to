"use client";
import React, { useMemo } from "react";
import ListItem from "./ui/ListItem";

import { House, MessageSquareMore, Handshake } from "lucide-react";
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

  const FriendRequestCount = useMemo(() => {
    if (!friendRequests) return 0;
    return friendRequests.filter((fr) => fr.receiver_id === userId).length;
  }, [friendRequests, userId]);
  return (
    <>
      <ListItem href="/">
        <House />
        <span className="hidden sm:block">Home</span>
      </ListItem>
      <ListItem href="/chat" notify={roomNotfiyCount}>
        <MessageSquareMore />
        <span className="hidden sm:block">Chats</span>
      </ListItem>
      <ListItem href="/friend" notify={FriendRequestCount}>
        <Handshake />
        <span className="hidden sm:block">Friends</span>
      </ListItem>
      {/* <ListItem href="/notify">
        <Bell />
        <span className="hidden sm:block">Notify</span>
      </ListItem> */}
    </>
  );
}
