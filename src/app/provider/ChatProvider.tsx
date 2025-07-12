"use client";
import React from "react";
import { AblyProvider, ChannelProvider } from "ably/react";
import { CircularProgress } from "@mui/material";
import { useAbly } from "../lib/ably/ably-client";

import { useSession } from "next-auth/react";

export default function ChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  const client = useAbly();

  if (status === "unauthenticated" || !client) {
    return (
      <div className="flex items-center justify-center w-full h-dvh">
        <CircularProgress />
      </div>
    );
  }

  return (
    <AblyProvider client={client!}>
      <ChannelProvider channelName="chatta-chat-channel">
        {children}
      </ChannelProvider>
    </AblyProvider>
  );
}
