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
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { deleteMessage } from "@/app/lib/api/message/messageApi";
import { Copy2ClipBoard, handleDownload, messageType } from "@/app/lib/util";
import { useAblyStore } from "@/app/store/AblyStore";
import { useChatStore } from "@/app/store/ChatStore";
import { ClickAwayListener, Popper } from "@mui/material";

import ForwardModal from "./Forward/ForwardModal";

import type { PopperPlacementType } from "@mui/material";

import type { ClientMessageInterface } from "@/types/type";

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
  const popperRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [place, setPlace] = useState(isOwn ? "end" : "start");
  const [xPlace, setXPlace] = useState("top");
  const open = Boolean(anchorEl);

  // const [open, setOpen] = useState(false);

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

  useEffect(() => {
    const rect = popperRef.current?.getBoundingClientRect();
    if (anchorEl && rect) {
      if (rect.right > window.innerWidth) {
        // 右邊超出
        setPlace("end");
      } else if (rect.left < 0) {
        // 左邊超出
        setPlace("start");
      }
      console.log(rect.top);
      if (rect.top < 70) {
        setXPlace("bottom");
      } else if (rect.bottom > window.innerHeight) {
        setXPlace("top");
      }
    }
  }, [anchorEl]);

  const handleClose = () => {
    setAnchorEl(null);
    // setOpen(false);
  };

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // setOpen(true);
  };

  const handleReply = useCallback(() => {
    setReply(message);
  }, [setReply, message]);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div className={twMerge("flex  relative   justify-end items-end ")}>
        <div
          className={twMerge(
            "flex    opacity-0 group-hover:opacity-100 ",
            isOwn ? " flex-row-reverse" : " flex-row",
            anchorEl && " opacity-100"
          )}
        >
          <button
            className={twMerge(
              "  p-1 inline-flex active:scale-90 transition-all justify-center items-center gap-2 rounded-md   text-stone-600 hover:bg-gray-100  dark:text-white/50 hover:dark:text-white/80 hover:dark:bg-white/10 focus:outline-none focus:dark:bg-white/10 hover:opacity-100"
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
              "  p-2 inline-flex active:scale-90 transition-all justify-center items-center gap-2 rounded-md   text-stone-600 hover:bg-gray-100  dark:text-white/50 hover:dark:text-white/80 hover:dark:bg-white/10 "
            )}
            onClick={handleOpen}
          >
            <Ellipsis size={16} />
          </button>
        </div>

        <Popper
          ref={popperRef}
          placement={`${xPlace}-${place}` as PopperPlacementType}
          anchorEl={anchorEl}
          disablePortal={true}
          open={open}
          modifiers={[
            { name: "preventOverflow", enabled: false },
            {
              name: "flip",
              enabled: false,
            },
          ]}
          className="z-20 p-2"
        >
          <div className="flex flex-col w-32 p-1 bg-white border rounded-md right-20 dark:bg-neutral-900">
            <p className="text-xs text-center dark:text-white/50">
              {moment(message.created_at).format("a hh:mm")}
            </p>
            {!message.meta_data && (
              <button
                className={twMerge(
                  "w-full flex items-center justify-between gap-x-3.5 py-1.5 px-2.5 text-sm rounded-md text-stone-700 hover:bg-gray-100 dark:text-neutral-300 hover:dark:bg-neutral-700"
                )}
                onClick={async () => {
                  await Copy2ClipBoard(message.text);
                  handleClose();
                }}
              >
                複製 <Clipboard size={20} />
              </button>
            )}
            <ForwardModal message={message} />

            {message.meta_data &&
              messageType(message.meta_data) !== "audio" && (
                <button
                  className={twMerge(
                    "w-full justify-between flex items-center gap-x-3.5 py-1.5 px-2.5 text-sm rounded-md text-stone-700 hover:bg-gray-100 dark:text-neutral-300 hover:dark:bg-neutral-700"
                  )}
                  onClick={() => {
                    handleDownload(message.meta_data?.url || "", message.text);
                  }}
                >
                  下載
                  <Download size={20} />
                </button>
              )}
            {message.sender === userId && (
              <div>
                <button
                  className={twMerge(
                    "w-full justify-between flex items-center gap-x-3.5 py-1.5 px-2.5 text-sm rounded-md text-stone-700 hover:bg-gray-100 dark:text-neutral-300 hover:dark:bg-neutral-700",
                    (message.sender !== userId || message.meta_data) && "hidden"
                  )}
                  onClick={() => {
                    setEdit(message);
                    setReply(null);
                    handleClose();
                  }}
                >
                  編輯 <Pencil size={20} />
                </button>

                <button
                  className={twMerge(
                    "w-full justify-between flex items-center gap-x-3.5 py-1.5 px-2.5 text-sm rounded-md hover:bg-gray-100 text-red-400 hover:dark:bg-neutral-700",
                    message.sender !== userId && "hidden"
                  )}
                  onClick={() => {
                    handleDelete();
                    handleClose();
                  }}
                >
                  刪除 <Trash2 size={20} />
                </button>
              </div>
            )}
          </div>
        </Popper>
      </div>
    </ClickAwayListener>
  );
});

export default SettingBar;
