import { useTheme } from "next-themes";
import { memo, useMemo } from "react";

import WavesurferAudio from "@/app/components/ui/Audio";
import { useChatStore } from "@/app/store/ChatStore";

import type { MetaData } from "@/types/type";
const AudioMessage = memo(function AudioMessage({
  metaData,
  isOwn,
}: {
  metaData: MetaData;
  isOwn: boolean;
}) {
  const { theme, systemTheme } = useTheme();
  const isDark =
    theme === "dark" || (theme === "system" && systemTheme === "dark");
  const { currentChat } = useChatStore();
  const themeColor = useMemo(() => {
    if (!currentChat || !currentChat.room_theme)
      return "bg-blue-500 text-white";

    return currentChat.room_theme.type === "color"
      ? `${currentChat.room_theme.ownColor} ${currentChat.room_theme.textColor}`
      : "bg-blue-500 text-white";
  }, [currentChat]);
  return (
    <WavesurferAudio
      url={metaData.url}
      isOwn={isOwn}
      isDark={isDark}
      backgroundColor={
        isOwn ? themeColor : isDark ? "bg-stone-900/90" : "bg-white"
      }
    />
  );
});
export default AudioMessage;
