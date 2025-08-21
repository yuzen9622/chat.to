import { AudioLines, CirclePlay, CircleX, Pause, Play } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";

import { sendAblyMessage } from "@/app/lib/ably/ablyMessage";
import { sendUserMessage } from "@/app/lib/api/message/messageApi";
import { createFileMessage } from "@/app/lib/createMessage";
import { uploadFile } from "@/app/lib/util";
import { useAblyStore } from "@/app/store/AblyStore";
import { useAuthStore } from "@/app/store/AuthStore";
import { useChatStore } from "@/app/store/ChatStore";
import { useWavesurfer } from "@wavesurfer/react";

type AudioProps = {
  url: string;
  backgroundColor?: string;
  isDark?: boolean;
  isOwn: boolean;
};
export default function WavesurferAudio({
  url,
  backgroundColor,
  isDark,
  isOwn,
}: AudioProps) {
  const audioRef = useRef<HTMLDivElement>(null);

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: audioRef,
    url: url,
    barGap: 2,
    barWidth: 3,
    cursorWidth: 0,
    barHeight: 2,
    barRadius: 6,
    height: "auto",
    waveColor: isOwn ? "white" : isDark ? "white" : "rgb(59, 130, 246)",
    progressColor: isOwn
      ? "#93c5fd"
      : isDark
      ? "rgba(64, 64, 64, 0.7)"
      : "#93c5fd",
    width: "100%",
  });
  const [time, setTime] = useState("");
  const handlePlayPause = useCallback(() => {
    if (!wavesurfer) return;
    wavesurfer.playPause();
  }, [wavesurfer]);
  useEffect(() => {
    return () => {
      wavesurfer?.destroy();
    };
  }, [wavesurfer]);

  useEffect(() => {
    const formatProgress = () => {
      let renderTime = currentTime;

      if (!wavesurfer) return;

      if (renderTime === 0) {
        renderTime = wavesurfer.getDuration();
      }

      if (wavesurfer.getDuration() === currentTime) {
        wavesurfer.setTime(0);
        wavesurfer.stop();
      }

      const formattedTime = [
        Math.floor((renderTime % 3600) / 60),
        Math.floor(renderTime % 60),
      ]
        .map((v) => (v < 10 ? "0" + v : v))
        .join(":");
      setTime(formattedTime);
    };
    wavesurfer?.on("ready", () => {
      formatProgress();
    });
    formatProgress();
  }, [wavesurfer, currentTime]);

  wavesurfer?.on("interaction", () => {
    wavesurfer.play();
  });

  return (
    <div
      className={twMerge(
        "flex w-48  px-2 py-2 bg-blue-500 rounded-3xl   ",
        backgroundColor && backgroundColor,
        !isOwn && "border  dark:border-none"
      )}
    >
      <button type="button" onClick={handlePlayPause} className="px-1">
        {!isPlaying ? (
          <Play
            size={20}
            className={twMerge(
              "text-blue-500 dark:text-white",
              isOwn && " text-white"
            )}
          />
        ) : (
          <Pause
            size={20}
            className={twMerge(
              "text-blue-500 dark:text-white",
              isOwn && " text-white"
            )}
          />
        )}
      </button>
      <div className="w-full" ref={audioRef}></div>
      <div
        className={twMerge(
          "text-blue-500 p-2 text-xs dark:text-white",
          isOwn && " text-white"
        )}
      >
        {time}
      </div>
    </div>
  );
}

