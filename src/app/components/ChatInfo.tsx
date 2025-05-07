"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";

import { useChatStore } from "../store/ChatStore";
import { useAblyStore } from "../store/AblyStore";
import { MessageInterface, MetaData } from "../lib/type";
import { messageType, formatSize, deleteRoom } from "../lib/util";
import { UserPlus, LogOut, Download, X, LucideIcon, Users } from "lucide-react";
import BadgeAvatar from "./Avatar";
import { getFileIcon, joinRoom } from "../lib/util";
import { twMerge } from "tailwind-merge";
import { CldImage, CldVideoPlayer } from "next-cloudinary";
import Image from "next/image";
import { CircularProgress, Modal } from "@mui/material";
import { useAuthStore } from "../store/AuthStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useChatInfo } from "@/hook/hooks";
import moment from "moment";

function RoomUsers() {
  const { currentChat, currentUser } = useChatStore();
  const [open, setOpen] = useState(false);
  const userId = useSession()?.data?.userId;

  const roomUsers = useMemo(() => {
    if (!currentChat) return [];
    const members = currentChat.room_members;
    const roomMembers = members.map((m) => {
      const user = currentUser.find((cu) => cu.id === m.user_id);
      if (user) {
        const userMember = { ...m, user };
        return userMember;
      }
    });
    return roomMembers;
  }, [currentChat, currentUser]);
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
        <div className="flex flex-col w-full h-64 max-w-md gap-2 p-2 rounded-md dark:bg-stone-900">
          <h1 className="text-xl text-center dark:text-white">成員</h1>

          <div className="flex flex-col max-h-full gap-2 overflow-auto dark:text-white">
            {roomUsers &&
              roomUsers.map((rm) => (
                <button
                  className="flex flex-row items-center gap-4 p-2 rounded-md hover:dark:bg-white/10"
                  key={rm?.id}
                >
                  <BadgeAvatar user={rm?.user_id} />
                  <span className="text-start">
                    <p>{userId === rm?.user_id ? "你" : rm?.user.name}</p>
                    <p className="text-xs dark:text-white/40">
                      加入日期:
                      {rm?.created_at && moment(rm.created_at).format("LL")}
                    </p>
                  </span>
                </button>
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

  const [filterMessages, setFilterMessages] = useState<MessageInterface[]>([]);
  const [filterType, setFilterType] = useState("file");
  const [metaPreview, setMetaPreview] = useState(false);
  const [previewMessage, setPreviewMessage] = useState<MessageInterface | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [roomMembers, setRoomMembers] = useState<string[]>([]);
  const { friends } = useAuthStore();
  const [joinOpen, setJoinOpen] = useState(false);
  const userId = useSession()?.data?.userId;

  const router = useRouter();
  const { recipentUser, displayName } = useChatInfo(currentChat!, userId!);

  const handleFileType = useCallback((fileType: string) => {
    setFilterType(fileType);
  }, []);

  const getMetaMessages = useCallback(async () => {
    if (!currentChat) return;
    setIsLoading(true);
    setFilterMessages([]);
    try {
      const res = await fetch("/api/messages/meta", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metaType: filterType,
          roomId: currentChat?.id,
        }),
      });
      if (res.ok) {
        const data: MessageInterface[] = await res.json();
        const filterData = data.filter((msg) => {
          if (messageType(msg.meta_data!) === "audio") return null;
          return msg;
        });
        setFilterMessages(filterData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [filterType, currentChat]);

  // const handleFilter = useCallback(() => {
  //   if (!currentMessage || currentMessage.length === 0) return;
  //   const filterData = currentMessage.filter((msg) => {
  //     if (messageType(msg.meta_data!) !== "audio" && msg.type === filterType)
  //       return msg;
  //     return null;
  //   });

  //   setFilterMessages(filterData);
  // }, [currentMessage, filterType]);

  useEffect(() => {
    getMetaMessages();
  }, [getMetaMessages]);

  const handleDownload = useCallback(
    async (metaData: MetaData, text: string) => {
      try {
        if (!metaData.url) return;
        const res = await fetch(metaData.url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = text;
        a.click();
      } catch (error) {
        console.log(error);
      }
    },
    []
  );

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
      setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [channel, roomId, roomMembers]);
  return (
    <div
      className={twMerge(
        "h-full overflow-hidden transition-all   animate-slide-in max-sm:w-full bg-gray-white/20 backdrop-blur-xl border-l      dark:border-white/10 w-80 hidden  xl:scale-100 xl:relative xl:block absolute top-0 right-0  z-30   dark:bg-stone-800/90 ",
        chatInfoOpen && "block"
      )}
    >
      {currentChat && (
        <>
          <button
            className="absolute xl:hidden top-4 right-2"
            onClick={() => setChatInfoOpen(false)}
          >
            <X className="text-gray-400 hover:dark:text-white" />
          </button>
          {metaPreview && previewMessage && (
            <Modal
              className="absolute flex items-center justify-center w-full h-full overflow-hidden "
              open={metaPreview}
              onClose={() => setMetaPreview(false)}
            >
              <>
                {previewMessage.meta_data &&
                  messageType(previewMessage.meta_data) === "image" && (
                    <div className=" w-10/12  max-w-[550px] max-h-[95%] overflow-auto p-2 rounded-md">
                      <div className="flex justify-end">
                        <button className="p-1 rounded-sm hover:bg-white/5">
                          <Download className="dark:text-white " />
                        </button>
                        <button
                          onClick={() => setMetaPreview(false)}
                          className="p-1 rounded-lg hover:bg-white/5"
                        >
                          <X className="dark:text-white " />
                        </button>
                      </div>
                      {previewMessage.meta_data &&
                        messageType(previewMessage.meta_data) === "image" && (
                          <CldImage
                            className={"w-full h-full rounded-md "}
                            src={previewMessage.meta_data.url}
                            width={400}
                            zoom="0.5"
                            height={400}
                            alt={previewMessage.text}
                            title={previewMessage.text}
                          />
                        )}
                    </div>
                  )}
                {previewMessage.meta_data &&
                  messageType(previewMessage.meta_data) === "video" && (
                    <div className=" w-10/12  max-w-[1024px] max-h-[90dvh] overflow-auto p-2 rounded-md">
                      <div className="flex justify-end">
                        <button className="p-1 rounded-lg hover:bg-white/5">
                          <Download className="dark:text-white " />
                        </button>
                        <button
                          onClick={() => setMetaPreview(false)}
                          className="p-1 rounded-lg hover:bg-white/5"
                        >
                          <X className="dark:text-white " />
                        </button>
                      </div>
                      <CldVideoPlayer
                        className="w-full h-full rounded-md "
                        src={previewMessage.meta_data.url}
                        width={2480}
                      />
                    </div>
                  )}
              </>
            </Modal>
          )}
          <Modal
            open={joinOpen}
            onClose={() => {
              setJoinOpen(false);
              setRoomMembers([]);
            }}
          >
            <div className="absolute w-11/12 max-w-[500px] p-4  transform -translate-x-1/2 -translate-y-1/2 bg-stone-900 rounded-md top-1/2 left-1/2  ">
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
                            (rm) => rm.user_id === friend.id
                          )}
                          type="button"
                          onClick={() => handleRoomMember(friend.id)}
                          className={twMerge(
                            " relative flex  items-center disabled:text-white/40  gap-2 w-full text-white  min-w-fit after:content-[''] after:text-xs after:absolute after:w-4 after:h-4 after:border after:bottom-6 after:right-2 after:rounded-full",
                            roomMembers.includes(friend.id) &&
                              "after:content-['✔'] after:text-xs after:absolute after:w-4 after:border-0 after:h-4 after:bottom-6 after:right-2 after:rounded-full after:animate-in after:zoom-in-0 after:bg-blue-500"
                          )}
                        >
                          <BadgeAvatar
                            width={55}
                            height={55}
                            user={friend.id}
                          />
                          <p className="truncate">{friend.name}</p>
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
              <p>{displayName}</p>
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
          <div className="flex flex-col w-full h-[calc(100%-210px)] ">
            <span className="flex w-full dark:text-white ">
              <button
                onClick={() => handleFileType("file")}
                className={twMerge(
                  "flex-1 py-2 border-b-2 border-transparent",
                  filterType === "file" && "  border-blue-600"
                )}
              >
                檔案
              </button>
              <button
                onClick={() => handleFileType("media")}
                className={twMerge(
                  "flex-1 py-2   border-b-2 border-transparent",
                  filterType === "media" && "  border-blue-600"
                )}
              >
                媒體
              </button>
              {/* <button
                onClick={() => handleFileType("url")}
                className={twMerge(
                  "flex-1 py-2   border-b-2 border-transparent",
                  filterType === "url" && " border-blue-600"
                )}
              >
                連結
              </button> */}
            </span>
            <div className="flex-1 overflow-hidden ">
              {filterMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  {isLoading && <CircularProgress />}
                  {!isLoading && (
                    <p className="text-lg text-center dark:text-white/50">
                      {filterType === "file" && "暫無檔案"}
                      {filterType === "media" && "暫無媒體"}
                      {filterType === "url" && "暫無連結"}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {filterType === "media" && (
                    <div className="grid h-full grid-cols-3 overflow-y-auto">
                      {filterMessages.map((msg) => {
                        if (
                          msg.meta_data &&
                          messageType(msg.meta_data) === "image"
                        ) {
                          return (
                            <Image
                              onClick={() => {
                                setMetaPreview(true);
                                setPreviewMessage(msg);
                              }}
                              className="object-cover w-full rounded-sm aspect-square bg-white/20"
                              key={msg.id}
                              width={100}
                              height={100}
                              src={msg.meta_data.url}
                              alt={msg.text}
                            />
                          );
                        } else if (
                          msg.meta_data &&
                          messageType(msg.meta_data) === "video"
                        ) {
                          return (
                            <video
                              onClick={() => {
                                setMetaPreview(true);
                                setPreviewMessage(msg);
                              }}
                              className="object-cover w-full rounded-sm aspect-square bg-white/20"
                              key={msg.id}
                              width={100}
                              height={100}
                              src={msg.meta_data.url}
                            ></video>
                          );
                        }
                      })}
                    </div>
                  )}
                  {filterType === "file" && (
                    <div className="flex flex-col items-center w-full h-full gap-1 pt-1 overflow-y-auto">
                      {filterMessages.map((msg) => {
                        if (msg.meta_data) {
                          const Icon: LucideIcon = getFileIcon(
                            msg.text.split(".")[msg.text.split(".").length - 1]
                          );
                          return (
                            <button
                              title={msg.text}
                              key={msg.id}
                              onClick={() =>
                                handleDownload(msg.meta_data!, msg.text)
                              }
                              className="flex items-center w-11/12 gap-2 p-2 rounded-md dark:text-white dark:bg-stone-800/5"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <span className="flex flex-col items-center p-2 rounded-full bg-gray-600/5 dark:bg-white/5">
                                  <Icon size={20} />
                                </span>
                                <p className="text-xs">
                                  {
                                    msg.text.split(".")[
                                      msg.text.split(".").length - 1
                                    ]
                                  }
                                </p>
                              </div>
                              <span className="w-full ">
                                <p className="text-sm break-all text-start">
                                  {msg.text}
                                </p>
                                <span className="flex items-center justify-between w-full gap-1 mt-1 text-xs">
                                  <p>大小:{formatSize(msg.meta_data.size)}</p>
                                  <p>點擊下載</p>
                                </span>
                              </span>
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
