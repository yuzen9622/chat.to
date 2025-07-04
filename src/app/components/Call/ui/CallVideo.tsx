"use client";

import { useCallStore } from "@/app/store/CallStore";
import { Volume2, VolumeOff } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useRef } from "react";

export default function CallVideo({
  stream,
  userId,
  isOwn = false,
}: {
  stream: MediaStream;
  userId: string;
  isOwn?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const { callRoom } = useCallStore();

  const user = useMemo(() => {
    if (!callRoom) return null;
    const roomMember = callRoom.room_members.find(
      (rm) => rm.user_id === userId
    );
    return roomMember?.user || null;
  }, [callRoom, userId]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative animate-in zoom-in-0 flex-1 w-full rounded-md max-w-[100%] min-w-[50%]">
      <video
        className="absolute inset-0 object-cover w-full h-full rounded-md "
        autoPlay
        muted={true}
        ref={videoRef}
        controls={false}
        playsInline={true}
      />

      {user && !stream.getVideoTracks()[0]?.enabled && (
        <div className="absolute inset-0 grid w-full h-full gap-2 bg-stone-100 place-items-center dark:bg-stone-900 place-content-center">
          <Image
            alt={user.name}
            src={user.image}
            width={60}
            height={60}
            className="w-16 h-16 rounded-full aspect-square"
          />
          <p className="font-bold w-fit ">{isOwn ? "你" : user.name}</p>
        </div>
      )}

      <div className="absolute p-2 text-white rounded-full inset-2 w-fit h-fit bg-stone-800/50 backdrop-blur-md">
        {stream.getAudioTracks()[0].enabled ? (
          <Volume2 size={20} />
        ) : (
          <VolumeOff size={20} />
        )}
      </div>
      {user && (
        <div className="absolute px-3 py-2 font-bold text-white rounded-3xl right-2 top-2 w-fit h-fit bg-stone-800/50 backdrop-blur-lg">
          {isOwn ? "你" : user.name}
        </div>
      )}
    </div>
  );
}
