"use client";
import { useAuthStore } from "@/app/store/AuthStore";

import React, { useCallback, useMemo, useState } from "react";

import FriendButton from "../../Friend/ui/FriendButton";
import { useSession } from "next-auth/react";
import { responseFriendRequest, sendFriendRequest } from "@/app/lib/util";

import { friendStatus } from "@/types/type";
import { Ellipsis } from "lucide-react";

export default function FriendBtn({ id }: { id: string }) {
  const { friends, friendRequests } = useAuthStore();
  const userId = useSession()?.data?.userId;
  const friend = useMemo(() => {
    return friends?.find((f) => f.friend_id === id);
  }, [friends, id]);
  const isOwn = id === userId;
  const [isLoading, setIsLoading] = useState(false);

  const pending = useMemo(() => {
    return friendRequests?.some(
      (req) =>
        req.receiver_id === id &&
        req.sender_id === userId &&
        req.status === "pending"
    );
  }, [friendRequests, id, userId]);

  const waiting = useMemo(() => {
    return friendRequests?.find(
      (req) =>
        req.receiver_id === userId &&
        req.sender_id === id &&
        req.status === "pending"
    );
  }, [friendRequests, userId, id]);
  const handleClick = useCallback(
    async (friendId: string, status: friendStatus) => {
      setIsLoading(true);
      try {
        await responseFriendRequest(friendId, status);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );
  return (
    <div className=" dark:text-white">
      {isOwn ? (
        <span className="ml-2 text-sm text-blue-500">(你)</span>
      ) : friend ? (
        <FriendButton friend={friend} />
      ) : pending ? (
        <span className="ml-2 text-sm text-blue-100">等待回復中...</span>
      ) : waiting ? (
        <span className="flex flex-nowrap">
          <button
            onClick={() => handleClick(waiting.id, "accepted")}
            className="px-2 py-1 mx-1 font-bold bg-gray-200 rounded-md whitespace-nowrap dark:bg-white/10"
          >
            接受
          </button>
          <button
            onClick={() => handleClick(waiting.id, "declined")}
            className="px-2 py-1 mx-1 font-bold text-white bg-red-500 rounded-md whitespace-nowrap hover:bg-red-400 "
          >
            拒絕
          </button>
        </span>
      ) : (
        <div className="inline-flex gap-4 text-nowrap">
          <button
            onClick={async () => {
              setIsLoading(true);
              await sendFriendRequest(id, userId!);
              setIsLoading(false);
            }}
            disabled={isLoading}
            className="flex items-center justify-center px-3 py-1 text-blue-500 bg-white rounded-md dark:bg-transparent dark:text-white outline outline-white"
          >
            {isLoading ? <Ellipsis className=" animate-pulse" /> : "新增好友"}
          </button>
        </div>
      )}
    </div>
  );
}
