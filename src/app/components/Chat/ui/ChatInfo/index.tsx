"use client";
import React from "react";
import { useChatStore } from "../../../../store/ChatStore";
import { useAblyStore } from "../../../../store/AblyStore";
import { X } from "lucide-react";
import BadgeAvatar from "@/app/components/ui/Avatar/Avatar";
import { twMerge } from "tailwind-merge";
import { useSession } from "next-auth/react";
import { useChatInfo } from "@/hook/useChatInfo";
import InfoMedia from "./InfoMedia";
import { RoomUserModal } from "./RoomUserModal";
import JoinUserModal from "./JoinUserModal";
import OutModal from "./OutModal";

export default function ChatInfo() {
  const { currentChat, chatInfoOpen, setChatInfoOpen } = useChatStore();
  const { onlineUsers } = useAblyStore();
  const userId = useSession()?.data?.userId;
  const { recipientUser, displayName } = useChatInfo(currentChat!, userId!);
  return (
    <div
      className={twMerge(
        "h-full overflow-hidden transition-all   animate-slide-in max-sm:w-full bg-gray-white/20 backdrop-blur-xl border-l      dark:border-white/10 w-80 hidden   absolute top-0 right-0  z-30   dark:bg-stone-800/90 ",
        chatInfoOpen && "flex flex-col overflow-hidden"
      )}
    >
      <button
        className="absolute top-4 right-2"
        onClick={() => setChatInfoOpen(false)}
      >
        <X className="text-gray-400 hover:dark:text-white" />
      </button>
      {currentChat && (
        <>
          <div className="flex flex-col items-center justify-center w-full gap-2 py-4 border-b dark:border-white/10">
            {currentChat.room_type === "personal" ? (
              <BadgeAvatar width={80} height={80} user={recipientUser!} />
            ) : (
              <BadgeAvatar width={80} height={80} room={currentChat!} />
            )}
            {onlineUsers.some((item) =>
              currentChat?.room_members.some(
                (user) =>
                  user.user_id === item.clientId && user.user_id !== userId
              )
            ) && <span className="text-xs text-green-400">目前在線上</span>}
            <span className="flex items-center justify-center w-10/12 max-w-full text-lg dark:text-white">
              <p className="truncate w-12/12">{displayName}</p>
              {currentChat.room_type === "group" && (
                <p className="flex-shrink-0 ml-1">
                  ({currentChat.room_members.length})
                </p>
              )}
            </span>
            <span className="flex justify-center w-full gap-2">
              <JoinUserModal currentChat={currentChat} />
              <RoomUserModal currentChat={currentChat} />
              <OutModal isOwner={currentChat.room_owner === userId} />
            </span>
          </div>
          <InfoMedia />
        </>
      )}
    </div>
  );
}
