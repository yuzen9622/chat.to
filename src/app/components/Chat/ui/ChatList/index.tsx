import FriendNote from "@/app/components/Friend/ui/FriendNote";
import { SquarePen } from "lucide-react";
import ChatButton from "../ChatButton";
import { CreateRoomModal } from "./CreateModal";
import { LoadingList } from "./Loading";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ClientMessageInterface, RoomInterface } from "@/types/type";
import { fetchUserRooms } from "@/app/lib/api/room/roomApi";
import { useChatStore } from "@/app/store/ChatStore";
import { fetchUsersNotify } from "@/app/lib/api/notify/notifyApi";

export default function ChatList() {
  const userId = useSession()?.data?.userId;

  const { setRoom, rooms, setNotify, setLastMessages } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const loadRooms = async () => {
      if (!userId || rooms.length > 0) return;

      try {
        setIsLoading(true);
        const {
          rooms: roomsData,
          lastMessages,
        }: { rooms: RoomInterface[]; lastMessages: ClientMessageInterface[] } =
          await fetchUserRooms();
        const inRooms = roomsData.filter((r) =>
          r.room_members.some((m) => m.user_id === userId)
        );

        if (roomsData.length > 0) {
          setRoom(() => inRooms);
        }
        lastMessages.forEach((lm) => {
          setLastMessages({ ...lm, isFetching: true });
        });
        const notifiesData = await fetchUsersNotify(userId, inRooms);
        setNotify(() => notifiesData);
      } catch (error) {
        console.error("Failed to load rooms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, [userId, setRoom, setNotify, rooms, setLastMessages]);

  return (
    <div className="flex flex-col h-full p-2 sm:rounded-lg sm:dark:bg-neutral-800 border-t-gray-500">
      <div>
        <FriendNote />
      </div>
      <div className="flex justify-between ">
        <span className="text-lg font-semibold text-blue-400">Chats</span>
        <span>
          <button
            onClick={() => setIsOpen(true)}
            className="p-1 rounded-lg dark:text-white hover:dark:bg-white/10 hover:bg-stone-900/10 hover:dark:text-white"
          >
            <SquarePen />
          </button>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 ">
          {!isLoading ? (
            rooms.length > 0 ? (
              rooms.map((room) => {
                return <ChatButton key={room.id} room={room} />;
              })
            ) : (
              <span className="text-center dark:text-blue-500">
                快去新增好友或加入群組吧!
              </span>
            )
          ) : (
            <LoadingList />
          )}
        </div>
      </div>

      <CreateRoomModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}