export function WavesurferRecord({
  setIsRecord,
  isRecord,
}: {
  setIsRecord: React.Dispatch<React.SetStateAction<boolean>>;
  isRecord: boolean;
}) {
  const { currentChat, reply, setCurrentMessage } = useChatStore();
  const audioRef = useRef<HTMLDivElement>(null);
  const recordRef = useRef<RecordPlugin>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [recordOver, setRecordOver] = useState(true);
  const [time, setTime] = useState("00:00");
  const { ably } = useAblyStore();
  const { setSystemAlert } = useAuthStore();

  const user = useSession()?.data?.user;

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: audioRef,
    barGap: 3,
    barWidth: 4,
    barHeight: 4,
    barRadius: 5,
    height: "auto",
    waveColor: "rgba(255,255,255)",
    cursorColor: "white",
    progressColor: "white",
    cursorWidth: 0,
    width: "100%",
  });
  const updateProgress = useCallback(() => {
    // time will be in milliseconds, convert it to mm:ss format
    const formattedTime = [
      Math.floor((currentTime % 3600) / 60), // minutes
      Math.floor(currentTime % 60), // seconds
    ]
      .map((v) => (v < 10 ? "0" + v : v))
      .join(":");
    setTime(formattedTime);
  }, [currentTime]);

  useEffect(() => {
    updateProgress();
  }, [updateProgress]);

  const handleRecordStatus = useCallback(() => {
    const record = recordRef.current;
    if (!record || !wavesurfer) return;
    if (record.isPaused() || wavesurfer.isPlaying()) {
      wavesurfer.pause();
      record.resumeRecording();
      setIsPaused(false);
    } else {
      record.pauseRecording();

      wavesurfer.setTime(0);
      setIsPaused(true);
    }
  }, [wavesurfer]);

  const handlePlay = useCallback(() => {
    if (!wavesurfer) return;

    wavesurfer.playPause();
  }, [wavesurfer]);

  const handleSend = useCallback(
    async (file: File) => {
      if (!user || !currentChat || !ably) return;
      try {
        const audioMessage = createFileMessage(
          user,
          currentChat?.id,
          file,
          reply ?? void 0
        );
        setCurrentMessage((prev) => [...prev, audioMessage]);
        const filesResponse = await uploadFile([file]);
        if (filesResponse && audioMessage.meta_data) {
          const { url, public_id } = filesResponse[0];
          audioMessage.meta_data = {
            ...audioMessage.meta_data,
            url,
            public_id,
          };
          await Promise.all([
            sendUserMessage(audioMessage),
            sendAblyMessage(audioMessage),
          ]);
        }
      } catch (error) {
        console.log(error);
        setSystemAlert({
          open: true,
          text: "語音傳送失敗",
          variant: "filled",
          severity: "error",
        });
      }
    },
    [user, currentChat, reply, setCurrentMessage, ably, setSystemAlert]
  );

  useEffect(() => {
    if (!wavesurfer) return;

    const record = wavesurfer.registerPlugin(
      RecordPlugin.create({
        renderRecordedAudio: true,
        continuousWaveform: true,
        continuousWaveformDuration: 5,
      })
    );
    recordRef.current = record;

    const handleEnd = async (blob: Blob) => {
      if (!blob) return;
      const file = new File([blob], `audio-${Date.now()}`, {
        type: "audio/mp3",
      });
      await handleSend(file);
    };

    record.on("record-end", handleEnd);
    (async () => {
      const devices = await RecordPlugin.getAvailableAudioDevices();
      if (devices.length > 0) {
        await record.startRecording({ deviceId: devices[0].deviceId });
        setIsRecord(true);
        setRecordOver(false);
      } else {
        console.warn("找不到音訊裝置");
      }
    })();
  }, [wavesurfer, handleSend, setIsRecord]);

  const handleAudio = useCallback(() => {
    const record = recordRef.current;
    if (!wavesurfer || !record) return;
    record.pauseRecording();
    record.stopMic();
    record.stopRecording();

    setIsRecord(false);
  }, [wavesurfer, setIsRecord]);

  const handleClose = useCallback(() => {
    const record = recordRef.current;
    if (!record) return;
    record.unAll();
    record.destroy();
    setIsRecord(false);
  }, [setIsRecord]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (!recordRef.current) return;
        e.preventDefault();
        handleAudio();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleAudio]);

  return (
    <div
      className={twMerge(
        "sticky flex bottom-0  text-white bg-blue-600 gap-2 px-1 py-1 m-2 border border-t dark:border-none rounded-3xl transition-all  backdrop-blur-3xl"
      )}
    >
      <div className="flex  items-center flex-1 gap-2 overflow-hidden [&::-webkit-scrollbar]:w-0 ">
        {isPaused ? (
          <button onClick={handlePlay} type="button" className="p-1">
            {isPlaying ? <Pause /> : <CirclePlay />}
          </button>
        ) : (
          <button onClick={handleClose} className="p-1" type="button">
            <CircleX />
          </button>
        )}

        <div
          className={twMerge("flex-1 w-full h-8 overflow-hidden  ")}
          ref={audioRef}
        ></div>

        {isRecord && <span className="text-xs ">{time}</span>}
      </div>
      {!recordOver && (
        <button type="button" onClick={handleRecordStatus} className="p-1">
          {isPaused ? <Pause /> : <Play />}
        </button>
      )}
      <button
        type="button"
        onClick={handleAudio}
        className="p-1 px-3 transition-all bg-white rounded-3xl active:bg-blue-300 zoom-in animate-in "
      >
        <AudioLines className="text-blue-600 " />
      </button>
    </div>
  );
}
