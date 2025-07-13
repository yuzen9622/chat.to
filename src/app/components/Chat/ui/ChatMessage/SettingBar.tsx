import { deleteMessage } from "@/app/lib/api/message/messageApi";
import { Copy2ClipBoard, handleDownload, messageType } from "@/app/lib/util";
import { useAblyStore } from "@/app/store/AblyStore";
import { useChatStore } from "@/app/store/ChatStore";
import { ClientMessageInterface } from "@/types/type";
import { Popover } from "@mui/material";
import {
  Clipboard,
  Download,
  Ellipsis,
  Pencil,
  Reply,
  Trash2,
} from "lucide-react";
import moment from "moment";
import { useSession } from "next-auth/react";
import React, { memo, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import ForwardModal from "./Forward/ForwardModal";

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
        disableScrollLock={true}
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
          <ForwardModal message={message} />

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

export default SettingBar;
