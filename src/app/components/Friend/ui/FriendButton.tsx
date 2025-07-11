"use client";
import React, { useCallback, useState } from "react";
import { FriendInterface, RoomInterface } from "../../../../types/type";
import { useChatStore } from "../../../store/ChatStore";
import { getPersonalRoom } from "@/app/lib/api/room/roomApi";
import { useRouter } from "next/navigation";
import { useAblyStore } from "../../../store/AblyStore";

import { useAuthStore } from "../../../store/AuthStore";

import { twMerge } from "tailwind-merge";
import { useSession } from "next-auth/react";
import WarningButton from "../../ui/WarningButton";
import { Ellipsis, Trash2 } from "lucide-react";
export default function FriendButton({ friend }: { friend: FriendInterface }) {
  const { rooms } = useChatStore();
  const { setFriends } = useAuthStore();
  const { channel } = useAblyStore();
  const userId = useSession()?.data?.userId;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<{
    delete: boolean;
    create: boolean;
  }>({ delete: false, create: false });

  const handleClick = useCallback(async () => {
    if (!channel) return;
    const friendRoom = rooms.find(
      (room) => room.id === friend.personal_room_id
    );
    if (!friendRoom) {
      if (isLoading.create) return;
      setIsLoading((prev) => ({ ...prev, create: true }));
      const newRoom: RoomInterface = await getPersonalRoom(
        friend.personal_room_id,
        userId!,
        friend.friend_id
      );
      const roomMembers = newRoom.room_members.map((rm) => rm.user_id);

      channel.publish("room_action", {
        action: "create",
        newRoom,
        newRoomMembers: roomMembers,
      });
      setIsLoading((prev) => ({ ...prev, create: false }));
      router.push(`/chat/${newRoom.id}`);
    } else {
      //await getPersonalRoom(friend.personal_room_id, userId!, friend.friend_id);
      const isFriendRoomDelete = friendRoom.room_members.some(
        (rm) => rm.user_id === userId && rm.is_deleted
      );
      console.log(isFriendRoomDelete);
      if (isFriendRoomDelete) {
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
      setIsLoading((prev) => ({ ...prev, delete: true }));
      if (!channel) return;
      const response = await fetch("/api/friends/delete", {
        headers: { "Content-Type": "application/json" },
        method: "post",
        body: JSON.stringify({ friend_id: friend.friend_id, user_id: userId }),
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
      setIsLoading((prev) => ({ ...prev, delete: false }));
    }
  }, [friend, userId, channel, setFriends]);

  return (
    <div className="inline-flex gap-4 text-nowrap">
      <button
        onClick={handleClick}
        disabled={isLoading.create}
        title="發送訊息"
        className="p-1 px-3 font-bold text-blue-600 transition-colors bg-white rounded-md dark:outline dark:outline-2 dark:outline-white dark:text-white dark:bg-transparent"
      >
        {isLoading.create ? (
          <Ellipsis className=" animate-pulse" />
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
          <Ellipsis className=" animate-pulse" />
        ) : (
          <Trash2 />
        )}
      </WarningButton>
    </div>
  );
}
