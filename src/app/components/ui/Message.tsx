"use client";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MessageInterface, MessageType, MetaData } from "../../lib/type";
import {
  Ellipsis,
  Reply,
  Download,
  Pencil,
  Trash2,
  LucideIcon,
} from "lucide-react";

import moment from "moment";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { useChatStore } from "../../store/ChatStore";
import Link from "next/link";
import { useUserProfile } from "@/hook/useUserProfile";
import {
  replyText,
  messageType,
  deleteMessage,
  formatSize,
  getFileIcon,
  handleDownload,
} from "../../lib/util";
import WavesurferAudio from "./Audio";
import { CldImage } from "next-cloudinary";
import { Popover, Skeleton } from "@mui/material";
import "next-cloudinary/dist/cld-video-player.css";
import { getReplyMessage } from "../../lib/server";

import { useAblyStore } from "../../store/AblyStore";
import { useSession } from "next-auth/react";
import PreviewMediaModal from "./PreviewMediaModal";

function SettingBar({ message }: { message: MessageInterface }) {
  const { setReply, setEdit, setCurrentMessage } = useChatStore();
  const { channel, room } = useAblyStore();
  const userId = useSession()?.data?.userId;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
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
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <div>
      <button
        type="button"
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        data-hs-dropdown-toggle={`dropdown-menu-${message.id}`}
        className={twMerge(
          "  p-2 inline-flex justify-center items-center gap-2 rounded-md   text-stone-600 hover:bg-gray-100  dark:text-white/50 hover:dark:text-white/80 hover:dark:bg-white/10 focus:outline-none focus:dark:bg-white/10 hover:opacity-100"
        )}
        onClick={handleOpen}
      >
        <Ellipsis size={16} />
      </button>

      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        className="p-0 "
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
            padding: "2px",
          },
        }}
      >
        <div className="flex flex-col p-1 bg-white border rounded-md dark:bg-neutral-900">
          <p className="text-xs text-center dark:text-white/50">
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

          {message.meta_data && messageType(message.meta_data) !== "audio" && (
            <button
              className={twMerge(
                "w-full flex items-center gap-x-3.5 py-1.5 px-2.5 text-sm rounded-md text-stone-700 hover:bg-gray-100 dark:text-neutral-300 hover:dark:bg-neutral-700"
              )}
              onClick={() => {
                handleDownload(message.meta_data?.url || "", message.text);
              }}
            >
              <Download size={20} />
              下載
            </button>
          )}
          {message.sender === userId && (
            <div>
              <button
                className={twMerge(
                  "w-full flex items-center gap-x-3.5 py-1.5 px-2.5 text-sm rounded-md text-stone-700 hover:bg-gray-100 dark:text-neutral-300 hover:dark:bg-neutral-700",
                  (message.sender !== userId || message.meta_data) && "hidden"
                )}
                onClick={() => {
                  setEdit(message);
                  setReply(null);
                  handleClose();
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
                  handleDelete();
                  handleClose();
                }}
              >
                <Trash2 size={20} />
                刪除
              </button>
            </div>
          )}
        </div>
      </Popover>
    </div>
  );
}

export function MessageTextFormat({
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
  const [isOpen, setIsOpen] = useState(false);
  const Icon: LucideIcon = getFileIcon(text);
  const [previewMedia, setPreviewMedia] = useState<{
    alt: string;
    url: string;
    type: string;
  } | null>(null);
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

  const handlePreview = useCallback(() => {
    const mediaType = messageType(metaData!);
    if (!mediaType || !metaData) return;
    setIsOpen(true);
    setPreviewMedia({
      alt: text,
      url: metaData.url,
      type: mediaType,
    });
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
              <PreviewMediaModal
                open={isOpen}
                media={previewMedia!}
                onClose={() => setIsOpen(false)}
              />
              {type === "image" && (
                <>
                  {!metaData ? (
                    <Skeleton width={200} animation="wave" height={200} />
                  ) : (
                    <CldImage
                      onTouchEnd={() => handlePreview()}
                      onClick={() => handlePreview()}
                      className="w-full -z-10 rounded-md max-w-[300px] max-h-[500px] bg-stone-900"
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
                  {!metaData ? (
                    <Skeleton width={200} animation="wave" height={200} />
                  ) : (
                    <video
                      title={text}
                      onClick={() => handlePreview()}
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
  user: { id: string; name: string; image: string };
}) {
  const userId = useSession()?.data?.userId;

  const [replyMessage, setReplyMessage] = useState<MessageInterface | null>(
    null
  );
  const { setEdit, setReply, currentMessage } = useChatStore();
  useEffect(() => {
    const getReply = async () => {
      if (!message.reply) return;
      const hasMessageFind = currentMessage.find(
        (msg) => msg.id === message.reply
      );
      if (hasMessageFind) {
        setReplyMessage(hasMessageFind);
        return;
      }
      const replyMsg = await getReplyMessage(message.reply);
      setReplyMessage(replyMsg);
    };
    getReply();
  }, [message, currentMessage]);

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
          <span className="text-xs dark:text-white/80 ">{user?.name}</span>
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
              "p-2 rounded-lg bg-stone-900/10 dark:bg-white/5 text-white w-fit mb-1 cursor-pointer  backdrop-blur-2xl ",
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

              <p className="text-sm dark:text-white">{replyUser?.name}</p>
            </div>
            <span className="flex items-center justify-between ">
              <p className="break-all whitespace-pre-wrap ">
                {replyMessage && replyText(replyMessage)}
                {!replyMessage && "已回復訊息"}
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
              "p-2 bg-blue-500 rounded-lg backdrop-blur-3xl text-white h-fit  w-fit max-w-full flex items-center  transition-all  ",
              message.sender !== userId &&
                "dark:bg-neutral-700/70  bg-stone-200/70 text-stone-900 dark:text-white ",
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
                "flex transition-opacity pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100"
              )}
            >
              {message.status === "send" && <SettingBar message={message} />}

              <button
                className={twMerge(
                  "w-full flex items-center gap-x-3.5  p-1 text-sm rounded-md text-stone-700 hover:bg-gray-100 dark:text-neutral-300 hover:dark:bg-neutral-700 duration-200  hover:opacity-100"
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
  {
    message: MessageInterface;
    scrollFn: (messageId: string) => void;
    user: { id: string; name: string; image: string };
  }
>(({ message, scrollFn, user }, ref) => {
  const userId = useSession()?.data?.userId;

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
          <SendMessage scrollFn={scrollFn} message={message} user={user} />
        )}
        {message.status === "failed" && <ErrorMessage message={message} />}
      </div>
    </div>
  );
});
Message.displayName = "Message";
export default Message;
