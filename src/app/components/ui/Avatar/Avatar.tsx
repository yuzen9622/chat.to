import Image from "next/image";
import React from "react";
import { twMerge } from "tailwind-merge";

import { useSession } from "next-auth/react";
import { PublicUserInfo, RoomInterface, UserInterface } from "@/types/type";
import { useAblyStore } from "@/app/store/AblyStore";

export default function BadgeAvatar({
  width = 45,
  height = 45,
  room,
  user,
}: {
  width?: number;
  height?: number;
  room?: RoomInterface;
  user?: PublicUserInfo | UserInterface;
}) {
  const { onlineUsers } = useAblyStore();
  const userId = useSession()?.data?.userId;

  return (
    <div className="relative w-fit h-fit">
      <div
        className={twMerge(
          onlineUsers.some(
            (item) =>
              room?.room_members.some(
                (user) =>
                  user.user_id === item.clientId && user.user_id !== userId
              ) || item.clientId === user?.id
          ) &&
            " after:content-[''] after:w-[10px] after:h-[10px] after:absolute after:bg-green-500 after:right-0 after:bottom-1 after:rounded-full after:outline after:outline-white after:dark:outline  after:dark:outline-stone-800"
        )}
      >
        <Image
          className={twMerge(
            "border-2 border-transparent   object-cover rounded-full bg-white/10 aspect-square",
            `min-w-[${width}] min-h-[${height}]`
          )}
          src={
            user
              ? user.image || "/user.png"
              : room?.room_img?.url || "/group.png"
          }
          width={width}
          height={height}
          alt={room?.room_name || "user"}
        />
      </div>
    </div>
  );
}
