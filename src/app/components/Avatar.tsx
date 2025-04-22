import Image from "next/image";
import React from "react";
import { twMerge } from "tailwind-merge";
import { useAblyStore } from "../store/AblyStore";
import { RoomInterface } from "../lib/type";
import { Skeleton } from "@mui/material";

import { useUserProfile } from "@/hook/hooks";
import { useSession } from "next-auth/react";

export default function BadgeAvatar({
  width = 45,
  height = 45,
  room,
  user,
}: {
  width?: number;
  height?: number;
  room?: RoomInterface;
  user?: string;
}) {
  const { onlineUsers } = useAblyStore();
  const userId = useSession()?.data?.userId;
  const userProfile = useUserProfile(
    room?.room_members.find((user) => user.user_id !== userId)?.user_id ||
      user ||
      userId!
  );

  if (!userProfile && room?.room_type === "personal")
    return (
      <Skeleton
        animation="wave"
        sx={{ bgcolor: "grey.900" }}
        width={width}
        height={height}
        variant="circular"
      />
    );

  return (
    <div className="relative ">
      <div
        className={twMerge(
          onlineUsers.some(
            (item) =>
              room?.room_members.some(
                (user) =>
                  user.user_id === item.clientId && user.user_id !== userId
              ) || item.clientId === user
          ) &&
            " after:content-[''] after:w-[10px] after:h-[10px] after:absolute after:bg-green-500 after:right-0 after:bottom-1 after:rounded-full after:outline after:outline-white after:dark:outline  after:dark:outline-stone-800"
        )}
      >
        {room?.room_type === "personal" && userProfile && (
          <Image
            className="border-2 border-transparent rounded-full bg-white/10 aspect-square"
            src={userProfile?.image}
            width={width}
            height={height}
            alt={userProfile.name}
          />
        )}
        {room?.room_type === "personal" && !userProfile && (
          <Image
            className="object-cover border-2 border-transparent rounded-full aspect-square"
            src="/user.png"
            width={width}
            height={height}
            alt={room.room_name}
          />
        )}
        {room?.room_type === "group" && !room.room_img && (
          <Image
            className={twMerge(
              "object-cover border-2 border-transparent rounded-full  aspect-square",
              width && `w-[${width}px]`,
              height && `h-[${height}px]`
            )}
            src="/group-of-people.png"
            width={width}
            height={height}
            alt={"group-avatar"}
          />
        )}
        {room?.room_type === "group" && room.room_img && (
          <Image
            className={twMerge(
              "object-cover border-2 border-transparent rounded-full  aspect-square",
              width && `w-[${width}px]`,
              height && `h-[${height}px]`
            )}
            src={room.room_img}
            width={width}
            height={height}
            alt={"group-avatar"}
          />
        )}
        {!room && userProfile && (
          <Image
            className="object-cover border-2 border-transparent rounded-full bg-white/5"
            src={userProfile.image}
            width={width}
            height={height}
            alt={"group-avatar"}
          />
        )}
      </div>
    </div>
  );
}
