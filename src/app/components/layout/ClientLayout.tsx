"use client";
import React, { useEffect, useRef } from "react";
import { useChannel, usePresenceListener } from "ably/react";
import { useAblyStore } from "../../store/AblyStore";
import SideBar from "../SideBar";
import { useAuthStore } from "../../store/AuthStore";
import moment from "moment";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import NotifyBar from "../NotifyBar";
import { useSession } from "next-auth/react";

import { useRealtime } from "@/hook/useRealtime/index";

moment.locale("zh-tw");
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setOnlineUsers, setChannel } = useAblyStore();

  const { initialize } = useAuthStore();
  const { channel } = useChannel("chatta-chat-channel");
  const userId = useSession()?.data?.userId;
  const didRun = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    if (didRun.current) return;

    if (userId) {
      initialize(userId);
    }
    didRun.current = true;
  }, [userId, initialize]);

  useEffect(() => {
    setChannel(channel);

    channel.presence.enter();

    return () => {
      if (channel) {
        channel.presence.leave();
      }
    };
  }, [channel, setChannel]);

  useRealtime(channel);

  const { presenceData } = usePresenceListener("chatta-chat-channel");
  useEffect(() => {
    setOnlineUsers(presenceData);
  }, [presenceData, setOnlineUsers]);

  const isChatRoom = pathname.includes("/chat/");
  return (
    <div className="flex flex-col-reverse w-full h-full overflow-hidden sm:flex-row">
      <NotifyBar />

      <div className={twMerge("flex", isChatRoom && " hidden sm:block")}>
        {!pathname.includes("/auth") && !pathname.includes("/introduce") ? (
          <SideBar />
        ) : (
          ""
        )}
      </div>

      {children}
    </div>
  );
}
