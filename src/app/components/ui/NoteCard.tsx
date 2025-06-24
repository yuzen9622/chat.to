"use client";
import React, { useMemo, useState } from "react";
import { UserInterface } from "../../../types/type";
import BadgeAvatar from "./Avatar/Avatar";

import { useAuthStore } from "@/app/store/AuthStore";
import { useRouter } from "next/navigation";

import NoteButton from "./NoteButton";

export default function NoteCard({
  user,
  isOwn,
  width = 70,
  height = 70,
}: {
  user: UserInterface;
  isOwn: boolean;
  width?: number;
  height?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const { friendNote, userNote } = useAuthStore();

  const note = useMemo(() => {
    if (isOwn) return userNote;
    return friendNote?.find((fn) => fn.user_id === user.id);
  }, [user, friendNote, userNote, isOwn]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!note && !isOwn) {
      router.push(`/profile/${user.id}`);
    } else {
      if (!isOpen) setIsOpen((prev) => !prev);
    }
  };

  return (
    <div className="relative text-black min-w-16 max-w-fit h-fit mt-11 dark:text-white dark:bg-transparent">
      <span
        className="relative flex flex-col items-center "
        onClick={handleClick}
      >
        <BadgeAvatar user={user.id} width={width} height={height} />
        <p className="text-xs truncate">{isOwn ? "你的便利貼" : user.name}</p>
        {(isOwn || note) && (
          <NoteButton
            note={note!}
            user={user}
            setIsOpen={setIsOpen}
            isOpen={isOpen}
          />
        )}
      </span>
    </div>
  );
}
