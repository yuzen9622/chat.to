import { ForwardIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import Message from './Message';

import type { ClientMessageInterface } from "@/types/type";

export default function ForwardMessage({
  message,
  isOwn,
}: {
  message: ClientMessageInterface;
  isOwn: boolean;
}) {
  return (
    <div className="space-y-2 ">
      <span className="flex items-center gap-2 dark:text-stone-400">
        <ForwardIcon size={16} />
        <p className="text-xs text-end ">已轉發</p>
      </span>
      <div className={twMerge("relative left-0 rounded-3xl   ")}>
        <Message message={message} isOwn={isOwn} />
      </div>
    </div>
  );
}
