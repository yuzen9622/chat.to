import { useCallStore } from "@/app/store/CallStore";
import { useChatStore } from "@/app/store/ChatStore";
import { InboundMessage, RealtimeChannel } from "ably";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { ablyEventManager } from "@/app/lib/ably/ablyManager";
import { RoomMemberInterface } from "@/types/type";
import { createPeer, startStream } from "@/app/lib/util";
export const useCallListener = (channel: RealtimeChannel) => {
  const {
    setCallStatus,
    startCall,
    addPeer,
    closeCall,
    addRemoteStream,
    removePeer,
    removeRemoteStream,
    setCallRoom,
  } = useCallStore();
  const { rooms } = useChatStore();
  const user = useSession()?.data?.user;

  useEffect(() => {
    const handleCallAction = async (message: InboundMessage) => {
      const { action, room, from, to, caller, callType, setting } =
        message.data;
      const { callRoom, peerConnections, callStatus, remoteStreams } =
        useCallStore.getState();

      if (!user?.id || !rooms.some((r) => r.id === room?.id)) return;

      if (action === "offer") {
        if (caller.id === user.id) return;
        console.log(message.data);

        if (!callRoom || callRoom.id !== room.id) {
          const confirm = window.confirm(`${caller.name}的來電`) ?? true;
          if (!confirm) {
            await channel.publish("call_action", {
              action: "decline",
            });
            return;
          }
        }
        const stream = await startStream(callType);
        startCall([caller, user], room, false, callType, stream);
        setCallStatus("receiving");
        setCallRoom(room);
        await Promise.all(
          room.room_members.map(async (rm: RoomMemberInterface) => {
            await channel.publish("call_action", {
              action: "answer",
              from: user,
              to: rm.user,
              room: room,
            });
          })
        );

        setCallStatus("connect");
      }

      if (
        action === "answer" &&
        (callStatus == "waiting" ||
          callStatus === "connect" ||
          callStatus === "receiving")
      ) {
        if (
          to.id !== user?.id ||
          from.id === user.id ||
          peerConnections[from.id]
        )
          return;

        const pc = createPeer(user.id, from.id, channel);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        addPeer(from.id, pc);

        await channel.publish("signal_action", {
          type: "offer",
          from: user.id,
          to: from.id,
          sdp: offer.sdp,
        });

        setCallStatus("connect");
      }

      if (action === "leave") {
        removePeer(from);
        removeRemoteStream(from);
      }

      if (action === "decline") {
        closeCall();
      }

      if (action === "setting") {
        const settingStream = remoteStreams.find((rs) => rs.userId === from);

        if (!settingStream) return;

        if (setting.type === "voice") {
          settingStream.stream.getAudioTracks()[0].enabled = setting.isOn;
        } else {
          settingStream.stream.getVideoTracks()[0].enabled = setting.isOn;
        }
        addRemoteStream(from, settingStream.stream);
      }
    };
    ablyEventManager.subscribe("call_action", handleCallAction);
    return () => {
      ablyEventManager.unsubscribe("call_action", handleCallAction);
    };
  }, [
    channel,
    user,
    rooms,
    removeRemoteStream,
    removePeer,
    setCallRoom,
    setCallStatus,
    startCall,
    addRemoteStream,
    addPeer,
    closeCall,
  ]);
};
