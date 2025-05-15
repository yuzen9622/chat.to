"use client";
import React from "react";
import { NoteInterface } from "../../../types/type";

import BadgeAvatar from "./Avatar";

import { TimeAgo } from "../TimeAgo";
export default function NoteCard({ note }: { note: NoteInterface }) {
  const user = note.user;
  return (
    <span className="flex items-center w-full max-w-md gap-2 px-3 py-2 mb-2 text-black rounded-md bg-stone-100 min-h-fit dark:text-white dark:bg-white/5">
      <BadgeAvatar user={note.user_id} width={65} height={65} />
      <div className="w-full h-full">
        <span className="flex items-center gap-2 ">
          <p className="text-lg font-medium">{user?.name}</p>
          <p className="text-xs dark:text-white/70 text-stone-900/70">
            {<TimeAgo date={`${note.updated_at}`} />}
          </p>
        </span>

        <p className="w-full text-sm ">{note.text}</p>
      </div>
      {/* <div className="h-full">
        <button className="p-1 rounded-md hover:bg-white/10">
          <MessagesSquare />
        </button>
      </div> */}
    </span>
  );
}
