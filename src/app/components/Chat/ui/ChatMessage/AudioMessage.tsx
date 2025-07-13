import WavesurferAudio from "@/app/components/ui/Audio";
import { MetaData } from "@/types/type";
import { useTheme } from "next-themes";
import { memo } from "react";

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
  return (
    <WavesurferAudio
      url={metaData.url}
      isOwn={isOwn}
      isDark={isDark}
      backgroundColor={
        isOwn ? "bg-blue-500" : isDark ? "bg-white/10" : "bg-gray-400/20"
      }
    />
  );
});
export default AudioMessage;
