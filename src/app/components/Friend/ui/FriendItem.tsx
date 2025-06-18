import { FriendInterface } from "@/types/type";
import React, { useCallback } from "react";
import BadgeAvatar from "../../ui/Avatar";
import FriendButton from "./FriendButton";
import { useRouter } from "next/navigation";

export default function FriendItem({ friend }: { friend: FriendInterface }) {
  const router = useRouter();
  const handleClick = useCallback(() => {
    router.push(`/profile/${friend.user.id}`);
  }, [router, friend]);
  return (
    <div className="flex items-center justify-between p-1 bg-gray-100 rounded-lg opacity-0 dark:bg-white/10 animate-slide-in">
      <div
        onClick={handleClick}
        className="flex items-center w-full gap-2 overflow-hidden cursor-pointer"
      >
        <BadgeAvatar width={40} height={40} user={friend.user.id} />
        <p className="truncate text-nowrap">{friend.user.name}</p>
      </div>
      <FriendButton friend={friend} />
    </div>
  );
}
