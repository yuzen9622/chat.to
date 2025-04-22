import React, { useCallback, useEffect, useRef, useState } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import { CirclePlay, Play, Pause, AudioLines } from "lucide-react";
import { twMerge } from "tailwind-merge";
type AudioProps = {
  url: string;
  backgroundColor?: string;
};
export default function WavesurferAudio({ url, backgroundColor }: AudioProps) {
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
    waveColor: backgroundColor?.trim() === "bg-gray-400/20" ? "black" : "white",
    progressColor:
      backgroundColor?.trim() === "bg-gray-400/20"
        ? "rgb(0,0,0,0.5)"
        : "rgb(255,255,255,0.5)",
    width: "100%",
  });
  const [time, setTime] = useState("");
  const handlePlayPause = useCallback(() => {
    if (!wavesurfer) return;
    wavesurfer.playPause();
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
        "flex w-48 p-1 px-2 bg-blue-500 rounded-md",
        backgroundColor && backgroundColor
      )}
    >
      <button type="button" onClick={handlePlayPause} className="px-1">
        {!isPlaying ? (
          <Play size={20} className="text-blue-300 dark:text-white" />
        ) : (
          <Pause size={20} className="text-blue-300 dark:text-white" />
        )}
      </button>
      <div className="w-full" ref={audioRef}></div>
      <div className="p-2 text-xs text-blue-300 dark:text-white">{time}</div>
    </div>
  );
}

export function WavesurferRecord({
  setIsRecord,
  isRecord,
  setAudioUrl,
  formRef,
}: {
  setIsRecord: React.Dispatch<React.SetStateAction<boolean>>;
  isRecord: boolean;
  setAudioUrl: React.Dispatch<React.SetStateAction<string>>;

  formRef: React.RefObject<HTMLFormElement | null>;
}) {
  const audioRef = useRef<HTMLDivElement>(null);
  const recordRef = useRef<RecordPlugin>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [recordOver, setRecordOver] = useState(true);

  const [time, setTime] = useState("00:00");

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: audioRef,
    barGap: 3,
    barWidth: 4,
    barHeight: 4,
    barRadius: 5,
    height: "auto",
    waveColor: "rgb(59 130 246)",
    progressColor: "rgb(59 130 246  /0.5)",
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

  const handleRecord = useCallback(async () => {
    if (!wavesurfer) return;

    const record = wavesurfer.registerPlugin(
      RecordPlugin.create({
        renderRecordedAudio: true,
        continuousWaveform: true,
        continuousWaveformDuration: 5,
      })
    );

    recordRef.current = record;

    setIsRecord(true);
    setRecordOver(false);
    if (!record) return;

    if (record.isRecording()) {
      record.stopRecording();
      setRecordOver(true);
      setIsRecord(false);
      return;
    }
    const devicedId = await RecordPlugin.getAvailableAudioDevices();
    console.log(devicedId);
    record.startRecording({ deviceId: devicedId[0].deviceId });
  }, [wavesurfer, setIsRecord]);

  useEffect(() => {
    const record = recordRef.current;
    if (!record) return;
  }, [isPaused, setAudioUrl]);

  useEffect(() => {
    handleRecord();
  }, [handleRecord]);
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
      // record.once("record-pause", (blob) => {
      //   const url = URL.createObjectURL(blob);
      //   setAudioUrl(url);
      // });
      wavesurfer.setTime(0);
      setIsPaused(true);
    }
  }, [recordRef, wavesurfer, setIsPaused]);

  const handlePlay = useCallback(() => {
    if (!wavesurfer) return;

    wavesurfer.playPause();
  }, [wavesurfer]);

  const handleSendAudio = useCallback(() => {
    const record = recordRef.current;
    if (!wavesurfer || !record) return;

    try {
      if (!record.isPaused()) {
        record.pauseRecording();

        record.on("record-pause", async (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);

          setAudioUrl(url);
        });
      } else if (record.isPaused()) {
        record.on("record-end", async (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);

          setAudioUrl(url);
        });
      }

      record.stopRecording();
    } catch (error) {
      console.log(error);
    } finally {
      formRef.current?.requestSubmit();
      setIsRecord(false);
    }
  }, [recordRef, wavesurfer, setIsRecord, setAudioUrl, formRef]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        console.log(e.key);
        if (!recordRef.current) return;
        e.preventDefault();
        recordRef.current?.stopRecording();
        recordRef.current?.once("record-end", (blob) => {
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        });

        handleSendAudio();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSendAudio, recordRef, setAudioUrl]);

  return (
    <>
      <div className="flex items-center flex-1 overflow-hidden [&::-webkit-scrollbar]:w-0 ">
        {isRecord && isPaused && (
          <button onClick={handlePlay} type="button" className="p-1">
            {isPlaying ? (
              <Pause className="text-blue-400" />
            ) : (
              <CirclePlay className="text-blue-400" />
            )}
          </button>
        )}

        <div
          className={twMerge(
            "flex-1 w-full h-8 overflow-hidden animate-in",
            isRecord && "zoom-in"
          )}
          ref={audioRef}
        ></div>

        {isRecord && <span className="text-xs text-blue-400">{time}</span>}
      </div>
      {isRecord && !recordOver && (
        <button type="button" onClick={handleRecordStatus} className="p-1">
          {isPaused ? (
            <Pause className="text-blue-400" />
          ) : (
            <Play className="text-blue-400" />
          )}
        </button>
      )}
      <button
        type="button"
        onClick={handleSendAudio}
        className="p-1 transition-all bg-blue-600 rounded-lg active:bg-blue-300 zoom-in animate-in "
      >
        <AudioLines className="text-white " />
      </button>
    </>
  );
}
