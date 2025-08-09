import type { InboundMessage } from "ably";
import { useEffect } from "react";

import { ablyEventManager } from "@/app/lib/ably/ablyManager";
import { useChatStore } from "@/app/store/ChatStore";

export const useTypingListener = () => {
  const { setTypingUsers } = useChatStore();
  useEffect(() => {
    const handleTyping = async (message: InboundMessage) => {
      const { data } = message;
      setTypingUsers(data);
    };
    ablyEventManager.subscribe("typing_action", handleTyping);
    return () => {
      ablyEventManager.unsubscribe("typing_action", handleTyping);
    };
  }, [setTypingUsers]);
};
