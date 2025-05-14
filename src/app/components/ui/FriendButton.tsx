"use client";
import React, { useCallback, useState } from "react";
import { RoomInterface, UserInterface } from "../../../types/type";
import { useChatStore } from "../../store/ChatStore";
import { createRoom } from "../../lib/util";

import { useRouter } from "next/navigation";
import { useAblyStore } from "../../store/AblyStore";
import BadgeAvatar from "./Avatar";
import { useAuthStore } from "../../store/AuthStore";
import CircularProgress from "@mui/material/CircularProgress";
import { twMerge } from "tailwind-merge";
import { useSession } from "next-auth/react";
import WarningButton from "./WarningButton";
import { Trash2 } from "lucide-react";
export default function FriendButton({ friend }: { friend: UserInterface }) {
  const { rooms } = useChatStore();
  const { setFriends } = useAuthStore();
  const { channel } = useAblyStore();
  const userId = useSession()?.data?.userId;
  const router = useRouter();
  const [isLoading, setIsloading] = useState<{
    delete: boolean;
    create: boolean;
  }>({ delete: false, create: false });

  const handleClick = useCallback(async () => {
    if (!channel) return;
    const friendRoom = rooms.find(
      (room) =>
        room?.room_members.some((member) => member.user_id === friend.id) &&
        room.room_type === "personal"
    );
    if (!friendRoom) {
      if (isLoading.create) return;
      setIsloading((prev) => ({ ...prev, create: true }));
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
      setIsloading((prev) => ({ ...prev, create: false }));
      router.push(`/chat/${newRoom.id}`);
    } else {
      if (
        friendRoom.room_members.some(
          (rm) => rm.user_id === userId && rm.is_deleted
        )
      ) {
        friendRoom.room_members = friendRoom.room_members.map((rm) => {
          if (rm.user_id === userId) {
            return { ...rm, is_deleted: false };
          }
          return rm;
        });
        const res = await fetch("/api/rooms/join_delete", {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, roomId: friendRoom.id }),
        });
        const data = await res.json();
        if (data.error) {
          console.log(data.error);
          return;
        }
        await channel.publish("room_action", {
          action: "edit",
          newRoom: friendRoom,
        });
      }
      router.push(`/chat/${friendRoom.id}`);
    }
  }, [rooms, router, userId, friend, channel, isLoading]);

  const deleteFriend = useCallback(async () => {
    try {
      setIsloading((prev) => ({ ...prev, delete: true }));
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
      setIsloading((prev) => ({ ...prev, delete: false }));
    }
  }, [friend, userId, channel, setFriends]);

  return (
    <div className="flex items-center justify-between p-1 bg-gray-100 rounded-lg opacity-0 dark:bg-white/10 animate-slide-in">
      <div className="flex items-center w-full gap-2 overflow-hidden cursor-pointer">
        <BadgeAvatar width={40} height={40} user={friend.id} />
        <p className="truncate text-nowrap">{friend.name}</p>
      </div>

      <div className="inline-flex gap-4 p-2 text-nowrap">
        <button
          onClick={handleClick}
          disabled={isLoading.create}
          title="發送訊息"
          className="p-1 px-3 font-bold transition-colors rounded-md dark:text-white outline outline-2 outline-black dark:outline dark:outline-2 dark:outline-white "
        >
          {isLoading.create ? (
            <CircularProgress
              color="inherit"
              size={20}
              className="mx-1 text-sm text-black dark:text-white"
            />
          ) : (
            <>
              <p className="">發送訊息</p>
            </>
          )}
        </button>
        <WarningButton
          onClick={deleteFriend}
          className={twMerge(
            "flex items-center font-bold px-1 ",
            isLoading.delete && "outline-red-300 pointer-events-none"
          )}
        >
          {isLoading.delete ? (
            <CircularProgress color="inherit" size={20} className="text-sm " />
          ) : (
            <Trash2 />
          )}
        </WarningButton>
      </div>
    </div>
  );
}
