import { memo } from 'react';
import { twMerge } from 'tailwind-merge';

import MarkDownText from '@/app/components/ui/MarkDownText';

import type { ClientMessageInterface } from "@/types/type";

const TextMessage = memo(function TextMessage({
  message,
  isOwn,
}: {
  message: ClientMessageInterface;
  isOwn: boolean;
}) {
  return (
    <div
      className={twMerge(
        " py-2 px-3 rounded-3xl text-start h-fit break-all  text-wrap  w-fit max-w-full  text-ellipsis  backdrop-blur-3xl  overflow-hidden",
        isOwn
          ? " bg-blue-500 text-white "
          : "dark:bg-neutral-700/70   bg-stone-200/70 text-stone-900 dark:text-white"
      )}
    >
      <MarkDownText text={message.text} />
    </div>
  );
});
export default TextMessage;
