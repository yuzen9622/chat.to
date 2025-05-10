import { getRoomById } from "@/app/lib/server";

import { redirect } from "next/navigation";
import ChatRoomWrapper from "@/app/components/ChatWrapper";
import { MessageInterface, RoomInterface } from "@/app/lib/type";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function generateMetadata() {
  const data = await getServerSession(authOptions);
  if (!data) return {};
  return {
    title: `聊天室`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const data = await getServerSession(authOptions);

  if (!data) return redirect("/chat");
  const { room, messages } = (await getRoomById(roomId, data.userId!)) as {
    room: RoomInterface | null;
    messages: MessageInterface[];
  };

  if (
    !room ||
    room.room_members.some((rm) => rm.user_id === data.userId && rm.is_deleted)
  )
    return redirect("/chat");

  return (
    <div className="flex flex-row flex-1 overflow-y-hidden transition-all max-h-dvh">
      <ChatRoomWrapper room={room} messages={messages} roomId={roomId} />
    </div>
  );
}
