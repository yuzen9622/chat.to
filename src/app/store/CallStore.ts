import {
  CallStatus,
  CallType,
  RoomInterface,
  UserInterface,
} from "@/types/type";

import { create } from "zustand";

import { useAblyStore } from "./AblyStore";
type CallConfig = {
  isMicOn: boolean;
  isCameraOn: boolean;
};

type PeerMap = Record<string, RTCPeerConnection>;

interface CallStore {
  callStatus: CallStatus;
  callUsers: UserInterface[];
  callRoom: RoomInterface | null;
  isCaller: boolean;
  callConfig: CallConfig;
  callStartTime: Date | null;
  localStream: MediaStream | null;
  remoteStreams: { userId: string; stream: MediaStream }[];
  callType: CallType;
  peerConnections: PeerMap;
  addPeer: (id: string, pc: RTCPeerConnection) => void;
  removePeer: (id: string) => void;
  startCall: (
    users: UserInterface[],
    room: RoomInterface,
    isCaller: boolean,
    callType: CallType,
    stream: MediaStream
  ) => void;
  setCallStatus: (callStatus: CallStatus) => void;
  setCallConfig: (config: CallConfig) => void;
  setCallUsers: (users: UserInterface[]) => void;
  setCallRoom: (room: RoomInterface) => void;
  closeCall: () => void;
  addRemoteStream: (userId: string, remoteStream: MediaStream) => void;
  removeRemoteStream: (userId: string) => void;
  addCallUser: (user: UserInterface) => void;
  toggleMic: (isOn: boolean, userId: string) => Promise<void>;
  toggleCamera: (isOn: boolean, userId: string) => Promise<void>;
}
export const useCallStore = create<CallStore>((set, get) => ({
  callStatus: "disconnect",
  callUsers: [],
  callRoom: null,
  isCaller: false,

  callStartTime: null,
  localStream: null,
  remoteStreams: [],
  callType: "voice",
  callConfig: {
    isMicOn: false,
    isCameraOn: false,
  },
  peerConnections: {},
  startCall: (users, room, isCaller, callType, stream) => {
    set({
      callUsers: users,
      callRoom: room,
      isCaller: isCaller,
      localStream: stream,
      callType,
      callConfig: { isCameraOn: callType === "video", isMicOn: true },
      callStartTime: new Date(),
    });
  },
  addPeer: (id, pc) =>
    set((s) => ({ peerConnections: { ...s.peerConnections, [id]: pc } })),
  removePeer: (id) =>
    set((s) => {
      const newPeers = { ...s.peerConnections };
      delete newPeers[id];
      return { peerConnections: newPeers };
    }),

  setCallConfig: (config) => set({ callConfig: config }),
  setCallStatus: (callStatus) => set({ callStatus }),
  setCallUsers: (users) => set({ callUsers: users }),
  setCallRoom: (room) => set({ callRoom: room }),
  addCallUser: (user) => {
    set((state) => {
      if (state.callUsers.some((cu) => cu.id === user.id)) {
        return state;
      }
      return { ...state, callUsers: [...state.callUsers, user] };
    });
  },

  addRemoteStream: (userId, stream) =>
    set((state) => {
      if (state.remoteStreams.some((rs) => rs.userId === userId)) {
        return {
          ...state,
          remoteStreams: state.remoteStreams.map((rs) => {
            return rs.userId === userId ? { userId, stream } : rs;
          }),
        };
      }
      return {
        ...state,
        remoteStreams: [...state.remoteStreams, { userId, stream }],
      };
    }),
  removeRemoteStream: (userId) => {
    set((state) => {
      const newStreams = [...state.remoteStreams].filter(
        (rs) => rs.userId !== userId
      );
      return { ...state, remoteStreams: newStreams };
    });
  },

  closeCall: () => {
    set((state) => {
      if (!state.localStream) return state;
      state.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      Object.values(state.peerConnections).forEach((peer) => {
        peer.close();
      });
      return {
        ...state,
        callUsers: [],
        callStatus: "disconnect",
        callConfig: {
          isMicOn: false,
          isCameraOn: false,
        },
        callRoom: null,
        callStartTime: null,
        isCaller: false,
        localStream: null,
        remoteStreams: [],
        peerConnections: {},
      };
    });
  },
  toggleCamera: async (isOn, userId) => {
    const state = get();
    if (!state.localStream) return;
    const stream = state.localStream;
    const { channel } = useAblyStore.getState();

    if (!isOn) {
      // 關閉攝影機

      stream.getVideoTracks()[0].enabled = false;
      if (channel) {
        channel.publish("call_action", {
          action: "setting",
          from: userId,
          room: state.callRoom,
          setting: { isOn: false, type: "video" },
        });
      }
    } else {
      stream.getVideoTracks()[0].enabled = true;
      if (channel) {
        channel.publish("call_action", {
          action: "setting",
          from: userId,
          room: state.callRoom,
          setting: { isOn: true, type: "video" },
        });
      }
    }
    set((state) => {
      return {
        ...state,
        localStream: stream,
        callConfig: { ...state.callConfig, isCameraOn: isOn },
      };
    });
  },
  toggleMic: async (isOn, userId) => {
    const state = get();
    if (!state.localStream) return;
    const stream = state.localStream;
    const { channel } = useAblyStore.getState();

    if (!isOn) {
      // 關閉攝影機

      stream.getAudioTracks()[0].enabled = false;
      if (channel) {
        channel.publish("call_action", {
          action: "setting",
          from: userId,
          room: state.callRoom,
          setting: { isOn: false, type: "voice" },
        });
      }
    } else {
      stream.getAudioTracks()[0].enabled = true;
      if (channel) {
        channel.publish("call_action", {
          action: "setting",
          from: userId,
          room: state.callRoom,
          setting: { isOn: true, type: "voice" },
        });
      }
    }
    set((state) => {
      return {
        ...state,
        localStream: stream,
        callConfig: { ...state.callConfig, isMicOn: isOn },
      };
    });
  },
}));
// 開始通話
// 設定通話狀態
// 設定通話人員
// 通話設定
// 結束通話
