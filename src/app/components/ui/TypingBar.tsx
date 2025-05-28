import { TypingInterface } from "@/types/type";
import React, { useMemo } from "react";
import Image from "next/image";
import { useChatStore } from "@/app/store/ChatStore";
import { useSession } from "next-auth/react";
import { twMerge } from "tailwind-merge";

export default function TypingBar({
  typingUsers,
  roomId,
}: {
  typingUsers: TypingInterface[];
  roomId: string;
}) {
  const { rooms } = useChatStore();
  const userId = useSession()?.data?.userId;
  const isTypingUsers = useMemo(() => {
    if (!typingUsers || typingUsers.length === 0) return null;
    const isTyping = typingUsers.filter(
      (tu) => tu.typing && tu.user.id !== userId
    );
    console.log(isTyping);
    return isTyping;
  }, [typingUsers, userId]);
  const roomType = useMemo(() => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.room_type;
  }, [rooms, roomId]);
  return (
    <>
      {isTypingUsers && isTypingUsers.length > 0 && (
        <div className="flex items-center gap-1 ">
          {roomType && roomType === "group" && (
            <span className="relative flex">
              {isTypingUsers &&
                isTypingUsers.map((itu, index) => (
                  <Image
                    className={twMerge(
                      " rounded-full   ring-2 ring-white dark:ring-neutral-800 aspect-square",
                      `-translate-x-[${index + 2}px]`
                    )}
                    alt={itu.user.name}
                    width={20}
                    height={20}
                    src={itu.user?.image || "/user.png"}
                    key={index}
                  />
                ))}
            </span>
          )}

          <span className="font-bold ">
            {roomType && roomType === "personal" && "對方"}
            正在輸入中...
          </span>
        </div>
      )}
    </>
  );
}
