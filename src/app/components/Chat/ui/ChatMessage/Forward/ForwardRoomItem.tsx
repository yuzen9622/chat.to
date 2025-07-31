import { useSession } from 'next-auth/react';
import { twMerge } from 'tailwind-merge';

import BadgeAvatar from '@/app/components/ui/Avatar/Avatar';
import { useChatInfo } from '@/hook/useChatInfo';

import type { Dispatch, SetStateAction } from "react";
import type { Forward, RoomInterface } from "@/types/type";

export default function ForwardRoomItem({
  room,
  isSelected,
  setTargets,
}: {
  room: RoomInterface;
  isSelected: boolean;
  setTargets: Dispatch<SetStateAction<Forward[]>>;
}) {
  const userId = useSession()?.data?.userId;
  const { displayName, recipientUser } = useChatInfo(room, userId ?? "");
  return (
    <button
      onClick={() =>
        setTargets((prev) => {
          if (prev.some((target) => target.room_id === room.id))
            return prev.filter((target) => target.room_id !== room.id);
          return [...prev, { room_id: room.id, room_type: room.room_type }];
        })
      }
      className={twMerge(
        " relative flex  hover:dark:bg-white/10 p-2 rounded-md items-center disabled:text-white/40  gap-2 w-full text-white  min-w-fit after:content-[''] after:text-xs after:absolute after:w-4 after:h-4 after:border after:bottom-6 after:right-2 after:rounded-full",
        isSelected &&
          "after:content-['✔'] after:text-xs after:absolute after:w-4 after:border-0 after:h-4 after:bottom-6 after:right-2 after:rounded-full after:animate-in after:zoom-in-0 after:bg-blue-500"
      )}
    >
      {room.room_type === "group" ? (
        <BadgeAvatar room={room} />
      ) : (
        <BadgeAvatar user={recipientUser} />
      )}
      <span>
        <p className="truncate text-start ">{displayName}</p>
        <p className="text-xs font-bold truncate w-fit dark:text-stone-500 text-stone-100 ">
          {room.room_type === "group" ? "群組聊天室" : "個人聊天室"}
        </p>
      </span>
    </button>
  );
}
