import type { InboundMessage } from "ably";
import { useEffect } from "react";

import { ablyEventManager } from "@/app/lib/ably/ablyManager";
import { useAuthStore } from "@/app/store/AuthStore";

import type { NoteInterface } from "@/types/type";

export const useNoteListener = () => {
  const { setFriendNote, friends } = useAuthStore();
  useEffect(() => {
    const handleNote = (message: InboundMessage) => {
      const {
        action,
        note,
      }: { action: "delete" | "update"; note: NoteInterface } = message.data;
      console.log(note);
      if (friends?.some((f) => f.friend_id === note.user_id)) {
        if (action === "delete") {
          setFriendNote((prev) => {
            return prev.filter((n) => n.id !== note.id);
          });
        } else {
          setFriendNote((prev) => {
            if (!prev.some((n) => n.id === note.id)) {
              return [note, ...prev];
            }
            return prev.map((n) => (n.id === note.id ? note : n));
          });
        }
      }
    };
    ablyEventManager.subscribe("note_action", handleNote);

    return () => {
      ablyEventManager.unsubscribe("note_action", handleNote);
    };
  }, [setFriendNote, friends]);
};
