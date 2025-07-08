import { ClientMessageInterface, MetaData } from "@/types/type";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

import {
  Copy2ClipBoard,
  formatSize,
  getFileIcon,
  handleDownload,
  messageType,
} from "@/app/lib/util";

import { deleteMessage } from "@/app/lib/api/message/messageApi";
import PreviewMediaModal from "../../ui/Modal/PreviewMediaModal";
import { useChatStore } from "@/app/store/ChatStore";
import { useAblyStore } from "@/app/store/AblyStore";
import {
  Download,
  Ellipsis,
  Pencil,
  Trash2,
  Clipboard,
  LucideIcon,
  Reply,
  Send,
} from "lucide-react";
import { Popover } from "@mui/material";
import { PhotoProvider, PhotoView } from "react-photo-view";
import moment from "moment";
import "react-photo-view/dist/react-photo-view.css";
import WavesurferAudio from "../../ui/Audio";

import { usePopbox } from "@/hook/usePopbox";
import UserPopbox from "../../ui/UserPopbox";
import { useTheme } from "next-themes";
import MarkDownText from "../../ui/MarkDownText";

type MessageItemProps = {
  index: number;
  message: ClientMessageInterface;
  scrollToMessage: (messageId: string) => Promise<void>;
  target: string;
  roomUsers: Record<
    string,
    {
      id: string;
      name: string;
      image: string;
    }
  >;
  setTarget: React.Dispatch<React.SetStateAction<string>>;
};

