"use client";
import React, { useEffect, useState } from "react";
import BadgeAvatar from "./Avatar";
import { AlignLeft, Info } from "lucide-react";
import { useChatStore } from "../store/ChatStore";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { UserInterface } from "../lib/type";

import { useAblyStore } from "../store/AblyStore";
import { twMerge } from "tailwind-merge";
import { useSession } from "next-auth/react";

export default function ChatHeader() {
  const {
    currentChat,
    currentUser,
    sidebarOpen,
    setSidebarOpen,
    setChatInfoOpen,
    chatInfoOpen,
  } = useChatStore();
  const { onlineUsers } = useAblyStore();
  const [recipentUser, setRecipentUser] = useState<UserInterface | null>(null);
  const userId = useSession()?.data?.userId;
  useEffect(() => {
    if (!currentChat) return;
    const recipentId = currentChat.room_members.find(
      (id) => id.user_id !== userId!
    );
    const recipent =
      currentUser.find((user) => user.id === recipentId?.user_id) || null;
    setRecipentUser(recipent);
  }, [currentChat, currentUser, userId]);
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
        <button
          className={twMerge(
            "mr-2 lg:hidden max-sm:hidden p-1 rounded-md hover:dark:bg-white/10"
          )}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <AlignLeft className=" dark:text-white text-stone-800" size={25} />
        </button>
        <span className="flex items-center">
          <button
            onClick={() => setChatInfoOpen(!sidebarOpen)}
            onTouchEnd={() => setChatInfoOpen(!sidebarOpen)}
            type="button"
          >
            <BadgeAvatar room={currentChat} width={40} height={40} />
          </button>
          <span
            className="flex flex-col pl-2 cursor-pointer"
            onClick={() => setChatInfoOpen(!sidebarOpen)}
            onTouchEnd={() => setChatInfoOpen(!sidebarOpen)}
          >
            <span className="flex space-x-1 text-lg font-medium text-stone-900 dark:text-white active:text-white/70">
              <p>
                {currentChat &&
                  currentChat.room_name === "" &&
                  recipentUser?.name}
                {currentChat &&
                  currentChat.room_name !== "" &&
                  currentChat.room_name}
              </p>

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
        className={twMerge("xl:hidden", chatInfoOpen && "hidden")}
      >
        <Info className="text-gray-400 hover:dark:text-white hover:text-stone-800 " />
      </button>
    </header>
  );
}
