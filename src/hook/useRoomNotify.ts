"use client";
import { useChatStore } from "@/app/store/ChatStore";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export const useRoomNotify = (roomId: string) => {
  const { notify, currentChat } = useChatStore();
  const user = useSession().data?.user;

  const roomNotify = useMemo(
    () =>
      notify.filter(
        (item) =>
          item.room === roomId &&
          user &&
          !item.is_read?.includes(user.id) &&
          item.sender !== user?.id &&
          currentChat?.id !== item.room
      ),
    [notify, currentChat, user, roomId]
  );
  return roomNotify.length;
};
