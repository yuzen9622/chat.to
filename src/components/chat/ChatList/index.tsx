import { SquarePen } from "lucide-react";
import { useSession } from "next-auth/react";
import { memo, useEffect, useState } from "react";

import { CreateRoomModal } from "@/components/chat/ChatList/CreateModal";
import { LoadingList } from "@/components/chat/ChatList/Loading";
import ChatButton from "@/components/chat/ui/ChatButton";
import NoteList from "@/components/shared/NoteList";
import { fetchUsersNotify } from "@/lib/api/notify/notifyApi";
import { fetchUserRooms } from "@/lib/api/room/roomApi";
import { useChatStore } from "@/store/ChatStore";

import type { ClientMessageInterface, RoomInterface } from "@/types/type";

export const ChatList = memo(function ChatList() {
  const user = useSession()?.data?.user;

  const { setRoom, rooms, setNotify, setLastMessages } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const loadRooms = async () => {
      if (!user || rooms.length > 0) return;

      try {
        setIsLoading(true);
        const {
          rooms: roomsData,
          lastMessages,
        }: { rooms: RoomInterface[]; lastMessages: ClientMessageInterface[] } =
          await fetchUserRooms();
        const inRooms = roomsData.filter((r) =>
          r.room_members.some((m) => m.user_id === user?.id)
        );

        if (roomsData.length > 0) {
          setRoom(() => inRooms);
        }
        lastMessages.forEach((lm) => {
          setLastMessages({ ...lm, isFetching: true });
        });
        const notifiesData = await fetchUsersNotify(user.id ?? "", inRooms);
        setNotify(() => notifiesData);
      } catch (error) {
        console.error("Failed to load rooms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, [user, setRoom, setNotify, rooms, setLastMessages]);

  return (
    <div className="flex flex-col h-full p-2 sm:dark:bg-neutral-800 border-t-gray-500">
      <span className="flex justify-between w-full p-2">
        {user && (
          <h1 className="text-xl font-semibold truncate ">{user.name}</h1>
        )}
        <button
          onClick={() => setIsOpen(true)}
          className="p-1 rounded-lg dark:text-white hover:dark:bg-white/10 hover:bg-stone-900/10 hover:dark:text-white"
        >
          <SquarePen />
        </button>
      </span>
      <div>
        <NoteList />
      </div>

      <span className="py-1 text-lg font-semibold text-blue-400">Chats</span>

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
});
ChatList.displayName = "ChatList";
export default ChatList;
