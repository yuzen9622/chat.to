import { FriendInterface } from "@/types/type";
import React from "react";
import BadgeAvatar from "../../ui/Avatar";
import FriendButton from "./FriendButton";

import UserPopbox from "../../ui/UserPopbox";
import { usePopbox } from "@/hook/usePopbox";
export default function FriendItem({ friend }: { friend: FriendInterface }) {
  const { anchorEl, handleClose, handleOpen } = usePopbox();

  return (
    <div className="flex items-center justify-between p-1 bg-gray-100 rounded-lg opacity-0 dark:bg-white/10 animate-slide-in">
      <button
        onClick={handleOpen}
        className="flex items-center w-full gap-2 overflow-hidden cursor-pointer"
      >
        <BadgeAvatar width={40} height={40} user={friend.user.id} />
        <p className="truncate text-nowrap">{friend.user.name}</p>
      </button>
      <FriendButton friend={friend} />
      <UserPopbox
        anchorEl={anchorEl}
        handleClose={handleClose}
        user={friend.user}
      />
    </div>
  );
}
