"use client";
import { supabase } from "@/app/lib/supabasedb";
import { MessageInterface } from "@/app/lib/type";
import { roomSort } from "@/app/lib/util";
import { useChatStore } from "@/app/store/ChatStore";
import { useEffect, useMemo, useState } from "react";

export const useLastMessage = (roomId: string) => {
  const { lastMessages, setLastMessages } = useChatStore();

  const [lastMessageFromDB, setLastMessageFromDB] =
    useState<MessageInterface | null>(null);

  const cachedMessage = useMemo(() => {
    return lastMessages[roomId];
  }, [lastMessages, roomId]);

  useEffect(() => {
    let ignore = false;

    const fetchLastMessage = async () => {
      if (ignore) return;
      const controler = new AbortController();
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .abortSignal(controler.signal)
        .eq("room", roomId)
        .eq("status", "send")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        setLastMessageFromDB(null);
        console.log("Error fetching last message:", error);
      }
      if (!data) return;
      setLastMessageFromDB(data);
      setLastMessages(data);
    };

    if (!cachedMessage || cachedMessage.status === "failed") {
      fetchLastMessage();
    }

    return () => {
      ignore = true;
    };
  }, [cachedMessage, setLastMessages, roomId]);
  useEffect(() => {
    roomSort();
  }, [lastMessages]);
  return cachedMessage || lastMessageFromDB;
};
