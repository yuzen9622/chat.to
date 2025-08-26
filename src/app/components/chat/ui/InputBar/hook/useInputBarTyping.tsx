import type { RealtimeChannel } from "ably";
import _ from "lodash";
import { useCallback, useMemo, useRef } from "react";

import type { TypingInterface, UserInterface } from "@/types/type";

import type { ChangeEvent } from "react";
export const useInputBarTyping = ({
  user,
  channel,
  roomId,
}: {
  user?: UserInterface;
  channel?: RealtimeChannel | null;
  roomId: string;
}) => {
  const isTyping = useRef(false);
  const debouncedStopTyping = useMemo(() => {
    return _.debounce(
      async (channelArg: RealtimeChannel | null, userArg?: UserInterface) => {
        if (!userArg || !channelArg || !isTyping.current) return;

        const typingUser: TypingInterface = {
          roomId,
          user: userArg,
          typing: false,
        };
        await channelArg.publish("typing_action", typingUser);
        isTyping.current = false;
      },
      500
    );
  }, [roomId]);

  const handleChange = useCallback(
    async (
      e: ChangeEvent<HTMLTextAreaElement>,
      setMessageText: React.Dispatch<string>
    ) => {
      if (!user || !channel) return;
      setMessageText(e.target.value);

      if (!isTyping.current && user && channel) {
        isTyping.current = true;
        const typingUser: TypingInterface = {
          roomId: roomId,
          user: user,
          typing: true,
        };
        await channel.publish("typing_action", typingUser);
      }

      debouncedStopTyping(channel, user);
    },
    [roomId, channel, user, debouncedStopTyping]
  );
  return { handleChange };
};
