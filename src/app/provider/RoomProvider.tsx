import React from "react";
import { ChannelProvider } from "ably/react";
export default function RoomProvider({
  roomId,
  children,
}: { roomId: string } & { children: React.ReactNode }) {
  if (!roomId) return null;
  return <ChannelProvider channelName={roomId}>{children}</ChannelProvider>;
}
