import type { InboundMessage, RealtimeChannel } from "ably";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { ablyEventManager } from "@/app/lib/ably/ablyManager";
import { createPeer } from "@/app/lib/util";
import { useCallStore } from "@/app/store/CallStore";
import { useChatStore } from "@/app/store/ChatStore";

export const useSignalListener = (channel: RealtimeChannel) => {
  const { peerConnections, addPeer } = useCallStore();
  const { rooms } = useChatStore();
  const user = useSession()?.data?.user;

  useEffect(() => {
    const handleCall = async (message: InboundMessage) => {
      const { type, roomId, from, to, sdp, candidate } = message.data;

      if (!user?.id || to !== user?.id || rooms.some((r) => r.id === roomId))
        return;
      if (type === "offer") {
        const pc = createPeer(user.id, from, channel);
        await pc.setRemoteDescription({ type: "offer", sdp });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        addPeer(from, pc);
        channel.publish("signal_action", {
          type: "answer",
          from: user?.id,
          to: from,
          sdp: answer.sdp,
        });
      }

      if (type === "answer") {
        if (
          !peerConnections[from] ||
          peerConnections[from].signalingState === "closed" ||
          peerConnections[from].connectionState === "closed"
        )
          return;
        peerConnections[from].setRemoteDescription({
          type: "answer",
          sdp,
        });
      }
      if (type === "candidate") {
        if (
          !peerConnections[from] ||
          peerConnections[from].signalingState === "closed" ||
          peerConnections[from].connectionState === "closed"
        )
          return;
        peerConnections[from].addIceCandidate(candidate);
      }
    };
    ablyEventManager.subscribe("signal_action", handleCall);

    return () => ablyEventManager.unsubscribe("signal_action", handleCall);
  }, [user, channel, peerConnections, rooms, addPeer]);
};
