"use client";
import React from "react";
import BadgeAvatar from "@/app/components/ui/Avatar";
import { Info } from "lucide-react";
import { useChatStore } from "@/app/store/ChatStore";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { useAblyStore } from "@/app/store/AblyStore";
import { twMerge } from "tailwind-merge";
import { useSession } from "next-auth/react";
import { useChatInfo } from "@/hook/useChatInfo";

export default function ChatHeader() {
  const { currentChat, sidebarOpen, setChatInfoOpen, chatInfoOpen } =
    useChatStore();
  const { onlineUsers } = useAblyStore();

  const userId = useSession()?.data?.userId;

  const { recipentUser, displayName } = useChatInfo(currentChat!, userId!);

  if (!currentChat) return null;
  return (
    <header className="box-border sticky top-0 flex items-center justify-between w-full p-2 backdrop-blur-3xl bg-white/50 dark:bg-transparent">
      <span className="flex items-center gap-2 w-fit">
        <Link
          href={"/chat"}
          className="text-center rounded-md sm:hidden hover:dark:bg-white/10"
        >
          <ChevronLeft
            className="dark:text-white text-stone-800"
            size={"30px"}
          />
        </Link>

        <span className="flex items-center">
          <button
            onClick={() => setChatInfoOpen(!sidebarOpen)}
            onTouchEnd={() => setChatInfoOpen(!sidebarOpen)}
            type="button"
          >
            {currentChat.room_type === "personal" ? (
              <BadgeAvatar
                user={recipentUser?.user_id}
                width={40}
                height={40}
              />
            ) : (
              <BadgeAvatar room={currentChat} width={40} height={40} />
            )}
          </button>
          <span
            className="flex flex-col pl-2 cursor-pointer"
            onClick={() => setChatInfoOpen(!sidebarOpen)}
            onTouchEnd={() => setChatInfoOpen(!sidebarOpen)}
          >
            <span className="flex space-x-1 text-lg font-medium text-stone-900 dark:text-white active:text-white/70">
              <p>{displayName}</p>

              {currentChat.room_type === "group" && (
                <p className="flex-shrink-0 ">
                  ({currentChat.room_members.length})
                </p>
              )}
            </span>
            {onlineUsers.some((item) =>
              currentChat?.room_members.some(
                (user) =>
                  user.user_id === item.clientId && user.user_id !== userId
              )
            ) && <span className="text-xs text-green-400">目前在線上</span>}
          </span>
        </span>
      </span>
      <button
        onClick={() => setChatInfoOpen(true)}
        className={twMerge(chatInfoOpen && "hidden")}
      >
        <Info className="text-gray-400 hover:dark:text-white hover:text-stone-800 " />
      </button>
    </header>
  );
}
