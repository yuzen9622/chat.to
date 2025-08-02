"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import RequestButton from "@/app/components/Friend/ui/RequestButton";
import { fetchFriendRequests } from "@/app/lib/api/friend/friendApi";
import { Skeleton } from "@mui/material";

import { useAuthStore } from "../../../store/AuthStore";
import FriendSearch from "./FriendSearch";

export default function FriendRequest() {
  const { friendRequests, setFriendRequest } = useAuthStore();
  const userId = useSession().data?.userId;
  useEffect(() => {
    const getFriendRequests = async () => {
      if (!userId) return;
      const data = await fetchFriendRequests(userId);
      setFriendRequest(() => data);
    };
    getFriendRequests();
  }, [userId, setFriendRequest]);
  return (
    <div className="relative flex flex-col w-full mx-1 dark:text-white">
      <FriendSearch />
      <p>朋友請求管理</p>
      <span className="flex flex-col w-full overflow-auto">
        {friendRequests ? (
          friendRequests.length === 0 ? (
            <p className="w-full font-bold text-center ">暫無朋友請求</p>
          ) : (
            friendRequests.map((friend) => (
              <RequestButton key={friend.id} friend={friend} />
            ))
          )
        ) : (
          <div>
            <Skeleton height={60} animation="wave" />
          </div>
        )}
      </span>
    </div>
  );
}
