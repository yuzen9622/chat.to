import type { InboundMessage } from "ably";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { ablyEventManager } from "@/app/lib/ably/ablyManager";
import { useChatStore } from "@/app/store/ChatStore";

import type { RoomInterface, RoomMemberInterface } from "@/types/type";

export const useRoomListener = () => {
  const { setRoom, currentChat, setCurrentChat } = useChatStore();
  const userId = useSession()?.data?.userId;
  useEffect(() => {
    if (!ablyEventManager) return;
    const handleCreate = (message: InboundMessage) => {
      const { newRoom, newRoomMembers } = message.data;

      if (!userId) return;

      setRoom((prev) => {
        if (
          !prev.some((roomInfo) => roomInfo.id === newRoom.id) &&
          newRoomMembers.includes(userId)
        ) {
          return [...prev, newRoom];
        }
        return prev;
      });
    };
    const handleJoin = (message: InboundMessage) => {
      const { newRoom }: { newRoom: RoomInterface } = message.data;
      if (!userId) return;
      if (
        !newRoom ||
        !newRoom.room_members.some(
          (m: RoomMemberInterface) => m.user_id === userId
        ) ||
        newRoom.room_type === "personal"
      )
        return;

      if (newRoom.id === currentChat?.id) {
        setCurrentChat(newRoom);
      }

      setRoom((prevRooms) => {
        if (!prevRooms.some((room) => room.id === newRoom.id)) {
          return [...prevRooms, newRoom];
        }
        return prevRooms.map((room) => {
          if (room.id === newRoom.id) {
            return newRoom;
          }
          return room;
        });
      });
    };
    const handleEdit = (message: InboundMessage) => {
      const { newRoom }: { newRoom: RoomInterface } = message.data;
      console.log(newRoom);
      if (newRoom.id === currentChat?.id) {
        setCurrentChat(newRoom);
      }
      setRoom((prev) => {
        return prev.map((r) => {
          if (r.id === newRoom.id) {
            return newRoom;
          }
          return r;
        });
      });
    };

    const handleDelete = (message: InboundMessage) => {
      const { newRoom }: { newRoom: RoomInterface } = message.data;
      setRoom((prev) => {
        return prev.filter((room) => room.id !== newRoom.id);
      });
    };

    const handleRoomAction = (message: InboundMessage) => {
      const { action } = message.data;
      if (action === "join") {
        handleJoin(message);
      } else if (action === "create") {
        handleCreate(message);
      } else if (action === "edit") {
        handleEdit(message);
      } else if (action === "delete") {
        handleDelete(message);
      }
    };
    ablyEventManager.subscribe("room_action", handleRoomAction);
    return () => {
      ablyEventManager.unsubscribe("room_action", handleRoomAction);
    };
  }, [setRoom, userId, currentChat, setCurrentChat]);
};
