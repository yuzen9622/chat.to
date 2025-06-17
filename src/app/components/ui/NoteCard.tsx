"use client";
import React, { useState } from "react";
import { NoteInterface } from "../../../types/type";
import BadgeAvatar from "./Avatar";
import { useSession } from "next-auth/react";
import NoteModal from "./NoteModal";

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
      <NoteModal note={note} isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}
