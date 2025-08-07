"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  RiChat3Fill,
  RiChat3Line,
  RiHome5Fill,
  RiHome5Line,
  RiShakeHandsFill,
  RiShakeHandsLine,
} from "react-icons/ri";
import { twMerge } from "tailwind-merge";

import { useAuthStore } from "../store/AuthStore";
import { useChatStore } from "../store/ChatStore";
import BadgeAvatar from "./ui/Avatar/Avatar";
import ListItem from "./ui/ListItem";

export default function BarList() {
  const { friendRequests } = useAuthStore();
  const { notify } = useChatStore();
  const userId = useSession()?.data?.userId;
  const { data: session } = useSession();
  const roomNotifyCount = useMemo(() => {
    const isExist: string[] = [];
    notify.forEach((n) => {
      if (n.is_read.includes(userId ?? "")) return;
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

  const isActive = (href: string) => {
    if (href === "/") return pathName === "/";
    if (href === "/chat") return pathName.startsWith("/chat");
    return pathName.includes(href);
  };
  return (
    <>
      <ListItem href="/">
        {isActive("/") ? <RiHome5Fill size={25} /> : <RiHome5Line size={25} />}

        <span
          className={twMerge(
            "hidden   ",
            pathName.startsWith("/chat") ? "hidden " : "xl:block"
          )}
        >
          Home
        </span>
      </ListItem>
      <ListItem href="/chat" notify={roomNotifyCount}>
        {isActive("/chat") ? (
          <RiChat3Fill size={25} />
        ) : (
          <RiChat3Line size={25} />
        )}
        <span
          className={twMerge(
            "hidden  sm:hidden",
            pathName.startsWith("/chat") ? "hidden " : "xl:block"
          )}
        >
          Chats
        </span>
      </ListItem>
      <ListItem href="/friend" notify={FriendRequestCount}>
        {isActive("/friend") ? (
          <RiShakeHandsFill size={25} />
        ) : (
          <RiShakeHandsLine size={25} />
        )}
        <span
          className={twMerge(
            "hidden ",
            pathName.startsWith("/chat") ? "hidden " : "xl:block"
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
          href={`/profile/${session.userId}`}
          className="sm:hidden"
          // className="flex items-center justify-center w-full gap-2 p-2 rounded-md sm:hidden hover:bg-stone-900/5 hover:dark:bg-white/5"
        >
          <BadgeAvatar width={25} height={25} user={session.user} />
        </ListItem>
      )}
    </>
  );
}
