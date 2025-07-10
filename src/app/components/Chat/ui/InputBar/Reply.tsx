import { X } from "lucide-react";
import React, { useMemo } from "react";
import Image from "next/image";
import { useChatStore } from "@/app/store/ChatStore";
import { ClientMessageInterface } from "@/types/type";
import { messageType } from "@/app/lib/util";
export default function Reply({ reply }: { reply: ClientMessageInterface }) {
  const { currentUser, setReply } = useChatStore();

  const replyText = useMemo(() => {
    if (!reply) return "";
    if (messageType(reply.meta_data!) === "audio") return "語音";
    if (messageType(reply.meta_data!) === "image") return "圖片";
    if (messageType(reply.meta_data!) === "file") return "檔案";
    if (messageType(reply.meta_data!) === "video") return "影片";
    return reply.text;
  }, [reply]);
  return (
    <div className="p-2 border-b dark:border-none">
      <div className="flex justify-between font-semibold dark:text-white ">
        <p className="text-lg text-blue-500">
          {currentUser.find((user) => user.id === reply.sender)?.name}
        </p>
        <button
          type="button"
          className="p-1 rounded-full hover:bg-gray-100 hover:dark:bg-white/10"
          onClick={() => setReply(null)}
        >
          <X />
        </button>
      </div>
      <div className="flex items-center justify-between w-full py-1">
        <span className="truncate text-stone-800 dark:text-white/50">
          {replyText}
        </span>
        {reply.meta_data && messageType(reply.meta_data!) === "image" && (
          <Image
            className="object-cover w-10 h-10 rounded-md"
            alt={reply.text}
            width={50}
            height={50}
            src={reply.meta_data?.url}
          />
        )}
        {reply.meta_data && messageType(reply.meta_data!) === "video" && (
          <video
            muted
            className="w-10 h-10 rounded-md"
            src={reply.meta_data.url}
          ></video>
        )}
      </div>
    </div>
  );
}
