"use client";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MessageInterface, MessageType, MetaData } from "../lib/type";
import {
  Ellipsis,
  Reply,
  Download,
  X,
  Pencil,
  Trash2,
  LucideIcon,
} from "lucide-react";

import moment from "moment";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { useChatStore } from "../store/ChatStore";
import Link from "next/link";
import { useUserProfile } from "@/hook/hooks";
import {
  replyText,
  messageType,
  deleteMessage,
  formatSize,
  getFileIcon,
} from "../lib/util";
import WavesurferAudio from "./Audio";
import { CldImage, CldVideoPlayer } from "next-cloudinary";
import { Skeleton, Modal } from "@mui/material";
import "next-cloudinary/dist/cld-video-player.css";
import { getReplyMessage } from "../lib/server";

import { useAblyStore } from "../store/AblyStore";
import { useSession } from "next-auth/react";
function SettingBar({
  message,
  isOpen,
  setIsOpen,
}: {
  message: MessageInterface;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { setReply, setEdit, setCurrentMessage } = useChatStore();
  const { channel, room } = useAblyStore();
  const userId = useSession()?.data?.userId;

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  const handleDownload = useCallback(async () => {
    const a = document.createElement("a");
    if (!message.meta_data) return;
    try {
      const response = await fetch(message.meta_data.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = message.text;
      a.target = "_blank";
      a.click();
    } catch (error) {
      console.log(error);
    }
  }, [message]);

  const handleDelete = useCallback(async () => {
    if (!room || !channel || !message.id) return;
    try {
      setCurrentMessage((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: "deleting" } : msg
        )
      );

      const res = await deleteMessage(message.id);
      if (res) {
        await room.publish("message", {
          action: "delete",
          newMessage: { id: message.id, room: message.room },
        });
        await channel.publish("notify", {
          action: "delete",
          newMessage: { id: message.id, room: message.room },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, [room, channel, message, setCurrentMessage]);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const dropdown = document.getElementById(`dropdown-${message.id}`);
    const target = e.target as HTMLElement;

    if (!dropdown?.contains(target)) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const dropdown = document.getElementById(`dropdown-${message.id}`);
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, message.id, setIsOpen]);
  return (
    <div
      id={`dropdown-${message.id}`}
      className={" inline-flex relative  hs-dropdown "}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onTouchStart={handleClick}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        data-hs-dropdown-toggle={`dropdown-menu-${message.id}`}
        className={twMerge(
          "hs-dropdown-toggle  p-1.5 inline-flex justify-center items-center gap-2 rounded-md   text-stone-600 hover:bg-gray-100  dark:text-white/50 hover:dark:text-white/80 hover:dark:bg-white/10 focus:outline-none focus:dark:bg-white/10 hover:opacity-100",
          isOpen && "opacity-100"
        )}
      >
        <Ellipsis size={16} />
      </button>

      {isOpen && (
        <div className="absolute -left-10  mt-2 w-fit z-50  border bg-white shadow-sm dark:bg-neutral-800  rounded-lg p-1.5 animate-in fade-in slide-in-from-top-1">
          <div className="py-1 first:pt-0 last:pb-0">
            <p className="text-center">
              {moment(message.created_at).format("a hh:mm")}
            </p>
            {/* <button
              className="w-full flex items-center gap-x-3.5 py-1.5 px-2.5 text-sm rounded-md text-neutral-300 hover:bg-neutral-700"
              onClick={() => {
                setReply(message);
                setEdit(null);
                setIsOpen(false);
              }}
            >
              回覆
            </button> */}

            {message.meta_data && messageType(message.meta_data) && (
              <button
                className={twMerge(
                  "w-full flex items-center gap-x-3.5 py-1.5 px-2.5 text-sm rounded-md text-stone-700 hover:bg-gray-100 dark:text-neutral-300 hover:dark:bg-neutral-700"
                )}
                onClick={() => {
                  setIsOpen(false);
                  handleDownload();
                }}
              >
                <Download size={20} />
                下載
              </button>
            )}
            {message.sender === userId && (
              <>
                <button
                  className={twMerge(
                    "w-full flex items-center gap-x-3.5 py-1.5 px-2.5 text-sm rounded-md text-stone-700 hover:bg-gray-100 dark:text-neutral-300 hover:dark:bg-neutral-700",
                    (message.sender !== userId || message.meta_data) && "hidden"
                  )}
                  onClick={() => {
                    setEdit(message);
                    setReply(null);
                    setIsOpen(false);
                  }}
                >
                  <Pencil size={20} />
                  編輯
                </button>
                <button
                  className={twMerge(
                    "w-full flex items-center gap-x-3.5 py-1.5 px-2.5 text-sm rounded-md hover:bg-gray-100 text-red-400 hover:dark:bg-neutral-700",
                    message.sender !== userId && "hidden"
                  )}
                  onClick={() => {
                    setIsOpen(false);
                    handleDelete();
                  }}
                >
                  <Trash2 size={20} />
                  刪除
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MessageTextFormat({
  metaData,
  text,
  sender,
  message_type,
}: {
  metaData: MetaData;
  text: string;
  sender: string;
  message_type: MessageType;
}) {
  const userId = useSession()?.data?.userId;
  const [metaPreview, setMetaPreview] = useState(false);
  const Icon: LucideIcon = getFileIcon(
    text.split(".")[text.split(".").length - 1]
  );

  const type = useMemo(() => {
    return messageType(metaData);
  }, [metaData]);
  const handleDownload = useCallback(async () => {
    try {
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
  }, [metaData, text]);

  return (
    <>
      {!type && (
        <>
          {message_type === "url" ? (
            <Link
              className="underline break-all whitespace-pre-wrap"
              href={text}
              target="_blank"
            >
              {text}
            </Link>
          ) : (
            <p className="break-all whitespace-pre-wrap ">{text}</p>
          )}
        </>
      )}
      {type && (
        <>
          {type === "audio" && (
            <WavesurferAudio
              url={metaData.url}
              backgroundColor={
                sender === userId
                  ? "bg-blue-500"
                  : document.documentElement.classList.contains("dark")
                  ? "bg-stone-800"
                  : "bg-gray-400/20"
              }
            />
          )}
          {message_type === "file" && (
            <>
              {!metaData ? (
                <Skeleton width={200} animation="wave" height={200} />
              ) : (
                <button
                  title={text}
                  onClick={handleDownload}
                  className={twMerge(
                    "flex items-center p-2 rounded-md bg-gray-500/20 gap-x-1 dark:bg-stone-800",
                    sender === userId && "bg-blue-500"
                  )}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="flex flex-col items-center p-2 rounded-full bg-white/5">
                      <Icon />
                    </span>
                    <p className="text-xs">
                      {text.split(".")[text.split(".").length - 1]}
                    </p>
                  </div>
                  <span className="w-full max-w-40">
                    <p className="text-sm break-all text-start">{text}</p>
                    <span className="flex items-center justify-between w-full gap-1 mt-1 text-xs">
                      <p>大小:{formatSize(metaData.size)}</p>
                      <p>點擊下載</p>
                    </span>
                  </span>
                </button>
              )}
            </>
          )}
          {message_type === "media" && (
            <>
              {type === "image" && (
                <>
                  <Modal
                    className="absolute flex items-center justify-center w-full h-full overflow-hidden "
                    open={metaPreview}
                    onClose={() => setMetaPreview(false)}
                  >
                    <div className=" w-10/12  max-w-[550px] max-h-[95%] overflow-auto p-2 rounded-md">
                      <div className="flex justify-end">
                        <button
                          onClick={handleDownload}
                          className="p-1 rounded-lg hover:bg-white/5"
                        >
                          <Download className="text-white " />
                        </button>
                        <button
                          onClick={() => setMetaPreview(false)}
                          className="p-1 rounded-lg hover:bg-white/5"
                        >
                          <X className="text-white " />
                        </button>
                      </div>

                      <CldImage
                        className={"w-full h-full rounded-md "}
                        src={metaData.url}
                        width={400}
                        zoom="0.5"
                        height={400}
                        alt={text}
                        title={text}
                      />
                    </div>
                  </Modal>

                  {!metaData ? (
                    <Skeleton width={200} animation="wave" height={200} />
                  ) : (
                    <CldImage
                      onClick={() => setMetaPreview(true)}
                      className="w-full rounded-md max-w-[300px] max-h-[500px] bg-stone-900"
                      src={metaData.url}
                      width={400}
                      height={400}
                      alt={text}
                      title={text}
                    />
                  )}
                </>
              )}
              {type === "video" && (
                <>
                  <Modal
                    className="absolute flex items-center justify-center w-full h-full overflow-hidden "
                    open={metaPreview}
                    onClose={() => setMetaPreview(false)}
                  >
                    <div className=" w-10/12  max-w-[1024px] max-h-[90dvh] overflow-auto p-2 rounded-md">
                      <div className="flex justify-end">
                        <button
                          onClick={handleDownload}
                          className="p-1 rounded-lg hover:bg-white/5"
                        >
                          <Download className="text-white " />
                        </button>
                        <button
                          onClick={() => setMetaPreview(false)}
                          className="p-1 rounded-lg hover:bg-white/5"
                        >
                          <X className="text-white " />
                        </button>
                      </div>
                      <CldVideoPlayer
                        className="w-full h-full rounded-md "
                        src={metaData.url}
                        width={2480}
                      />
                    </div>
                  </Modal>
                  {!metaData ? (
                    <Skeleton width={200} animation="wave" height={200} />
                  ) : (
                    <video
                      title={text}
                      onClick={() => setMetaPreview(true)}
                      className="w-full rounded-md max-w-[300px] max-h-[500px] bg-stone-900"
                      src={metaData.url}
                      muted
                      onMouseEnter={(e) => {
                        console.log(e);
                        const video = e.target as HTMLVideoElement;
                        video.play();
                      }}
                      onMouseLeave={(e) => {
                        console.log(e);
                        const video = e.target as HTMLVideoElement;
                        video.pause();
                      }}
                      width={400}
                      height={400}
                    />
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

function SendMessage({
  message,
  scrollFn,
}: {
  message: MessageInterface;
  scrollFn: (messageId: string) => void;
}) {
  const userId = useSession()?.data?.userId;
  const [isOpen, setIsOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState<MessageInterface | null>(
    null
  );
  const { setEdit, setReply } = useChatStore();
  useEffect(() => {
    const getReply = async () => {
      if (!message.reply) return;
      const replyMsg = await getReplyMessage(message.reply);
      setReplyMessage(replyMsg);
    };
    getReply();
  }, [message]);

  const replyUser = useUserProfile(replyMessage?.sender);
  const user = useUserProfile(message.sender);
  return (
    <>
      <div
        className={twMerge(
          " relative max-w-[80%] flex flex-col group  transition-all ",
          message.sender === userId && "items-end ",
          message.status === "deleting" && "scale-0 duration-300 h-0 "
        )}
      >
        {user?.id !== userId && (
          <span className="text-xs dark:text-white/80 ">{user?.username}</span>
        )}

        {message.reply && (
          <div
            onClick={() => {
              if (replyMessage) scrollFn(replyMessage.id!);
            }}
            onTouchStart={() => {
              if (replyMessage) scrollFn(replyMessage.id!);
            }}
            className={twMerge(
              "p-2 rounded-lg bg-stone-900/10 dark:bg-white/5 w-fit mb-1 cursor-pointer ",
              replyUser?.id === userId && "bg-blue-600/50 text-white"
            )}
          >
            <div className="flex items-center justify-start font-semibold gap-x-1">
              {replyMessage && (
                <Image
                  className={twMerge(
                    "w-6 h-6 rounded-full mt-1 mr-1  bg-white/20"
                  )}
                  width={20}
                  height={20}
                  alt="avatar"
                  src={replyUser?.image || "/user.png"}
                />
              )}

              <p className="text-sm dark:text-white">{replyUser?.username}</p>
            </div>
            <span className="flex items-center justify-between ">
              <p className="break-all whitespace-pre-wrap ">
                {replyMessage && replyText(replyMessage)}
                {!replyMessage && "已刪除訊息"}
              </p>
              {replyMessage && (
                <>
                  {replyMessage.meta_data &&
                    messageType(replyMessage.meta_data!) === "image" && (
                      <Image
                        alt={replyMessage.text}
                        className="object-cover w-10 h-10 rounded-md"
                        width={50}
                        height={50}
                        src={replyMessage.meta_data?.url}
                      />
                    )}
                  {replyMessage.meta_data &&
                    messageType(replyMessage.meta_data!) === "video" && (
                      <video
                        muted
                        className="w-12 h-12 rounded-md"
                        src={replyMessage.meta_data.url}
                      ></video>
                    )}
                </>
              )}
            </span>
          </div>
        )}

        <div
          className={twMerge(
            "flex w-full items-end",
            message.sender === userId && "flex-row-reverse"
          )}
        >
          <div
            className={twMerge(
              "p-2 bg-blue-500 rounded-lg text-white h-fit  w-fit max-w-full flex items-center  transition-all  ",
              message.sender !== userId &&
                "dark:bg-white/20 bg-gray-400/20 text-stone-700 dark:text-white ",
              message.status === "pending" && "bg-blue-500/70  ",
              message.meta_data && "bg-transparent p-0",
              message.meta_data &&
                message.status === "pending" &&
                " blur-[5px] pointer-events-none"
            )}
          >
            <MessageTextFormat
              text={message.text}
              sender={message.sender}
              metaData={message.meta_data!}
              message_type={message.type}
            />
          </div>
          <span
            className={twMerge(
              "  flex flex-col justify-end items-center text-xs whitespace-nowrap  text-gray-500  dark:text-white/50 font-semibold  px-1 ",
              message.status === "pending" && "text-white/30"
            )}
          >
            <div
              className={twMerge(
                "flex transition-opacity pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100",
                isOpen && "opacity-100"
              )}
            >
              {message.status === "send" && (
                <SettingBar
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  message={message}
                />
              )}

              <button
                className={twMerge(
                  "w-full flex items-center gap-x-3.5 p-1 text-sm rounded-md text-stone-700 hover:bg-gray-100 dark:text-neutral-300 hover:dark:bg-neutral-700 duration-200 hover:opacity-100"
                )}
                onClick={() => {
                  setReply(message);
                  setEdit(null);
                }}
              >
                <Reply />
              </button>
            </div>
          </span>
        </div>
      </div>
    </>
  );
}
function ErrorMessage({ message }: { message: MessageInterface }) {
  const userId = useSession()?.data?.userId;
  return (
    <>
      <div
        className={twMerge(
          "p-2 bg-blue-500 rounded-xl dark:text-white    max-w-[80%]",
          message.sender !== userId && "bg-white/20 text-black",
          message.status === "pending" && "bg-blue-500/80"
        )}
      >
        <p className={twMerge(" break-words ")}>{message.text}</p>
      </div>
      <span className="p-1 text-sm font-semibold text-red-600">error</span>
    </>
  );
}

const Message = forwardRef<
  HTMLDivElement,
  { message: MessageInterface; scrollFn: (messageId: string) => void }
>(({ message, scrollFn }, ref) => {
  const userId = useSession()?.data?.userId;

  const user = useUserProfile(message.sender);
  return (
    <div
      className={twMerge(
        " flex  w-full max-w-full mt-1 ",
        message.sender === userId && " justify-end"
      )}
    >
      <div
        ref={ref}
        className={twMerge(
          "flex items-start min-w-0 w-full ",
          message.sender === userId && " flex-row-reverse"
        )}
      >
        <Image
          className={twMerge(
            "w-6 h-6 rounded-full mt-1 mr-1  bg-white/20",
            message.sender === userId && "hidden"
          )}
          width={20}
          height={20}
          alt="avatar"
          src={user?.image || "/user.png"}
        />

        {message.status !== "failed" && (
          <SendMessage scrollFn={scrollFn} message={message} />
        )}
        {message.status === "failed" && <ErrorMessage message={message} />}
      </div>
    </div>
  );
});
Message.displayName = "Message";
export default Message;
