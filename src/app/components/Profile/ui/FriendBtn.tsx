"use client";
import { useAuthStore } from "@/app/store/AuthStore";

import React, { useMemo } from "react";

import FriendButton from "../../Friend/ui/FriendButton";
import { useSession } from "next-auth/react";

export default function FriendBtn({ id }: { id: string }) {
  const { friends } = useAuthStore();
  const userId = useSession()?.data?.userId;
  const friend = useMemo(() => {
    return friends?.find((f) => f.friend_id === id);
  }, [friends, id]);
  const isOwn = id === userId;

  return (
    <div className=" dark:text-white">
      {isOwn ? (
        <span className="ml-2 text-sm text-blue-500">(你)</span>
      ) : friend ? (
        <FriendButton friend={friend} />
      ) : (
        <div className="inline-flex gap-4 text-nowrap">
          <button className="px-3 py-1 text-blue-500 bg-white rounded-md dark:bg-transparent dark:text-white outline outline-white">
            新增好友
          </button>
        </div>
      )}
    </div>
  );
}
