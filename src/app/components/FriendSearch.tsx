"use client";
import React, { useCallback, useEffect, useState } from "react";
import { UserInterface } from "../lib/type";
import { twMerge } from "tailwind-merge";

import { useAuthStore } from "../store/AuthStore";
import { useChatStore } from "../store/ChatStore";
import { useRouter } from "next/navigation";
import { createRoom, sendFriendRequest } from "../lib/util";
import { useAblyStore } from "../store/AblyStore";
import BadgeAvatar from "./Avatar";
import { useSession } from "next-auth/react";
export default function FriendSearch() {
  const [searchValue, setSerchValue] = useState("");
  const [searchFriends, setSearchFriends] = useState<UserInterface[] | null>(
    null
  );
  const userId = useSession()?.data?.userId;
  const { friends, friendRequests } = useAuthStore();
  const { rooms } = useChatStore();
  const { channel } = useAblyStore();
  const router = useRouter();
  const searchFriend = useCallback(async () => {
    if (searchValue === "") {
      setSearchFriends(null);
      return;
    }
    try {
      const response = await fetch("/api/friends/q", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchValue,
          userId: userId,
        }),
      });
      const data: UserInterface[] = await response.json();
      setSearchFriends(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, [searchValue, userId]);
  useEffect(() => {
    const handler = setTimeout(() => {
      searchFriend();
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [searchValue, searchFriend]);

  const handleClick = useCallback(
    async (friend: UserInterface) => {
      if (!channel) return;
      const friendRoom = rooms.find(
        (room) =>
          room.room_members.some((member) => member.user_id === friend.id) &&
          room.room_type === "personal"
      );
      if (!friendRoom) {
        const newRoom = await createRoom(userId!, "", []);
        channel.publish("create_room", newRoom);
      } else {
        router.push(`/chat/${friendRoom.id}`);
      }
    },
    [rooms, router, userId, channel]
  );

  return (
    <div
      className={twMerge(
        "relative w-full rounded-t-md bg-blue-900/10 dark:bg-white/10 my-2",
        (!searchFriends || searchFriends.length == 0) && "rounded-md"
      )}
    >
      <input
        type="search"
        placeholder="Search friend..."
        onBlur={() => setSerchValue("")}
        onChange={(e) => setSerchValue(e.target.value)}
        value={searchValue}
        className="w-full p-2 text-blue-400 bg-transparent outline-none dark:text-white placeholder:text-blue-600"
      />
      {searchFriends && searchFriends.length > 0 && (
        <div className="absolute z-20 w-full p-2 rounded-b-md bg-stone-800/10 dark:bg-white/10 backdrop-blur-sm">
          {searchFriends.map((friend) => (
            <div
              className="flex items-center justify-between my-2"
              key={friend.id}
            >
              <div className="flex items-center">
                <BadgeAvatar user={friend.id} />

                <span className="px-2 text-stone-800 dark:text-white">
                  {friend.name}
                </span>
              </div>
              {friends &&
                friendRequests &&
                !friends.some((f) => f.id === friend.id) &&
                !friendRequests.some(
                  (request) => request.receiver_id === friend.id
                ) && (
                  <div>
                    <button
                      onClick={() => sendFriendRequest(friend.id, userId!)}
                      className="p-1 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-500 "
                    >
                      發送邀請
                    </button>
                  </div>
                )}
              {friends &&
                friendRequests &&
                !friends.some((f) => f.id === friend.id) &&
                friendRequests.some(
                  (request) => request.receiver_id === friend.id
                ) && (
                  <div>
                    <button className="p-1 text-sm font-bold text-white bg-red-500 rounded-md hover:bg-red-400">
                      取消發送
                    </button>
                  </div>
                )}
              {friends && friends.some((f) => f.id === friend.id) && (
                <div>
                  <button
                    onClick={() => handleClick(friend)}
                    className="p-1 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-500"
                  >
                    傳送訊息
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
