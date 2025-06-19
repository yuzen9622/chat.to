import React from "react";
import Image from "next/image";
import { Modal } from "@mui/material";
import { NoteInterface } from "@/types/type";
import { twMerge } from "tailwind-merge";
export default function NoteModal({
  note,
  isOpen,
  setIsOpen,
}: {
  note: NoteInterface;
  isOpen: boolean;
  setIsOpen: React.Dispatch<boolean>;
}) {
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
            <span className="relative w-fit h-fit">
              <Image
                src={note?.user?.image || "/user.png"}
                alt={note?.user_id || "user"}
                className="rounded-full w-44 h-44"
                width={180}
                height={180}
              />
              <p className="text-lg text-center truncate dark:text-white">
                {note?.user.name}
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
          </div>
        </div>
      </Modal>
    </div>
  );
}
