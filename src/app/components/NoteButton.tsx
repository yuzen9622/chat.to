"use client";
import { CircularProgress, Modal } from "@mui/material";
import { X } from "lucide-react";
import React, { ChangeEvent, useCallback, useRef, useState } from "react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useSession } from "next-auth/react";
import { NoteInterface } from "../lib/type";
import { useAblyStore } from "../store/AblyStore";

export default function NoteButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isFoucs, setIsFoucs] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: session, update } = useSession();

  const { channel } = useAblyStore();

  const handleShare = useCallback(async () => {
    if (!channel) return;
    setIsLoading(true);
    const res = await fetch("/api/note/update", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: noteText,
        is_public: true,
        user_id: session?.userId,
      }),
    });
    const data: NoteInterface = await res.json();
    await channel.publish("note_action", { note: data });
    await update({ ...session?.user, note: data });
    setIsOpen(false);
  }, [session, update, noteText, channel]);

  const onFoucs = useCallback(() => {
    setIsFoucs(true);
  }, []);
  const onBlur = useCallback(() => {
    setIsFoucs(false);
    const target = textareaRef.current;
    if (target) {
      target.style.height = "auto";
      target.style.height = `${target.scrollHeight}px`;
    }
  }, []);
  const onChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length === 51) return;
    setNoteText(e.target.value);
  }, []);

  return (
    <div className="absolute right-0 shadow-md -top-8">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="p-2 text-xs truncate rounded-md max-w-24 dark:bg-stone-700 text-white/40"
      >
        {session?.user.note ? session.user.note.text : "便利貼......"}
      </button>
      <span className="absolute w-4 h-4 rounded-full left-3 -bottom-2 dark:bg-stone-700"></span>
      <span className="absolute w-2 h-2 rounded-full left-2 -bottom-4 dark:bg-stone-700"></span>
      <Modal
        onClose={() => setIsOpen(false)}
        open={isOpen}
        className="flex items-center justify-center w-full h-full"
      >
        <div className="flex flex-col w-11/12 max-w-lg rounded-md dark:bg-stone-800 h-96">
          <span className="flex items-center justify-between w-full px-2 py-3 border-b ">
            <button
              onClick={() => setIsOpen(false)}
              className="dark:text-white"
            >
              <X />
            </button>
            <h3 className="text-xl font-bold text-center dark:text-white">
              新增便利貼
            </h3>
            <button onClick={() => handleShare()} className="text-blue-400">
              {isLoading ? <CircularProgress size={18} /> : "分享"}
            </button>
          </span>

          <div className="relative flex flex-col items-center justify-center flex-1 w-full gap-2 ">
            <span className="relative w-fit h-fit">
              <Image
                src={session?.user.image || "/user.png"}
                alt={session?.userId || "user"}
                className="rounded-full w-44 h-44"
                width={180}
                height={180}
              />

              <div className="absolute right-0 -top-8 w-fit h-fit">
                <textarea
                  onFocus={onFoucs}
                  onBlur={onBlur}
                  rows={1}
                  className={twMerge(
                    " relative p-2 truncate rounded-md max-w-44 text-wrap shadow-md  dark:bg-stone-700 text-white/40 outline-none resize-none",
                    (isFoucs || noteText.length !== 0) && "dark:text-white"
                  )}
                  ref={textareaRef}
                  onKeyDown={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                  placeholder="便利貼..."
                  value={noteText}
                  onChange={onChange}
                />

                <span className="absolute w-4 h-4 rounded-full left-3 -bottom-0 dark:bg-stone-700"></span>
                <span className="absolute w-2 h-2 rounded-full left-2 -bottom-4 dark:bg-stone-700"></span>
              </div>
            </span>
            <p className="text-sm dark:text-white">
              字數限制 {noteText.length}/50
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
