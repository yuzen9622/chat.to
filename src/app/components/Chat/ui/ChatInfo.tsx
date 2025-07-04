"use client";
import React, { useState, useCallback, useMemo } from "react";

import { useChatStore } from "../../../store/ChatStore";
import { useAblyStore } from "../../../store/AblyStore";

import { UserPlus, LogOut, X, Users } from "lucide-react";
import BadgeAvatar from "@/app/components/ui/Avatar/Avatar";
import { joinRoom, deleteRoom } from "@/app/lib/api/room/roomApi";
import { twMerge } from "tailwind-merge";

import { Modal } from "@mui/material";
import { useAuthStore } from "../../../store/AuthStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useChatInfo } from "@/hook/useChatInfo";

import ChatInfoList from "./ChatInfoList";
import RoomUser from "./RoomUser";

function RoomUsers() {
  const { currentChat } = useChatStore();
  const [open, setOpen] = useState(false);

  const roomUsers = useMemo(() => {
    if (!currentChat) return [];
    const roomMembers = currentChat.room_members;
    return roomMembers;
  }, [currentChat]);
  return (
    <>
      <button
        title="成員"
        onClick={() => setOpen(true)}
        className="flex flex-col justify-center p-1 rounded-md dark:text-white hover:bg-white/10 "
      >
        <Users />
      </button>
      <Modal
        onClose={() => setOpen(false)}
        open={open}
        className="flex items-center justify-center"
      >
        <div className="flex flex-col w-full h-64 max-w-md gap-2 p-2 bg-white rounded-md dark:bg-stone-900">
          <h1 className="text-xl text-center dark:text-white">成員</h1>

          <div className="flex flex-col max-h-full gap-2 overflow-auto dark:text-white">
            {roomUsers.length > 0 &&
              roomUsers.map((roomUser) => (
                <RoomUser key={roomUser.id} member={roomUser} />
              ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
export default function ChatInfo() {
  const { currentChat, chatInfoOpen, setChatInfoOpen, rooms, setRoom } =
    useChatStore();
  const { onlineUsers, channel, roomId } = useAblyStore();

  const [roomMembers, setRoomMembers] = useState<string[]>([]);
  const { friends } = useAuthStore();
  const [joinOpen, setJoinOpen] = useState(false);
  const userId = useSession()?.data?.userId;

  const router = useRouter();
  const { recipentUser, displayName } = useChatInfo(currentChat!, userId!);

  const handleRoomMember = useCallback(
    (userId: string) => {
      if (
        currentChat &&
        currentChat.room_members.some((rm) => rm.user_id === userId)
      )
        return;
      if (roomMembers.includes(userId)) {
        setRoomMembers((prev) => {
          return prev.filter((m) => m !== userId);
        });
      } else {
        setRoomMembers((prev) => [...prev, userId]);
      }
    },
    [currentChat, roomMembers]
  );

  const handleDelete = useCallback(async () => {
    const newRoom = rooms.find((r) => r.id === currentChat?.id);
    if (newRoom && userId && channel) {
      if (newRoom.room_type === "group") {
        newRoom.room_members = newRoom.room_members.filter(
          (rm) => rm.user_id !== userId
        );
        setRoom((prev) => {
          return prev.filter((r) => r.id !== currentChat?.id);
        });
      } else {
        newRoom.room_members = newRoom.room_members.map((rm) => {
          if (rm.user_id === userId) {
            return { ...rm, is_deleted: true };
          }
          return rm;
        });
      }

      channel?.publish("room_action", { action: "edit", newRoom });
      await deleteRoom(newRoom.id, userId!, newRoom.room_type);

      router.push("/chat");
    }
  }, [userId, rooms, currentChat, channel, router, setRoom]);

  const handleJoin = useCallback(async () => {
    try {
      console.log(channel);
      if (!channel) return;
      const data = await joinRoom(roomId, roomMembers);
      if (!data) return;
      await channel.publish("room_action", {
        action: "join",
        newRoom: data,
      });
    } catch (error) {
      console.log(error);
    } finally {
    }
  }, [channel, roomId, roomMembers]);
  return (
    <div
      className={twMerge(
        "h-full overflow-hidden transition-all   animate-slide-in max-sm:w-full bg-gray-white/20 backdrop-blur-xl border-l      dark:border-white/10 w-80 hidden   absolute top-0 right-0  z-30   dark:bg-stone-800/90 ",
        chatInfoOpen && "flex flex-col overflow-hidden"
      )}
    >
      {currentChat && (
        <>
          <button
            className="absolute top-4 right-2"
            onClick={() => setChatInfoOpen(false)}
          >
            <X className="text-gray-400 hover:dark:text-white" />
          </button>

          <Modal
            open={joinOpen}
            onClose={() => {
              setJoinOpen(false);
              setRoomMembers([]);
            }}
          >
            <div className="absolute w-11/12 max-w-[500px] p-4 max-h-full overflow-auto  transform -translate-x-1/2 -translate-y-1/2 bg-stone-900 rounded-md top-1/2 left-1/2  ">
              <button className="w-full p-2 my-2 text-sm font-bold text-white rounded-md bg-white/5 hover:bg-white/10 ">
                複製邀請碼
              </button>
              <div className="relative flex items-center text-sm justify-center w-full p-2 text-center text-white/20 before:absolute before:w-[43%] before:h-[1px] before:left-0 before:bg-white/20 after:absolute after:w-[43%] after:h-[1px] after:right-0 after:bg-white/20">
                OR
              </div>
              <div className="w-full py-2 ">
                <p className="text-white">邀請好友</p>
                <div className="flex flex-col items-center w-full max-w-full gap-2 overflow-auto">
                  {friends &&
                    friends.map((friend) => {
                      return (
                        <button
                          key={friend.id}
                          disabled={currentChat.room_members.some(
                            (rm) => rm.user_id === friend.user.id
                          )}
                          type="button"
                          onClick={() => handleRoomMember(friend.user.id)}
                          className={twMerge(
                            " relative flex  items-center disabled:text-white/40  gap-2 w-full text-white  min-w-fit after:content-[''] after:text-xs after:absolute after:w-4 after:h-4 after:border after:bottom-6 after:right-2 after:rounded-full",
                            roomMembers.includes(friend.user.id) &&
                              "after:content-['✔'] after:text-xs after:absolute after:w-4 after:border-0 after:h-4 after:bottom-6 after:right-2 after:rounded-full after:animate-in after:zoom-in-0 after:bg-blue-500"
                          )}
                        >
                          <BadgeAvatar
                            width={55}
                            height={55}
                            user={friend.user.id}
                          />
                          <p className="truncate">{friend.user.name}</p>
                        </button>
                      );
                    })}
                </div>
                <button
                  type="button"
                  onClick={handleJoin}
                  className={twMerge(
                    "flex items-center p-2 justify-center mt-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-400 "
                  )}
                >
                  <p>新增</p>
                </button>
              </div>
            </div>
          </Modal>
          <div className="flex flex-col items-center justify-center w-full gap-2 py-4 border-b dark:border-white/10">
            {currentChat.room_type === "personal" ? (
              <BadgeAvatar
                width={80}
                height={80}
                user={recipentUser?.user_id}
              />
            ) : (
              <BadgeAvatar width={80} height={80} room={currentChat!} />
            )}
            {onlineUsers.some((item) =>
              currentChat?.room_members.some(
                (user) =>
                  user.user_id === item.clientId && user.user_id !== userId
              )
            ) && <span className="text-xs text-green-400">目前在線上</span>}
            <span className="flex text-lg dark:text-white">
              <p className="truncate ">{displayName}</p>
              {currentChat.room_type === "group" && (
                <p className="flex-shrink-0 ml-1">
                  ({currentChat.room_members.length})
                </p>
              )}
            </span>
            <span className="flex justify-center w-full gap-2">
              {currentChat.room_type === "group" && (
                <button
                  title="新增"
                  onClick={() => setJoinOpen(true)}
                  className="flex flex-col justify-center p-1 rounded-md dark:text-white hover:bg-white/10"
                >
                  <UserPlus />
                </button>
              )}
              <RoomUsers />

              <button
                title="刪除"
                className="p-1 rounded-md dark:text-white hover:bg-white/10"
                onClick={handleDelete}
              >
                <LogOut />
              </button>
            </span>
          </div>
          <ChatInfoList />
        </>
      )}
    </div>
  );
}
