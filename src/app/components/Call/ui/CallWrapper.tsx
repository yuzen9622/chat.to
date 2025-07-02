"use client";
import React from "react";
import CallVideo from "./CallVideo";
import { useCallStore } from "@/app/store/CallStore";
import { Mic, MicOff, PhoneMissed, Video, VideoOff } from "lucide-react";
import { useSession } from "next-auth/react";
export default function CallWrapper() {
  const {
    localStream,
    callStatus,
    callConfig,
    remoteStreams,
    callType,
    closeCall,
    toggleCamera,
    toggleMic,
  } = useCallStore();
  const user = useSession()?.data?.user;

  return (
    <div className="relative flex flex-wrap justify-center w-full h-full gap-2 p-2 overflow-hidden ">
      {localStream && user && (
        <CallVideo userId={user.id} isOwn={true} stream={localStream} />
      )}
      {remoteStreams.map((data) => (
        <CallVideo
          userId={data.userId}
          key={data.userId}
          stream={data.stream}
        />
      ))}
      <span className="absolute z-10 flex gap-2 text-white -translate-x-1/2 bottom-4 left-1/2">
        {callStatus !== "disconnect" && user && (
          <>
            <button
              onClick={() => toggleMic(!callConfig.isMicOn, user.id)}
              className="p-2 bg-blue-500 rounded-full "
            >
              {callConfig.isMicOn ? <Mic /> : <MicOff />}
            </button>
            {callType === "video" && (
              <button
                onClick={() => toggleCamera(!callConfig.isCameraOn, user.id)}
                className="p-2 bg-blue-500 rounded-full"
              >
                {callConfig.isCameraOn ? <Video /> : <VideoOff />}
              </button>
            )}
          </>
        )}

        <button onClick={closeCall} className="p-2 bg-red-500 rounded-full ">
          <PhoneMissed />
        </button>
      </span>
    </div>
  );
}
