import {
  createRoom,
  deleteRoom,
  joinRoom,
  quitRoom,
} from "@/app/lib/api/room/roomApi";
import { useAblyStore } from "@/app/store/AblyStore";
import { useChatStore } from "@/app/store/ChatStore";

import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const useChatAction = () => {
  const { currentChat, setRoom } = useChatStore();
  const { channel } = useAblyStore();
  const user = useSession()?.data?.user;
  const router = useRouter();
  //退出房間
  const handleQuit = useCallback(async () => {
    const confirm = window.confirm("確定退出房間?");
    if (!currentChat || !user || !channel || !confirm) return;
    if (currentChat.room_type === "group") {
      currentChat.room_members = currentChat.room_members.filter(
        (rm) => rm.user_id !== user.id
      );
      setRoom((prev) => {
        return prev.filter((r) => r.id !== currentChat?.id);
      });
    } else {
      currentChat.room_members = currentChat.room_members.map((rm) => {
        if (rm.user_id === user.id) {
          return { ...rm, is_deleted: true };
        }
        return rm;
      });
    }
    await quitRoom(currentChat.id, user.id, currentChat.room_type);
    router.push("/chat");
    channel.publish("room_action", { action: "edit", newRoom: currentChat });
  }, [user, currentChat, channel, router, setRoom]);

  //新增用戶至房間
  const handleJoin = useCallback(
    async (roomMembers: string[]) => {
      try {
        if (!channel || !currentChat || !user) return;
        const isPersonalRoom = currentChat.room_type === "personal";
        const recipientMember = currentChat.room_members.find(
          (rm) => rm.user_id !== user.id
        );
        const data =
          isPersonalRoom && recipientMember
            ? await createRoom(
                user.id,
                "",
                [...roomMembers, recipientMember.user_id],
                "group"
              )
            : await joinRoom(currentChat, roomMembers);

        if (!data) return;
        await channel.publish("room_action", {
          action: "join",
          newRoom: data,
        });
      } catch (error) {
        console.log(error);
      } finally {
      }
    },
    [channel, currentChat, user]
  );
  //刪除房間
  const handleDelete = useCallback(async () => {
    try {
      const confirm = window.confirm("確定刪除房間?");
      if (!channel || !user || !currentChat || !confirm) return;
      const { id, room_type } = currentChat;
      await deleteRoom(id, user.id, room_type);
      router.push("/chat");
      await channel.publish("room_action", {
        action: "delete",
        newRoom: currentChat,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, [channel, user, currentChat, router]);

  return { handleJoin, handleQuit, handleDelete };
};
