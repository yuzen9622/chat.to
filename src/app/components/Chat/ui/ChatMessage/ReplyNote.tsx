import type { ClientMessageInterface } from "@/types/type";
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { memo } from 'react';
import { twMerge } from 'tailwind-merge';

const ReplyNote = memo(function NoteMessage({
  message,

  isOwn,
}: {
  message: ClientMessageInterface;
  isOwn: boolean;
}) {
  const userId = useSession().data?.userId;
  return (
    <div className="flex flex-col">
      {message.reply_note && (
        <span className={twMerge(" w-fit text-xs dark:text-white/50")}>
          已回復
          {userId === message.reply_note.user_id
            ? "你"
            : message.reply_note?.user.name}
          的便利貼
        </span>
      )}
      <div
        className={twMerge(
          "inline-block text-start my-2   bg-stone-900/10 dark:bg-white/10  max-w-48 p-2 rounded-2xl",
          isOwn && "bg-blue-500  text-white"
        )}
      >
        <span className="flex items-center gap-2 w-fit">
          <Image
            alt={"note_user"}
            width={30}
            height={30}
            className="w-8 h-8 rounded-full aspect-square"
            src={message?.reply_note?.user.image || "/user.png"}
          />
          <p className="text-sm font-bold">{message?.reply_note?.user.name}</p>
        </span>

        <p className="px-2 mt-2 text-sm truncate dark:text-white/70 ">
          {message?.reply_note?.text}
        </p>
      </div>
    </div>
  );
});
export default ReplyNote;
