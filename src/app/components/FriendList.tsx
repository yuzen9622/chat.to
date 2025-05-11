"use client";
import React, { useEffect } from "react";
import { useAuthStore } from "../store/AuthStore";

import FriendButton from "./ui/FriendButton";
import { Skeleton } from "@mui/material";
import { fetchUserFriends } from "../lib/util";
import { useSession } from "next-auth/react";

export default function FriendList() {
  const { friends, setFriends } = useAuthStore();
  const userId = useSession()?.data?.userId;
  useEffect(() => {
    const getFriends = async () => {
      if (!userId) return;
      const data = await fetchUserFriends(userId);
      setFriends(() => data);
    };
    getFriends();
  }, [userId, setFriends]);
  return (
    <div className="flex flex-col w-full h-full overflow-hidden dark:text-white">
      {friends ? (
        <>
          <span>你的朋友 ({friends.length})</span>
          <span className="flex flex-col w-full gap-2 overflow-auto ">
            {Array.isArray(friends) && friends.length > 0 ? (
              friends.map((friend) => (
                <FriendButton friend={friend} key={friend.id} />
              ))
            ) : (
              <p className="font-bold text-center ">快來尋找你的好朋友吧!</p>
            )}
          </span>
        </>
      ) : (
        <div className="">
          <span>你的朋友</span>
          <Skeleton height={90} animation="wave" />
          <Skeleton height={90} animation="wave" />
        </div>
      )}
    </div>
  );
}
