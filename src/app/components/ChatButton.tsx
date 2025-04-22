"use client";
import * as React from "react";
import { useMemo } from "react";
import BadgeAvatar from "./Avatar";
import { LinkHTMLAttributes } from "react";
import { usePathname } from "next/navigation";
import { RoomInterface } from "../lib/type";
import { useLastMessage, useRoomNotify } from "@/hook/hooks";
import { useAuthStore } from "../store/AuthStore";
import { messageType, TimeAgo } from "../lib/util";

import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { useChatStore } from "../store/ChatStore";
import { useSession } from "next-auth/react";
type ButtonProps = LinkHTMLAttributes<HTMLAnchorElement>;
export default function ChatButton({
  room,
  ...props
}: { room: RoomInterface } & ButtonProps) {
  const pathname = usePathname();
  const lastMessage = useLastMessage(room.id);
  const roomNotify = useRoomNotify(room.id);
  const { user } = useAuthStore();
  const isActive = pathname === `/chat/${room.id}`;
  const { currentUser } = useChatStore();
  //const [recipentUser, setRecipentUser] = useState<UserInterface | null>(null);
  const userId = useSession()?.data?.userId;

  const recipentUser = useMemo(() => {
    if (!room || !userId) return null;
    const recipentId = room.room_members.find((id) => id.user_id !== userId);
    return currentUser.find((user) => user.id === recipentId?.user_id) || null;
  }, [room, currentUser, userId]);

  const messageContent = useMemo(() => {
    if (!lastMessage) return null;
    if (lastMessage.status === "pending") return "傳送中...";

    if (messageType(lastMessage.meta_data!) === "image") return "傳送圖片";
    if (messageType(lastMessage.meta_data!) === "video") return "傳送影片";
    if (messageType(lastMessage.meta_data!) === "file") return "傳送檔案";
    if (messageType(lastMessage.meta_data!) === "audio") return "傳送語音";
    return lastMessage.text;
  }, [lastMessage]);

  const displayName = useMemo(() => {
    return room.room_name === "" ? recipentUser?.name : room.room_name;
  }, [room.room_name, recipentUser?.name]);

  return (
    <Link
      href={`/chat/${room.id}`}
      prefetch={true}
      {...props}
      className={twMerge(
        "text-start w-full hover:dark:bg-white/5 transition-colors hover:bg-stone-900/10  p-3 my-2 rounded-lg text-gray-700 dark:text-white  flex items-center justify-between animate-in fade-in",
        isActive && "dark:bg-white/5 bg-stone-900/10"
      )}
    >
      <div className="flex items-center w-full space-x-3">
        <BadgeAvatar room={room} />
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
            <span className="flex-shrink-0">
              {lastMessage && "．"}
              {lastMessage && <TimeAgo date={lastMessage.created_at!} />}
            </span>
          </span>
        </div>
        {roomNotify > 0 && (
          <span className=" flex-shrink-0 h-5 min-w-5 px-1.5 flex items-center text-white dark:text-stone-800 justify-center rounded-full bg-blue-500 text-sm">
            {roomNotify > 4 ? "4+" : roomNotify}
          </span>
        )}
      </div>
    </Link>
  );
}
