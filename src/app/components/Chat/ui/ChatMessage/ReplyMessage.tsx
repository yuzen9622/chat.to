import { useSession } from "next-auth/react";
import { memo } from "react";
import { twMerge } from "tailwind-merge";

import Message from "./Message";

import type { ClientMessageInterface } from "@/types/type";

const ReplyMessage = memo(function ReplyMessage({
  message,

  isOwn,
  scrollToMessage,
}: {
  message: ClientMessageInterface;

  isOwn: boolean;
  scrollToMessage: (messageId: string) => Promise<void>;
}) {
  const userId = useSession().data?.userId;
  const replyOwn = message.sender === userId;
  const replySender = message.sender_info;
  console.table(message);

  return (
    <div
      className={twMerge(
        " flex flex-col gap-2 pb-2 pl-7 w-fit max-w-[80%] ",
        isOwn && "items-end pr-2"
      )}
      onClick={() => message.id && scrollToMessage(message.id)}
    >
      {replySender && (
        <span className={twMerge(" w-fit text-xs dark:text-white/50")}>
          {`${isOwn ? "你" : ""}已回復${replyOwn ? "自己" : replySender.name}`}
        </span>
      )}

      <span
        className={twMerge(
          " relative rounded-3xl w-fit  z-0",
          isOwn ? " text-end" : "text-start"
        )}
      >
        <div className="absolute inset-0 z-10 rounded-3xl opacity-10 dark:opacity-40 bg-stone-900 " />

        <Message message={message.forward ?? message} isOwn={isOwn} />
      </span>
    </div>
  );
});
export default ReplyMessage;
