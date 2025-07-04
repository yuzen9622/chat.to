import React, { useCallback, useEffect, useState } from "react";
import { fetchUsersNotify } from "@/app/lib/api/notify/notifytApi";

import {
  joinRoom,
  createRoom,
  fetchUserRooms,
} from "@/app/lib/api/room/roomApi";

import { useChatStore } from "../../../store/ChatStore";
import ChatButton from "./ChatButton";
import { Skeleton, Modal } from "@mui/material";
import { SquarePen, Check, Ellipsis } from "lucide-react";
import { useAblyStore } from "../../../store/AblyStore";

import { twMerge } from "tailwind-merge";

import BadgeAvatar from "@/app/components/ui/Avatar/Avatar";
import { redirect } from "next/navigation";
import { useAuthStore } from "../../../store/AuthStore";
import { ClientMessageInterface, RoomInterface } from "../../../../types/type";
import { useSession } from "next-auth/react";
import UploadAvatar from "../../ui/Avatar/UploadAvatar";
import FriendNote from "../../Friend/ui/FriendNote";
function JoinModal() {
  const [open, setOpen] = React.useState(false);
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { channel } = useAblyStore();
  const { rooms } = useChatStore();

  const userId = useSession()?.data?.userId;
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleJoin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      try {
        e.preventDefault();
        setIsLoading(true);

        if (
          !channel ||
          rooms.some((r) => r.id === roomId && r.room_type === "group")
        )
          return;
        const data = await joinRoom(roomId, [userId!]);
        if (!data) return;
        await channel?.publish("room_action", {
          action: "join",
          newRoom: data,
        });
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [channel, roomId, userId, rooms]
  );
  return (
    <React.Fragment>
      <button
        onClick={handleOpen}
        className="w-full p-2 my-2 text-sm font-bold rounded-md dark:text-white bg-stone-900/5 hover:bg-stone-900/10 dark:bg-white/5 hover:dark:bg-white/10 "
      >
        加入群組
      </button>
      <Modal open={open} onClose={handleClose}>
        <div className="absolute w-11/12 max-w-[500px] p-4  transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-stone-900 rounded-md top-1/2 left-1/2  ">
          <form onSubmit={handleJoin}>
            <div className="flex flex-col dark:text-white ">
              <label
                htmlFor="room_name"
                className="after:content-['*'] after:text-red-600"
              >
                群組 Id
              </label>
              <input
                className="p-2 rounded-lg bg-stone-900/10 focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-stone-800"
                type="text"
                id="room_name"
                required
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className={twMerge(
                "flex items-center p-2 justify-center mt-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-400 ",
                isLoading && "bg-blue-400"
              )}
            >
              {isLoading ? <Ellipsis className=" animate-pulse" /> : "加入"}
            </button>
          </form>
        </div>
      </Modal>
    </React.Fragment>
  );
}

function CreateRoomModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { friends } = useAuthStore();
  const { channel } = useAblyStore();
  const [roomName, setRoomName] = useState("");
  const [roomMembers, setRoomMembers] = useState<Array<string>>([]);
  const [roomImg, setRoomImg] = useState<{
    imgUrl: string;
    imgFile: File;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const userId = useSession().data?.userId;

  const handleRoomMember = useCallback(
    (userId: string) => {
      if (roomMembers.includes(userId)) {
        setRoomMembers((prev) => {
          return prev.filter((m) => m !== userId);
        });
      } else {
        setRoomMembers((prev) => [...prev, userId]);
      }
    },
    [roomMembers]
  );

  return (
    <>
      <Modal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setRoomMembers([]);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="absolute w-11/12 max-w-[500px] p-4  transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-stone-900 rounded-md top-1/2 left-1/2  ">
          <h1 className="text-xl font-semibold dark:text-white">群組</h1>
          <JoinModal />
          <div className="relative text-stone-800/55 flex items-center text-sm justify-center w-full p-2 text-center dark:text-white/20 before:absolute before:w-[43%] before:h-[1px] before:left-0 before:bg-stone-800/55 after:bg-stone-800/55 before:dark:bg-white/20 after:absolute after:w-[43%] after:h-[1px] after:right-0 after:dark:bg-white/20">
            OR
          </div>

          <p className="text-sm text-stone-900/70 dark:text-white/70">
            創建群組與好友聊天吧
          </p>
          <UploadAvatar
            src={roomImg?.imgUrl}
            setUserImage={setRoomImg}
            userImage={roomImg}
          />
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              const newRoom = await createRoom(
                userId!,
                roomName,
                roomMembers,
                "group",
                roomImg?.imgFile
              );
              if (channel && newRoom) {
                await channel.publish("room_action", {
                  action: "create",
                  newRoom: newRoom,
                  newRoomMembers: [...roomMembers, userId],
                });
              }

              setIsLoading(false);
              setIsOpen(false);
              redirect(`/chat/${newRoom.id}`);
            }}
          >
            <div className="flex flex-col dark:text-white ">
              <label
                htmlFor="room_name"
                className="after:content-['*'] after:text-red-600"
              >
                Name
              </label>
              <input
                className="p-2 rounded-lg focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 bg-stone-900/5 dark:bg-stone-800"
                type="text"
                id="room_name"
                required
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>
            <div className="w-full py-2 ">
              <p className="text-white">邀請好友</p>
              <div className="flex items-center w-full max-w-full gap-2 overflow-auto">
                {friends &&
                  friends.map((friend) => (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() => handleRoomMember(friend.friend_id)}
                      className={twMerge(
                        " relative flex flex-col items-center dark:text-white max-w-20 min-w-fit "
                      )}
                    >
                      <span className="relative ">
                        {roomMembers.includes(friend.friend_id) && (
                          <div className="absolute z-20 p-1 bg-blue-500 rounded-full -right-1 animate-in zoom-in-0">
                            <Check size={15} />
                          </div>
                        )}

                        <BadgeAvatar
                          width={55}
                          height={55}
                          user={friend.user.id}
                        />
                      </span>

                      <p className="truncate">{friend.user.name}</p>
                    </button>
                  ))}
              </div>
            </div>
            <button
              type="submit"
              className={twMerge(
                "flex items-center p-2 justify-center mt-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-400 ",
                isLoading && "bg-blue-400"
              )}
            >
              {isLoading ? (
                <>
                  <Ellipsis className=" animate-pulse" />
                </>
              ) : (
                "創建"
              )}
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}

