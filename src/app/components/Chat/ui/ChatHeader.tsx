"use client";
import { ChevronLeft, Info, Phone, Video } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

import BadgeAvatar from '@/app/components/ui/Avatar/Avatar';
import { startStream } from '@/app/lib/util';
import { useAblyStore } from '@/app/store/AblyStore';
import { useCallStore } from '@/app/store/CallStore';
import { useChatStore } from '@/app/store/ChatStore';
import { useChatInfo } from '@/hook/useChatInfo';

import type { CallType } from "@/types/type";

export default function ChatHeader() {
  const { currentChat, setChatInfoOpen, chatInfoOpen } = useChatStore();
  const { onlineUsers, channel } = useAblyStore();
  const { startCall, setCallStatus, callStatus, callType } = useCallStore();

  const router = useRouter();

  const userId = useSession()?.data?.userId;
  const user = useSession()?.data?.user;

  const { recipientUser, displayName } = useChatInfo(currentChat, userId ?? "");

  const handleCall = useCallback(
    async (callType: CallType) => {
      if (!user?.id || !currentChat || callStatus === "connect") {
        router.push("/call");
        return;
      }
      const confirm = window.confirm("確認開啟通話?(beta版)");
      if (!confirm) return;

      const stream = await startStream(callType);
      startCall([user], currentChat, true, callType, stream);

      setCallStatus("waiting");
      router.push("/call");
      await channel?.publish("call_action", {
        action: "offer",
        room: currentChat,
        caller: user,
        callType: callType,
      });
    },
    [user, currentChat, setCallStatus, callStatus, router, channel, startCall]
  );

  if (!currentChat) return null;
  return (
    <header className="box-border sticky top-0 flex items-center justify-between w-full gap-4 p-2 backdrop-blur-3xl bg-white/50 dark:bg-transparent">
      <span className="flex items-center w-full max-w-full gap-2 overflow-hidden">
        {/* 返回按鈕 */}
        <Link
          href={"/chat"}
          className="text-center rounded-md sm:hidden hover:dark:bg-white/10 shrink-0"
        >
          <ChevronLeft
            className="dark:text-white text-stone-800"
            size={"30px"}
          />
        </Link>

        {/* 標題區塊 */}
        <button
          type="button"
          className="flex items-center min-w-0 overflow-hidden"
          onClick={() => setChatInfoOpen(true)}
          onTouchEnd={() => setChatInfoOpen(true)}
        >
          {/* 頭像 */}
          <div className="min-w-fit min-h-fit shrink-0">
            {currentChat.room_type === "personal" ? (
              <BadgeAvatar user={recipientUser} width={40} height={40} />
            ) : (
              <BadgeAvatar room={currentChat} width={40} height={40} />
            )}
          </div>

          {/* 名稱與狀態 */}
          <div className="flex flex-col min-w-0 pl-2 overflow-hidden">
            <div className="flex items-center min-w-0 space-x-1 overflow-hidden">
              <p className="min-w-0 text-lg font-medium truncate text-start text-stone-900 dark:text-white active:text-white/70">
                {displayName}
              </p>
              {currentChat.room_type === "group" && (
                <p className="flex-shrink-0 text-lg font-medium text-stone-900 dark:text-white">
                  ({currentChat.room_members.length})
                </p>
              )}
            </div>

            {onlineUsers.some((item) =>
              currentChat?.room_members.some(
                (user) =>
                  user.user_id === item.clientId && user.user_id !== userId
              )
            ) && (
              <span className="text-xs text-green-400 text-start">
                目前在線上
              </span>
            )}
          </div>
        </button>
      </span>

      <div className="flex items-center flex-shrink-0 space-x-3 w-fit">
        <button
          className={twMerge(
            callStatus !== "disconnect" &&
              callType === "voice" &&
              " animate-bounce"
          )}
          onClick={() => handleCall("voice")}
        >
          <Phone />
        </button>
        <button
          className={twMerge(
            callStatus !== "disconnect" &&
              callType === "video" &&
              " animate-bounce"
          )}
          onClick={() => handleCall("video")}
        >
          <Video />
        </button>
        <button
          onClick={() => setChatInfoOpen(true)}
          className={twMerge("max-sm:hidden", chatInfoOpen && "hidden")}
        >
          <Info className="text-gray-400 hover:dark:text-white hover:text-stone-800 " />
        </button>
      </div>
    </header>
  );
}
