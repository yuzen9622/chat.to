"use client";

import { roomSort } from "@/app/lib/util";
import { useChatStore } from "@/app/store/ChatStore";
import { useEffect, useMemo } from "react";

export const useLastMessage = (roomId: string) => {
  const { lastMessages } = useChatStore();

  const cachedMessage = useMemo(() => {
    return lastMessages[roomId];
  }, [lastMessages, roomId]);

  // useEffect(() => {
  //   let ignore = false;

  //   const fetchLastMessage = async () => {
  //     if (ignore) return;
  //     const controler = new AbortController();
  //     const { data, error } = await supabase
  //       .from("messages")
  //       .select("*")
  //       .abortSignal(controler.signal)
  //       .eq("room", roomId)
  //       .eq("status", "send")
  //       .order("created_at", { ascending: false })
  //       .limit(1)
  //       .maybeSingle();

  //     if (error) {
  //       setLastMessageFromDB(null);
  //       console.log("Error fetching last message:", error);
  //     }
  //     if (!data) {
  //       setLastMessageFromDB(data);
  //       const lastMessage: ClientMessageInterface = {
  //         id: "",
  //         room: roomId,
  //         text: "",
  //         sender: "",
  //         created_at: "",
  //         status: "send",
  //         is_read: [],
  //         type: "text",
  //       };
  //       setLastMessages({ ...lastMessage, isFetching: true });
  //     }
  //     setLastMessageFromDB(data);
  //     setLastMessages({ ...data, isFetching: true });
  //   };

  //   if (
  //     !cachedMessage ||
  //     cachedMessage.status === "failed" ||
  //     !cachedMessage.isFetching
  //   ) {
  //     fetchLastMessage();
  //   }

  //   return () => {
  //     ignore = true;
  //   };
  // }, [cachedMessage, setLastMessages, roomId]);
  useEffect(() => {
    roomSort();
  }, [lastMessages, cachedMessage]);
  return cachedMessage;
};