export function LoadingList() {
  return (
    <div>
      <div className="flex items-center min-w-[300px] mb-3 ">
        <Skeleton
          variant="circular"
          className=" dark:bg:white/10 bg-stone-900/10"
          width={45}
          height={45}
        />
        <div className="ml-2">
          <Skeleton
            variant="text"
            className=" dark:bg:white/10 bg-stone-900/10"
            width={150}
          />
          <Skeleton
            variant="text"
            width={100}
            className=" dark:bg:white/10 bg-stone-900/10"
          />
        </div>
      </div>
      <div className="flex items-center w-full mb-3 ">
        <Skeleton
          variant="circular"
          className=" dark:bg:white/10 bg-stone-900/10"
          width={45}
          height={45}
        />
        <div className="ml-2">
          <Skeleton
            variant="text"
            className=" dark:bg:white/10 bg-stone-900/10"
            width={150}
          />
          <Skeleton
            variant="text"
            width={100}
            className=" dark:bg:white/10 bg-stone-900/10"
          />
        </div>
      </div>
      <div className="flex items-center w-full mb-3 ">
        <Skeleton
          variant="circular"
          className=" dark:bg:white/10 bg-stone-900/10"
          width={45}
          height={45}
        />
        <div className="ml-2">
          <Skeleton
            variant="text"
            className=" dark:bg:white/10 bg-stone-900/10"
            width={150}
          />
          <Skeleton
            variant="text"
            width={100}
            className=" dark:bg:white/10 bg-stone-900/10"
          />
        </div>
      </div>
      <div className="flex items-center w-full mb-3 ">
        <Skeleton
          variant="circular"
          className=" dark:bg:white/10 bg-stone-900/10"
          width={45}
          height={45}
        />
        <div className="ml-2">
          <Skeleton
            variant="text"
            className=" dark:bg:white/10 bg-stone-900/10"
            width={150}
          />
          <Skeleton
            variant="text"
            width={100}
            className=" dark:bg:white/10 bg-stone-900/10"
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatList() {
  const userId = useSession()?.data?.userId;

  const { setRoom, rooms, setNotify, setLastMessages } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const loadRooms = async () => {
      if (!userId || rooms.length > 0) return;

      try {
        setIsLoading(true);
        const {
          rooms: roomsData,
          lastMessages,
        }: { rooms: RoomInterface[]; lastMessages: ClientMessageInterface[] } =
          await fetchUserRooms();
        const inRooms = roomsData.filter((r) =>
          r.room_members.some((m) => m.user_id === userId)
        );

        if (roomsData.length > 0) {
          setRoom(() => inRooms);
        }
        lastMessages.forEach((lm) => {
          setLastMessages({ ...lm, isFetching: true });
        });
        const notifiesData = await fetchUsersNotify(userId, inRooms);
        setNotify(() => notifiesData);
      } catch (error) {
        console.error("Failed to load rooms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, [userId, setRoom, setNotify, rooms, setLastMessages]);

  return (
    <div className="flex flex-col h-full p-2 sm:rounded-lg sm:dark:bg-neutral-800 border-t-gray-500">
      <div>
        <FriendNote />
      </div>
      <div className="flex justify-between ">
        <span className="text-lg font-semibold text-blue-400">Chats</span>
        <span>
          <button
            onClick={() => setIsOpen(true)}
            className="p-1 rounded-lg dark:text-white hover:dark:bg-white/10 hover:bg-stone-900/10 hover:dark:text-white"
          >
            <SquarePen />
          </button>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 ">
          {!isLoading ? (
            rooms.length > 0 ? (
              rooms.map((room) => {
                return <ChatButton key={room.id} room={room} />;
              })
            ) : (
              <span className="text-center dark:text-blue-500">
                快去新增好友或加入群組吧!
              </span>
            )
          ) : (
            <LoadingList />
          )}
        </div>
      </div>

      <CreateRoomModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}
