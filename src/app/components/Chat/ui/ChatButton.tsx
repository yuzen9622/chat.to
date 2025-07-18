"use client";
import * as React from "react";
import { useMemo } from "react";
import BadgeAvatar from "../../ui/Avatar/Avatar";
import { LinkHTMLAttributes } from "react";
import { usePathname } from "next/navigation";
import { RoomInterface } from "../../../../types/type";
import { useChatInfo } from "@/hook/useChatInfo";
import { useLastMessage } from "@/hook/useLastMessage";
import { useRoomNotify } from "@/hook/useRoomNotify";
import { messageType } from "../../../lib/util";
import { TimeAgo } from "../../ui/TimeAgo";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

import { useSession } from "next-auth/react";
import TypingBar from "../../ui/TypingBar";
import { useChatStore } from "@/app/store/ChatStore";
import MarkDownText from "../../ui/MarkDownText";
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
  const { typingUsers } = useChatStore();
  const { recipientUser, displayName } = useChatInfo(room, userId!);

  const messageContent = useMemo(() => {
    if (!lastMessage) return null;
    if (lastMessage.status === "pending") return "傳送中...";

    if (lastMessage.forward) return "已轉發訊息";

    const type = {
      image: "傳送圖片",
      video: "傳送影片",
      file: "傳送檔案",
      audio: "傳送語音",
    };
    const msgType = messageType(lastMessage.meta_data!);

    return msgType ? type[msgType] : lastMessage.text;
  }, [lastMessage]);

  const typingUser = useMemo(() => {
    let roomTyping = typingUsers[room.id];

    if (!roomTyping || roomTyping.every((tu) => tu.typing === false))
      return null;
    roomTyping = roomTyping.filter((tu) => tu.user.id !== userId && tu.typing);

    return roomTyping;
  }, [room, typingUsers, userId]);

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
        "text-start w-full hover:dark:bg-white/5 transition-colors hover:bg-stone-100  p-2  rounded-lg text-gray-700 dark:text-white  flex items-center justify-between animate-in fade-in",
        isActive && "dark:bg-white/5 bg-stone-100"
      )}
    >
      <div className="flex items-center w-full space-x-3">
        {room.room_type === "personal" ? (
          <BadgeAvatar width={50} height={50} user={recipientUser!} />
        ) : (
          <BadgeAvatar width={50} height={50} room={room} />
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
            {typingUser && typingUser.length > 0 ? (
              <TypingBar typingUsers={typingUser} roomId={room.id} />
            ) : (
              <>
                <span className="flex-shrink-0 ">
                  {user &&
                    lastMessage &&
                    user.id === lastMessage.sender &&
                    lastMessage.status === "send" &&
                    `你：`}
                </span>
                <div className="max-w-full max-h-full overflow-hidden truncate">
                  {messageContent && (
                    <MarkDownText style="inline" text={messageContent} />
                  )}
                </div>
                {lastMessage && lastMessage.id !== "" && (
                  <span className="flex-shrink-0">
                    ．
                    <TimeAgo date={lastMessage.created_at!} />
                  </span>
                )}
              </>
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