const SettingBar = memo(function SettingBar({
  message,
  isOwn,
}: {
  isOwn: boolean;
  message: ClientMessageInterface;
}) {
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

  const handleReply = useCallback(() => {
    setReply(message);
  }, [setReply, message]);

  return (
    <div
      className={twMerge(
        "flex    justify-end items-end   opacity-0 group-hover:opacity-100",
        isOwn ? " flex-row-reverse" : " flex-row"
      )}
    >
      <button
        className={twMerge(
          "  p-1 inline-flex justify-center items-center gap-2 rounded-md   text-stone-600 hover:bg-gray-100  dark:text-white/50 hover:dark:text-white/80 hover:dark:bg-white/10 focus:outline-none focus:dark:bg-white/10 hover:opacity-100"
        )}
        onClick={handleReply}
      >
        <Reply />
      </button>
      <button
        type="button"
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        data-hs-dropdown-toggle={`dropdown-menu-${message.id}`}
        className={twMerge(
          "  p-2 inline-flex justify-center items-center gap-2 rounded-md   text-stone-600 hover:bg-gray-100  dark:text-white/50 hover:dark:text-white/80 hover:dark:bg-white/10 "
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
          {!message.meta_data && (
            <button
              className={twMerge(
                "w-full flex items-center gap-x-3.5 py-1.5 px-2.5 text-sm rounded-md text-stone-700 hover:bg-gray-100 dark:text-neutral-300 hover:dark:bg-neutral-700"
              )}
              onClick={async () => {
                await Copy2ClipBoard(message.text);
                handleClose();
              }}
            >
              <Clipboard size={20} />
              複製
            </button>
          )}

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
});

const MediaMessage = memo(function MediaMessage({
  message,
}: {
  message: ClientMessageInterface;
}) {
  const metaData = message.meta_data;
  const [open, setOpen] = useState(false);

  const type = useMemo(() => {
    if (!metaData) return false;
    return messageType(metaData);
  }, [metaData]);

  const PreviewMedia = useMemo(() => {
    if (!metaData) return;
    return {
      alt: message.text,
      url: metaData.url || "",
      type: type || "",
    };
  }, [metaData, type, message]);

  const handleVideoPlay = useCallback(
    async (e: React.MouseEvent<HTMLVideoElement>) => {
      const video = e.target as HTMLVideoElement;
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    },
    []
  );

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <div className="w-auto h-auto max-w-[300px] rounded-3xl">
      <PreviewMediaModal
        media={PreviewMedia}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      />
      {metaData ? (
        <>
          {type === "image" && (
            <PhotoProvider>
              <PhotoView src={metaData.url}>
                <Image
                  width={300}
                  height={300}
                  src={metaData.url}
                  className="w-full h-full rounded-3xl"
                  alt={message.text}
                />
              </PhotoView>
            </PhotoProvider>
          )}
          {type === "video" && (
            <video
              width={300}
              height={300}
              src={metaData.url}
              onClick={handleOpen}
              muted
              onMouseEnter={handleVideoPlay}
              onMouseLeave={handleVideoPlay}
              className="w-full h-full rounded-3xl"
            />
          )}
        </>
      ) : (
        <span className="w-full h-full dark:bg-neutral-800"></span>
      )}
    </div>
  );
});

const TextMessage = memo(function TextMessage({
  message,
  isOwn,
}: {
  message: ClientMessageInterface;
  isOwn: boolean;
}) {
  return (
    <div
      className={twMerge(
        " py-2 px-3 rounded-3xl text-start h-full break-all  text-wrap  w-fit max-w-full  text-ellipsis  backdrop-blur-3xl  overflow-hidden",
        isOwn
          ? " bg-blue-500 text-white "
          : "dark:bg-neutral-700/70   bg-stone-200/70 text-stone-900 dark:text-white"
      )}
    >
      <MarkDownText text={message.text} />
    </div>
  );
});

const AudioMessage = memo(function AudioMessage({
  metaData,
  isOwn,
}: {
  metaData: MetaData;
  isOwn: boolean;
}) {
  const { theme, systemTheme } = useTheme();
  const isDark =
    theme === "dark" || (theme === "system" && systemTheme === "dark");
  return (
    <WavesurferAudio
      url={metaData.url}
      isOwn={isOwn}
      isDark={isDark}
      backgroundColor={
        isOwn ? "bg-blue-500" : isDark ? "bg-white/10" : "bg-gray-400/20"
      }
    />
  );
});

const FileMessage = memo(function FileMessage({
  message,
  isOwn,
}: {
  message: ClientMessageInterface;
  isOwn: boolean;
}) {
  const metaData = message.meta_data;
  if (!metaData) return null;
  const Icon: LucideIcon = getFileIcon(message.text);
  return (
    <button
      title={message.text}
      onClick={() => handleDownload(metaData.url, message.text)}
      className={twMerge(
        "flex items-center p-2 px-3 rounded-3xl dark:text-white bg-gray-500/20 gap-x-1 dark:bg-stone-700/70",
        isOwn && "dark:bg-blue-500 bg-blue-500 text-white"
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <span className="flex flex-col items-center p-2 rounded-full bg-white/5">
          <Icon />
        </span>
        <p className="text-xs">
          {message.text.split(".")[message.text.split(".").length - 1]}
        </p>
      </div>
      <span className="w-full max-w-40">
        <p className="text-sm break-all text-start">{message.text}</p>
        <span className="flex items-center justify-between w-full gap-1 mt-1 text-xs">
          <p>大小:{formatSize(metaData.size)}</p>
          <p>點擊下載</p>
        </span>
      </span>
    </button>
  );
});
const NoteMessage = memo(function NoteMessage({
  message,

  isOwn,
}: {
  message: ClientMessageInterface;
  isOwn: boolean;
}) {
  const userId = useSession().data?.userId;
  return (
    <div className="flex flex-col">
      {message.reply_note && (
        <span className={twMerge(" w-fit text-xs dark:text-white/50")}>
          已回復
          {userId === message.reply_note.user_id
            ? "你"
            : message.reply_note?.user.name}
          的便利貼
        </span>
      )}
      <div
        className={twMerge(
          "inline-block text-start my-2   bg-stone-900/10 dark:bg-white/10  max-w-48 p-2 rounded-2xl",
          isOwn && "bg-blue-500  text-white"
        )}
      >
        <span className="flex items-center gap-2 w-fit">
          <Image
            alt={"note_user"}
            width={30}
            height={30}
            className="w-8 h-8 rounded-full aspect-square"
            src={message?.reply_note?.user.image || "/user.png"}
          />
          <p className="text-sm font-bold">{message?.reply_note?.user.name}</p>
        </span>

        <p className="px-2 mt-2 text-sm truncate dark:text-white/70 ">
          {message?.reply_note?.text}
        </p>
      </div>
    </div>
  );
});

const ReplyMessage = memo(function ReplyMessage({
  message,
  roomUsers,
  isOwn,
  scrollToMessage,
}: {
  message: ClientMessageInterface;
  roomUsers: Record<
    string,
    {
      id: string;
      name: string;
      image: string;
    }
  >;
  isOwn: boolean;
  scrollToMessage: (messageId: string) => Promise<void>;
}) {
  const userId = useSession().data?.userId;
  const replyOwn = message.sender === userId;
  const replySender = roomUsers[message.sender];

  const Message = useCallback(() => {
    const messageType = {
      text: <TextMessage message={message} isOwn={replyOwn} />,
      media: <MediaMessage message={message} />,
      file: <FileMessage message={message} isOwn={replyOwn} />,

      audio: message.meta_data && (
        <AudioMessage metaData={message.meta_data} isOwn={replyOwn} />
      ),
    };

    return messageType[message.type];
  }, [message, replyOwn]);

  return (
    <div
      className={twMerge(
        " flex flex-col gap-2 pb-2 pl-7 w-fit max-w-[80%] ",
        isOwn && "items-end pr-2"
      )}
      onClick={() => message.id && scrollToMessage(message.id)}
    >
      {replySender && (
        <span className={twMerge(" w-fit text-xs dark:text-white/50")}>
          {`${isOwn ? "你" : ""}已回復${replyOwn ? "自己" : replySender.name}`}
        </span>
      )}

      <span
        className={twMerge(
          " relative rounded-3xl w-fit  z-0",
          isOwn ? " text-end" : "text-start"
        )}
      >
        <div className="absolute inset-0 z-10 rounded-3xl opacity-10 dark:opacity-40 bg-stone-900 " />
        <Message />
      </span>
    </div>
  );
});

const MessageItem = memo(function MessageItem({
  index,
  message,
  roomUsers,
  scrollToMessage,
  target,
  setTarget,
}: MessageItemProps) {
  const userId = useSession().data?.userId;
  const isOwn = userId === message.sender;
  const messageUser = roomUsers[message.sender];
  const messageRef = useRef<HTMLDivElement>(null);

  const { anchorEl, handleClose, handleOpen } = usePopbox();
  const Message = useCallback(() => {
    const messageType = {
      text: <TextMessage message={message} isOwn={isOwn} />,
      media: <MediaMessage message={message} />,
      file: <FileMessage message={message} isOwn={isOwn} />,
      audio: message.meta_data && (
        <AudioMessage metaData={message.meta_data} isOwn={isOwn} />
      ),
    };

    return messageType[message.type];
  }, [message, isOwn]);

  useEffect(() => {
    if (!messageRef.current) return;
    const observer = new IntersectionObserver(
      (el) => {
        el.forEach((e) => {
          if (e.isIntersecting && target === message.id) {
            e.target.classList.add("animate-wiggle");
          }
          setTimeout(() => {
            e.target.classList.remove("animate-wiggle");
            setTarget("");
          }, 500);
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(messageRef.current);
    return () => {
      observer?.disconnect();
    };
  }, [target, message, setTarget]);

  return (
    <div
      key={index}
      ref={messageRef}
      className={twMerge(
        " w-full group flex-col flex py-1 ",
        isOwn && " items-end"
      )}
    >
      <UserPopbox
        anchorEl={anchorEl}
        handleClose={handleClose}
        user={messageUser}
      />
      {message.reply && (
        <ReplyMessage
          scrollToMessage={scrollToMessage}
          isOwn={isOwn}
          roomUsers={roomUsers}
          message={message.reply}
        />
      )}
      {message.reply_note && <NoteMessage message={message} isOwn={isOwn} />}
      <div className="flex items-start w-full gap-1 ">
        {!isOwn && (
          <Image
            onClick={handleOpen}
            className="w-6 h-6 rounded-full bg-neutral-900"
            width={30}
            height={30}
            src={messageUser?.image || "/user.png"}
            alt={messageUser?.name || "user"}
          />
        )}

        <div
          className={twMerge(
            "text-end w-full    flex flex-col gap-1 ",
            isOwn && " justify-end items-end"
          )}
        >
          {!isOwn && !message.reply && !message.reply_note && (
            <span className="text-xs w-fit dark:text-white/80">
              {messageUser?.name}
            </span>
          )}
          <div
            className={twMerge(
              "flex gap-1 relative  w-full  ",
              isOwn ? "flex-row-reverse" : ""
            )}
          >
            <div
              className={twMerge(
                "max-w-[80%] relative ",
                message.status === "deleting" && " hidden"
              )}
            >
              <Message />
              {message.status === "pending" && (
                <div className="absolute bottom-0 rounded-full -left-5 dark:text-blue-500">
                  <Send size={12} />
                </div>
              )}
            </div>
            {message.status === "send" && (
              <SettingBar message={message} isOwn={isOwn} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default MessageItem;
