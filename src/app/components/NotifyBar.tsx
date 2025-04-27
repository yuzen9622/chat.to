"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Snackbar } from "@mui/material";
import { useChatStore } from "../store/ChatStore";
import { RoomInterface } from "../lib/type";
import { useUserProfile } from "@/hook/hooks";
import { replyText } from "@/app/lib/util";
import { redirect } from "next/navigation";
import moment from "moment";
import BadgeAvatar from "./Avatar";
export default function NotifyBar() {
  const [open, setOpen] = useState(false);

  const [room, setRoom] = useState<RoomInterface | null>(null);
  const { newNotify, rooms, setNewNotify } = useChatStore();
  const senderId = useMemo(
    () => (newNotify?.type === "message" ? newNotify.data.sender : void 0),
    [newNotify]
  );

  const sendUser = useUserProfile(senderId);

  useEffect(() => {
    if (!newNotify) return;
    if (newNotify.type === "message") {
      const room = rooms.find((room) => room.id === newNotify.data.room);
      setRoom(room || null);
    }
    setOpen(true);
  }, [newNotify, rooms]);

  const handleClick = useCallback(() => {
    setOpen(false);
    setNewNotify(null);
    if (newNotify && newNotify.type === "message") {
      redirect(`/chat/${newNotify.data.room}`);
    }
  }, [setNewNotify, newNotify]);

  return (
    <>
      {newNotify && newNotify.type === "message" && (
        <Snackbar
          open={open}
          autoHideDuration={5000}
          className="p-2 rounded-md cursor-pointer bg-stone-800/10 min-w-72 sm:max-w-72 dark:bg-stone-900/70 backdrop-blur-2xl max-sm:w-auto"
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          onClick={handleClick}
          onClose={() => {
            setOpen(false);
            setNewNotify(null);
          }}
        >
          <div className="flex flex-row w-full p-2">
            {room && <BadgeAvatar room={room} />}
            <div className="flex flex-col w-full px-2">
              <span className="flex justify-between text-sm font-semibold dark:text-white ">
                <p className="text-base">
                  {room && room.room_type === "group"
                    ? room.room_name
                    : sendUser?.name}
                </p>
                <p className="text-xs text-gray-500/70 dark:text-white/70">
                  {moment(newNotify.data.created_at).calendar()}
                </p>
              </span>
              <p className="text-sm truncate dark:text-white/80">
                {room &&
                  room.room_type === "group" &&
                  sendUser &&
                  sendUser.name + "："}

                {replyText(newNotify.data)}
              </p>
            </div>
          </div>
        </Snackbar>
      )}
    </>
  );
}
