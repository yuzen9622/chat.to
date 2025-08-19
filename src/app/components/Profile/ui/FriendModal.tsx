"use client";
import Link from "next/link";
import { useState } from "react";

import { Grow, Modal } from "@mui/material";

import BadgeAvatar from "../../ui/Avatar/Avatar";
import FriendBtn from "./FriendBtn";

import type { FriendInterface } from "@/types/type";
export default function FriendModal({
  friends,
}: {
  friends: FriendInterface[] | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-white text-blue-600 dark:text-blue-400"
      >
        {friends?.length || 0} 位朋友
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        className="flex items-center justify-center w-full h-full "
      >
        <Grow in={open}>
          <div className="w-11/12 max-w-lg bg-white rounded-md dark:bg-stone-800">
            <h1 className="p-2 text-lg text-center dark:text-white">朋友</h1>
            <div className="flex flex-col h-64 gap-2 p-2 overflow-auto dark:text-white">
              {friends?.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-1 px-2 bg-gray-100 rounded-lg opacity-0 dark:bg-white/10 animate-slide-in"
                >
                  <Link
                    href={`/profile/${friend.friend_id}`}
                    className="flex items-center w-full gap-2 overflow-hidden cursor-pointer"
                  >
                    <BadgeAvatar width={40} height={40} user={friend.user} />
                    <p className="truncate text-nowrap">{friend.user.name}</p>
                  </Link>
                  <FriendBtn id={friend.friend_id} />
                </div>
              ))}
            </div>
          </div>
        </Grow>
      </Modal>
    </>
  );
}
