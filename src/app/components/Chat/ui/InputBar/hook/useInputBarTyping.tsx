import { TypingInterface, UserInterface } from "@/types/type";
import { RealtimeChannel } from "ably";
import { ChangeEvent, useCallback, useRef } from "react";
import _ from "lodash";
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
  const debouncedStopTyping = useCallback(
    _.debounce(async () => {
      if (!user || !channel || !isTyping.current) return;

      const typingUser: TypingInterface = {
        roomId: roomId,
        user: user,
        typing: false,
      };
      await channel.publish("typing_action", typingUser);
      isTyping.current = false;
    }, 500),
    [channel, roomId, user]
  );

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

      debouncedStopTyping();
    },
    [channel, roomId, user, debouncedStopTyping]
  );
  return { handleChange };
};
