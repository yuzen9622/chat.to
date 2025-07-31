"use client";
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { useAuthStore } from '@/app/store/AuthStore';

import BadgeAvatar from '../Avatar/Avatar';
import NoteButton from './NoteButton';

import type { UserInterface } from "../../../../types/type";
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

  const { userNote } = useAuthStore();

  const note = useMemo(() => {
    if (isOwn) return userNote ?? void 0;
    return user?.note ?? void 0;
  }, [user, userNote, isOwn]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!note && !isOwn) {
      router.push(`/profile/${user?.id}`);
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
        <BadgeAvatar user={user} width={width} height={height} />
        <p className="text-xs truncate">{isOwn ? "你的便利貼" : user.name}</p>
        {(isOwn || note) && (
          <NoteButton
            note={note}
            user={user}
            setIsOpen={setIsOpen}
            isOpen={isOpen}
          />
        )}
      </span>
    </div>
  );
}
