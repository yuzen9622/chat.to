"use client";
import React, { useEffect } from "react";
import RequestButton from "./RequestButton";
import FriendSearch from "./FriendSearch";

import { useAuthStore } from "../store/AuthStore";
import { Skeleton } from "@mui/material";
import { fetchFriendRequests } from "../lib/util";
export default function FriendRequest() {
  const { friendRequests, setFriendRequest, user } = useAuthStore();

  useEffect(() => {
    const getFrinedRequests = async () => {
      if (!user) return;
      const data = await fetchFriendRequests(user.id);
      setFriendRequest(() => data);
    };
    getFrinedRequests();
  }, [user, setFriendRequest]);
  return (
    <div className="relative w-full mx-1 dark:text-white">
      <FriendSearch />
      <p>朋友請求管理</p>
      <span className="w-full">
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
