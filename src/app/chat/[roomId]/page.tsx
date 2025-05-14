import { getRoomById } from "@/app/lib/server";
import { redirect } from "next/navigation";
import ChatRoomWrapper from "@/app/components/ChatWrapper";
import { RoomInterface } from "@/types/type";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export const fetchCache = "force-no-store";
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
  const headers = new Headers();
  headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");

  const { roomId } = await params;
  const data = await getServerSession(authOptions);

  if (!data) return redirect("/chat");

  const { room } = (await getRoomById(roomId, data.userId!)) as {
    room: RoomInterface | null;
  };

  if (
    !room ||
    room.room_members.some((rm) => rm.user_id === data.userId && rm.is_deleted)
  )
    return redirect("/chat");

  return (
    <div className="flex flex-row flex-1 overflow-y-hidden transition-all max-h-dvh">
      <ChatRoomWrapper room={room} roomId={roomId} />
    </div>
  );
}
