import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { memo, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

import UserPopbox from "@/app/components/ui/UserPopbox";
import { usePopbox } from "@/hook/usePopbox";

import ForwardMessage from "./ForwardMessage";
import Message from "./Message";
import ReplyMessage from "./ReplyMessage";
import ReplyNote from "./ReplyNote";
import SettingBar from "./SettingBar";

import type { ClientMessageInterface } from "@/types/type";
type MessageItemProps = {
  index: number;
  message: ClientMessageInterface;
  scrollToMessage: (messageId: string) => Promise<void>;
  target: string;
  setTarget: React.Dispatch<React.SetStateAction<string>>;
};

const MessageItem = memo(function MessageItem({
  index,
  message,
  scrollToMessage,
  target,
  setTarget,
}: MessageItemProps) {
  const userId = useSession().data?.userId;
  const isOwn = userId === message.sender;
  const messageUser = message.sender_info;
  const messageRef = useRef<HTMLDivElement>(null);

  const { anchorEl, handleClose, handleOpen } = usePopbox();

  useEffect(() => {
    if (!messageRef.current) return;
    const observer = new IntersectionObserver(
      (el) => {
        el.forEach((e) => {
          if (e.isIntersecting && target === message.id) {
            e.target.classList.add("animate-wiggle");
          }
          setTimeout(() => {
            e.target.classList.remove("animate-wiggle");
            setTarget("");
          }, 500);
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(messageRef.current);
    return () => {
      observer?.disconnect();
    };
  }, [target, message, setTarget]);

  return (
    <div
      key={index}
      ref={messageRef}
      className={twMerge(
        " w-full group flex-col flex py-1 ",
        isOwn && " items-end"
      )}
    >
      <UserPopbox
        anchorEl={anchorEl}
        handleClose={handleClose}
        user={messageUser}
      />
      {message.reply && (
        <ReplyMessage
          scrollToMessage={scrollToMessage}
          isOwn={isOwn}
          message={message.reply}
        />
      )}
      {message.reply_note && <ReplyNote message={message} isOwn={isOwn} />}

      <div className="flex items-start w-full gap-1 ">
        {!isOwn && (
          <Image
            onClick={handleOpen}
            className="w-6 h-6 rounded-full bg-neutral-900"
            width={30}
            height={30}
            src={messageUser.image || "/user.png"}
            alt={messageUser.name || "user"}
          />
        )}
        <div
          className={twMerge(
            "text-end w-full  isolate   flex flex-col gap-1 ",
            isOwn && " justify-end items-end"
          )}
        >
          {!isOwn && !message.reply && !message.reply_note && (
            <span className="text-xs w-fit mix-blend-multiply ">
              {messageUser.name}
            </span>
          )}
          <div
            className={twMerge(
              "flex gap-1   w-full",
              isOwn ? "flex-row-reverse" : ""
            )}
          >
            <div
              className={twMerge(
                "max-w-[80%] space-y-2 flex flex-col  items-end",
                message.status === "deleting" && " hidden"
              )}
            >
              {message.forward && (
                <ForwardMessage message={message.forward} isOwn={isOwn} />
              )}
              {message.text.trim() !== "" && (
                <Message message={message} isOwn={isOwn} />
              )}
              {message.status === "pending" && (
                <div className="relative ">
                  <div className="absolute bottom-0 rounded-full -left-5 dark:text-blue-500">
                    <Send size={12} />
                  </div>
                </div>
              )}
            </div>
            {message.status === "send" && (
              <SettingBar message={message} isOwn={isOwn} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default MessageItem;
