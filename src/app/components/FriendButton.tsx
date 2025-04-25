"use client";
import React, { useCallback, useState } from "react";
import { RoomInterface, UserInterface } from "../lib/type";
import { useChatStore } from "../store/ChatStore";
import { createRoom } from "../lib/util";

import { useRouter } from "next/navigation";
import { useAblyStore } from "../store/AblyStore";
import BadgeAvatar from "./Avatar";
import { useAuthStore } from "../store/AuthStore";
import CircularProgress from "@mui/material/CircularProgress";
import { twMerge } from "tailwind-merge";
import { useSession } from "next-auth/react";
export default function FriendButton({ friend }: { friend: UserInterface }) {
  const { rooms } = useChatStore();
  const { setFriends } = useAuthStore();
  const { channel } = useAblyStore();
  const userId = useSession()?.data?.userId;
  const router = useRouter();
  const [isLoading, setIsloading] = useState(false);

  const handleClick = useCallback(async () => {
    if (!channel) return;
    const friendRoom = rooms.find(
      (room) =>
        room.room_members.some((member) => member.user_id === friend.id) &&
        room.room_type === "personal"
    );
    if (!friendRoom) {
      const newRoom: RoomInterface = await createRoom(
        userId!,
        "",
        [friend.id],
        "personal"
      );
      const roomMembers = newRoom.room_members.map((rm) => rm.user_id);

      channel.publish("room_action", {
        action: "create",
        newRoom,
        newRoomMembers: roomMembers,
      });
      router.push(`/chat/${newRoom.id}`);
    } else {
      router.push(`/chat/${friendRoom.id}`);
    }
  }, [rooms, router, userId, friend, channel]);

  const deleteFriend = useCallback(async () => {
    try {
      setIsloading(true);
      if (!channel) return;
      const response = await fetch("/api/friends/delete", {
        headers: { "Content-Type": "application/json" },
        method: "post",
        body: JSON.stringify({ friend_id: friend.id, user_id: userId }),
      });
      if (response.ok) {
        setFriends((prev) => {
          return prev.filter((f) => f.id !== friend.id);
        });
        channel.publish("friend_action", { action: "delete", data: userId });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsloading(false);
    }
  }, [friend, userId, channel, setFriends]);

  return (
    <div className="flex items-center justify-between p-1 my-1 bg-gray-100 rounded-lg opacity-0 dark:bg-white/10 animate-slide-in">
      <div className="flex items-center m-1">
        <BadgeAvatar user={friend.id} />
        <span className="px-2 ">{friend.name}</span>
      </div>

      <div className="inline-flex">
        <button
          onClick={handleClick}
          className="p-1 mx-2 font-bold text-white transition-colors bg-blue-500 rounded-md dark:bg-white/10 hover:bg-blue-600 active:bg-blue-300"
        >
          發送訊息
        </button>
        <button
          onClick={deleteFriend}
          className={twMerge(
            "flex items-center p-1 text-white font-bold bg-red-500 rounded-md ",
            isLoading && "bg-red-300 pointer-events-none"
          )}
        >
          {isLoading && (
            <CircularProgress
              color="inherit"
              size={20}
              className="mx-1 text-sm text-white"
            />
          )}
          解除好友
        </button>
      </div>
    </div>
  );
}
