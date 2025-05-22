"use client";
import React, { useMemo } from "react";
import ListItem from "./ui/ListItem";
import { House, Handshake, MessageCircleMore } from "lucide-react";
import { useAuthStore } from "../store/AuthStore";
import { useChatStore } from "../store/ChatStore";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import BadgeAvatar from "./ui/Avatar";

export default function BarList() {
  const { friendRequests } = useAuthStore();
  const { notify } = useChatStore();
  const userId = useSession()?.data?.userId;
  const { data: session } = useSession();
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
  const pathName = usePathname();
  console.log(pathName);
  return (
    <>
      <ListItem href="/">
        <House size={30} />
        <span
          className={twMerge(
            "hidden xl:block ",
            pathName.startsWith("/chat") && "hidden sm:hidden"
          )}
        >
          Home
        </span>
      </ListItem>
      <ListItem href="/chat" notify={roomNotfiyCount}>
        <MessageCircleMore size={30} />
        <span
          className={twMerge(
            "hidden xl:block",
            pathName.startsWith("/chat") && "hidden sm:hidden"
          )}
        >
          Chats
        </span>
      </ListItem>
      <ListItem href="/friend" notify={FriendRequestCount}>
        <Handshake size={30} />
        <span
          className={twMerge(
            "hidden xl:block",
            pathName.startsWith("/chat") && "hidden sm:hidden"
          )}
        >
          Friends
        </span>
      </ListItem>
      {/* <ListItem href="/notify">
        <Bell />
        <span className="hidden sm:block">Notify</span>
      </ListItem> */}
      {session?.user && (
        <ListItem
          href="/"
          className="sm:hidden"
          // className="flex items-center justify-center w-full gap-2 p-2 rounded-md sm:hidden hover:bg-stone-900/5 hover:dark:bg-white/5"
        >
          <BadgeAvatar width={30} height={30} user={session.userId} />
        </ListItem>
      )}
    </>
  );
}
