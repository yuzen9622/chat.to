"use client";
import { Grow, Modal } from "@mui/material";
import { Ellipsis, X } from "lucide-react";
import React, {
  ChangeEvent,
  Dispatch,
  useCallback,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useSession } from "next-auth/react";
import { NoteInterface, UserInterface } from "../../../types/type";
import { useAblyStore } from "../../store/AblyStore";
import NoteModal from "./Modal/NoteModal";
import { useAuthStore } from "@/app/store/AuthStore";
import { deleteNote, updateNote } from "@/app/lib/api/note/noteApi";

export default function NoteButton({
  note,
  user,
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<React.SetStateAction<boolean>>;
  note: NoteInterface | null;
  user: UserInterface;
}) {
  const [noteText, setNoteText] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: session, update } = useSession();
  const isOwn = session?.userId === user.id;
  const { channel } = useAblyStore();
  const { setUserNote } = useAuthStore();

  const handleShare = useCallback(async () => {
    if (!channel || noteText.trim() === "" || !session) return;
    setIsLoading(true);
    const data = await updateNote(noteText, session.user.id);
    await channel.publish("note_action", { action: "update", note: data });
    await update({ ...session?.user, note: data });
    setUserNote(data);
    setIsLoading(false);
    setIsOpen(false);
  }, [session, update, noteText, channel, setIsOpen, setUserNote]);

  const handleDelete = useCallback(async () => {
    try {
      if (!note || !channel) return;
      await deleteNote(note.id);
      await channel.publish("note_action", { action: "delete", note: note });
      await update({ ...session?.user, note: null });
      setUserNote(null);
      setIsLoading(false);
      setIsOpen(false);
    } catch (error) {
      console.log(error);
    }
  }, [note, channel, session, setIsOpen, setUserNote, update]);

  const onFocus = useCallback(() => {
    setIsFocus(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsFocus(false);
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
  };
  return (
    <>
      <div className="absolute left-0 max-w-full shadow-md rounded-2xl -top-8">
        <button
          onClick={handleClick}
          className="max-w-full p-2 text-xs break-words rounded-2xl text-start bg-stone-100 dark:bg-stone-700"
        >
          <p
            className={twMerge(
              "line-clamp-2 dark:text-white/70 text-stone-900 text-center",
              note && "dark:text-white"
            )}
          >
            {note ? note.text : "便利貼..."}
          </p>
        </button>
        <span className="absolute w-3 h-3 rounded-full left-2 bg-stone-100 -bottom-1 dark:bg-stone-700"></span>
        <span className="absolute w-2 h-2 rounded-full bg-stone-100 left-2 -bottom-4 dark:bg-stone-700"></span>
      </div>
      {isOwn && (
        <Modal
          onClose={() => setIsOpen(false)}
          open={isOpen}
          className="flex items-center justify-center w-full h-full"
        >
          <Grow in={isOpen}>
            <div className="flex flex-col w-11/12 max-w-lg bg-white rounded-md dark:bg-stone-800 h-96">
              <span
                className={twMerge(
                  "flex items-center justify-between w-full px-2 py-3 border-b "
                )}
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="dark:text-white"
                >
                  <X />
                </button>

                <h3 className="text-xl font-bold text-center dark:text-white">
                  新增便利貼
                </h3>
                {isOwn && (
                  <button
                    onClick={() => handleShare()}
                    className="text-blue-400"
                  >
                    {isLoading ? (
                      <Ellipsis className=" animate-pulse" />
                    ) : (
                      "分享"
                    )}
                  </button>
                )}
              </span>

              <div className="relative flex flex-col items-center justify-center flex-1 w-full gap-2 ">
                <span className="relative w-fit h-fit">
                  <Image
                    src={user.image || "/user.png"}
                    alt={user.id || "user"}
                    className="rounded-full w-44 h-44"
                    width={180}
                    height={180}
                  />

                  <div className="absolute right-0 -top-8 w-fit h-fit">
                    <textarea
                      onFocus={onFocus}
                      rows={1}
                      onBlur={onBlur}
                      disabled={!isOwn}
                      className={twMerge(
                        " relative p-2 truncate rounded-md max-w-44 text-wrap shadow-md  dark:bg-stone-700 text-white/40 outline-none resize-none",
                        (isFocus || noteText.length !== 0) &&
                          "dark:text-white text-stone-900"
                      )}
                      ref={textareaRef}
                      onKeyDown={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                      placeholder="便利貼..."
                      value={isOwn ? noteText : note?.text}
                      onChange={onChange}
                    />

                    <span className="absolute w-4 h-4 bg-white rounded-full left-3 -bottom-0 dark:bg-stone-700"></span>
                    <span className="absolute w-2 h-2 bg-white rounded-full left-7 -bottom-4 dark:bg-stone-700"></span>
                  </div>
                </span>
                <p className="text-sm dark:text-white">
                  字數限制 {noteText.length}/50
                </p>
                <button
                  onClick={handleDelete}
                  type="button"
                  className="w-6/12 p-2 bg-white rounded-md dark:bg-stone-700"
                >
                  刪除便利貼
                </button>
              </div>
            </div>
          </Grow>
        </Modal>
      )}
      {!isOwn && note && (
        <NoteModal note={note} isOpen={isOpen} setIsOpen={setIsOpen} />
      )}
    </>
  );
}
