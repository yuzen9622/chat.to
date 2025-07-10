"use client";
import React, { useCallback, useState } from "react";
import Image from "next/image";
import { Modal } from "@mui/material";
import { NoteInterface } from "@/types/type";
import { twMerge } from "tailwind-merge";
import { Ellipsis, Send } from "lucide-react";

import { getPersonalRoom } from "@/app/lib/api/room/roomApi";
import { sendUserMessage } from "@/app/lib/api/message/messageApi";
import { createReplyNoteMessage } from "@/app/lib/createMessage";
import { useSession } from "next-auth/react";
import { v4 as uuid } from "uuid";
import { sendAblyMessage } from "@/app/lib/ably/ablyMessage";
import { useAblyStore } from "@/app/store/AblyStore";
import { useChatStore } from "@/app/store/ChatStore";
import { useAuthStore } from "@/app/store/AuthStore";

export default function NoteModal({
  note,
  isOpen,
  setIsOpen,
}: {
  note: NoteInterface;
  isOpen: boolean;
  setIsOpen: React.Dispatch<boolean>;
}) {
  const [replyText, setReplyText] = useState("");
  const userId = useSession()?.data?.user.id;
  const { ably } = useAblyStore();
  const { rooms, setRoom } = useChatStore();
  const { friends } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const handleSend = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const friendRoom =
        friends?.find((f) => f.friend_id === note.user_id)?.personal_room_id ||
        uuid();

      setLoading(true);
      const room = await getPersonalRoom(friendRoom, userId!, note.user_id);
      const message = createReplyNoteMessage(userId!, room.id, replyText, note);
      const isExist = rooms.find((r) => r.id === room.id);

      if (isExist) {
        const isDelete = isExist.room_members.some(
          (rm) =>
            rm.is_deleted && rm.user_id === userId && rm.room_id === room.id
        );

        if (isDelete) {
          isExist.room_members = isExist.room_members.map((r) => {
            if (r.user_id === userId) {
              r.is_deleted = false;
            }
            return r;
          });
        }
        setRoom(isExist);
      } else if (!isExist) {
        setRoom(room);
      }
      if (message && ably) {
        await Promise.all([
          sendUserMessage(message),
          sendAblyMessage(ably, message),
        ]);
      }
      setLoading(false);
      setIsOpen(false);
    },
    [userId, ably, note, replyText, setRoom, rooms, friends, setIsOpen]
  );

  return (
    <div>
      <Modal
        onClose={() => setIsOpen(false)}
        open={isOpen}
        className="flex items-center justify-center w-full h-full"
      >
        <div className="flex flex-col w-11/12 max-w-lg bg-white rounded-md dark:bg-stone-800 h-96">
          <span className="flex items-center justify-center w-full px-2 py-3 border-b ">
            <h3 className="text-xl font-bold text-center dark:text-white">
              便利貼
            </h3>
          </span>

          <div className="relative flex flex-col items-center justify-center flex-1 w-full gap-2 ">
            <span className="relative flex flex-col items-center w-fit h-fit">
              <Image
                src={note?.user?.image || "/user.png"}
                alt={note?.user_id || "user"}
                className="rounded-full w-44 h-44"
                width={180}
                height={180}
              />
              <p className="text-lg text-center truncate dark:text-white">
                {note.user.name}
              </p>

              <div className="absolute left-0 -top-6 w-fit h-fit">
                <p
                  className={twMerge(
                    " relative p-2  break-words rounded-2xl bg-stone-100  max-w-44 text-wrap shadow-md   dark:bg-stone-700  dark:text-white outline-none resize-none"
                  )}
                >
                  {note?.text}
                </p>

                <span className="absolute w-4 h-4 rounded-full bg-stone-100 left-2 -bottom-2 dark:bg-stone-700"></span>
                <span className="absolute w-2 h-2 rounded-full left-4 bg-stone-100 -bottom-4 dark:bg-stone-700"></span>
              </div>
            </span>
            {userId !== note.user_id && (
              <form
                onSubmit={handleSend}
                className="flex p-1 rounded-3xl dark:bg-white/10 bg-stone-100"
              >
                <input
                  type="text"
                  placeholder="回覆便利貼..."
                  onChange={(e) => setReplyText(e.target.value)}
                  value={replyText}
                  className="px-3 py-1 bg-transparent outline-none "
                />
                {replyText !== "" && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-1 text-white bg-blue-500 animate-in zoom-in-0 active:bg-blue-300 rounded-3xl disabled:bg-blue-300"
                  >
                    {loading ? (
                      <Ellipsis className=" animate-pulse" />
                    ) : (
                      <Send />
                    )}
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
