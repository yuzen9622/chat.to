"use client";
import React, { useState } from "react";
import { NoteInterface } from "../../../types/type";
import Image from "next/image";
import BadgeAvatar from "./Avatar";

import { Modal } from "@mui/material";

import { twMerge } from "tailwind-merge";
import { useSession } from "next-auth/react";

export default function NoteCard({ note }: { note: NoteInterface }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  return (
    <div className="relative text-black min-w-16 max-w-fit h-fit mt-11 dark:text-white dark:bg-transparent">
      <span
        className="relative flex flex-col items-center "
        onClick={() => setIsOpen((p) => !p)}
      >
        <BadgeAvatar user={note.user_id} width={65} height={65} />
        <p className="text-xs truncate">
          {note.user_id === session?.userId ? "你的便利貼" : note.user.name}
        </p>
        <div className="absolute left-0 shadow-md rounded-2xl -top-8">
          <button
            onClick={() => setIsOpen((p) => !p)}
            className="p-2 text-xs break-words max-w-16 rounded-2xl text-start bg-stone-100 dark:bg-stone-700 "
          >
            <p className="line-clamp-2 ">
              {" "}
              {note ? note.text : "便利貼......"}
            </p>
          </button>
          <span className="absolute w-3 h-3 rounded-full left-2 bg-stone-100 -bottom-1 dark:bg-stone-700"></span>
          <span className="absolute w-2 h-2 rounded-full bg-stone-100 left-2 -bottom-4 dark:bg-stone-700"></span>
        </div>
      </span>
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
            <span className="relative w-fit h-fit">
              <Image
                src={note.user.image || "/user.png"}
                alt={note.user_id || "user"}
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
                  {note.text}
                </p>

                <span className="absolute w-4 h-4 rounded-full bg-stone-100 left-2 -bottom-2 dark:bg-stone-700"></span>
                <span className="absolute w-2 h-2 rounded-full left-4 bg-stone-100 -bottom-4 dark:bg-stone-700"></span>
              </div>
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
