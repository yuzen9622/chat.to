import { memo, useMemo } from "react";
import { twMerge } from "tailwind-merge";

import MarkDownText from "@/app/components/ui/MarkDownText";
import { useChatStore } from "@/app/store/ChatStore";

import type { ClientMessageInterface } from "@/types/type";
const TextMessage = memo(function TextMessage({
  message,
  isOwn,
}: {
  message: ClientMessageInterface;
  isOwn: boolean;
}) {
  const { currentChat } = useChatStore();
  const theme = useMemo(() => {
    if (!currentChat || !currentChat.room_theme)
      return "bg-blue-500 text-white";

    return currentChat.room_theme.type === "color"
      ? `${currentChat.room_theme.ownColor} ${currentChat.room_theme.textColor}`
      : "bg-blue-500 text-white";
  }, [currentChat]);
  return (
    <div
      className={twMerge(
        " py-2 px-3 rounded-3xl text-start h-fit break-all  text-wrap  w-fit max-w-full  text-ellipsis   overflow-hidden",
        isOwn
          ? theme
          : "dark:bg-stone-900/90 border  dark:border-none   bg-white text-stone-900 dark:text-white"
      )}
    >
      <MarkDownText text={message.text} />
    </div>
  );
});
export default TextMessage;
