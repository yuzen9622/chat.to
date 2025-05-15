"use client";
import * as React from "react";
import { useMemo } from "react";
import BadgeAvatar from "./Avatar";
import { LinkHTMLAttributes } from "react";
import { usePathname } from "next/navigation";
import { RoomInterface } from "../../../types/type";
import { useChatInfo } from "@/hook/useChatInfo";
import { useLastMessage } from "@/hook/useLastMessage";
import { useRoomNotify } from "@/hook/useRoomNotify";
import { messageType } from "../../lib/util";
import { TimeAgo } from "../TimeAgo";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

import { useSession } from "next-auth/react";
type ButtonProps = LinkHTMLAttributes<HTMLAnchorElement>;
export default function ChatButton({
  room,
  ...props
}: { room: RoomInterface } & ButtonProps) {
  const pathname = usePathname();
  const lastMessage = useLastMessage(room.id);

  const roomNotify = useRoomNotify(room.id);
  const user = useSession().data?.user;
  const isActive = pathname === `/chat/${room.id}`;

  const userId = useSession()?.data?.userId;

  const { recipentUser, displayName } = useChatInfo(room, userId!);

  const messageContent = useMemo(() => {
    if (!lastMessage) return null;
    if (lastMessage.status === "pending") return "傳送中...";
    const type = {
      image: "傳送圖片",
      video: "傳送影片",
      file: "傳送檔案",
      audio: "傳送語音",
    };
    const msgType = messageType(lastMessage.meta_data!);

    return msgType ? type[msgType] : lastMessage.text;
  }, [lastMessage]);

  if (
    room.room_members.find((rm) => rm.user_id === userId && rm.is_deleted) ||
    !room.room_members.find((rm) => rm.user_id === userId)
  )
    return null;

  return (
    <Link
      href={`/chat/${room.id}`}
      prefetch={true}
      {...props}
      className={twMerge(
        "text-start w-full hover:dark:bg-white/5 transition-colors hover:bg-stone-900/10  p-3  rounded-lg text-gray-700 dark:text-white  flex items-center justify-between animate-in fade-in",
        isActive && "dark:bg-white/5 bg-stone-900/10"
      )}
    >
      <div className="flex items-center w-full space-x-3">
        {room.room_type === "personal" ? (
          <BadgeAvatar width={45} height={45} user={recipentUser?.user_id} />
        ) : (
          <BadgeAvatar width={45} height={45} room={room} />
        )}

        <div className="flex-1 min-w-0 overflow-hidden">
          <span className="flex space-x-1 font-medium ">
            <p className="truncate ">{displayName}</p>

            {room.room_type === "group" && (
              <p className="flex-shrink-0 ">({room.room_members.length})</p>
            )}
          </span>
          <span
            className={twMerge(
              "text-sm text-gray-500 dark:text-stone-400 flex items-center space-x-1  ",
              roomNotify > 0 && "dark:text-white/80 text-gray-500 font-bold"
            )}
          >
            <span className="flex-shrink-0 ">
              {user &&
                lastMessage &&
                user.id === lastMessage.sender &&
                lastMessage.status === "send" &&
                `你：`}
            </span>
            <p className="truncate ">{messageContent && messageContent}</p>
            {lastMessage && lastMessage.id !== "" && (
              <span className="flex-shrink-0">
                ．
                <TimeAgo date={lastMessage.created_at!} />
              </span>
            )}
          </span>
        </div>
        {roomNotify > 0 && (
          <span className=" flex-shrink-0 h-5 min-w-5 px-1.5 flex items-center text-white justify-center rounded-full bg-blue-500 text-sm">
            {roomNotify > 4 ? "4+" : roomNotify}
          </span>
        )}
      </div>
    </Link>
  );
}
