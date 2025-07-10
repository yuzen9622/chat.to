import { ClientMessageInterface, MetaData, CallType } from "../../types/type";
import { useChatStore } from "../store/ChatStore";

import {
  File,
  FileText,
  FileArchive,
  Sheet,
  ChartPie,
  LetterText,
  FileJson,
  FileImage,
} from "lucide-react";
import { useCallStore } from "../store/CallStore";
import { RealtimeChannel } from "ably";

export async function uploadFile(
  files: File[]
): Promise<Array<{ url: string; public_id: string }> | null> {
  try {
    if (!files) return null;
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    return data.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

//功能函式 normal function

export const clearReadMessage = (roomId: string) => {
  useChatStore.setState((state) => ({
    notify: state.notify.filter((msg) => msg.room !== roomId),
  }));
};

export const messageType = (metaData: MetaData | null) => {
  if (!metaData) return false;
  const { type } = metaData;

  if (type.startsWith("image")) {
    return "image";
  }
  if (type.startsWith("video")) {
    return "video";
  }
  if (type.startsWith("audio")) {
    return "audio";
  }
  return "file";
};
export const replyText = (reply: ClientMessageInterface) => {
  if (!reply) return "";
  if (messageType(reply.meta_data!) === "audio") return "語音";
  if (messageType(reply.meta_data!) === "image") return "圖片";
  if (messageType(reply.meta_data!) === "file") return reply.text;
  if (messageType(reply.meta_data!) === "video") return "影片";
  return reply.text;
};

export const formatSize = (size: number) => {
  let b = "B";
  if (size >= 1024) {
    size /= 1024;
    b = "KB";
  }
  if (size >= 1024) {
    size /= 1024;
    b = "MB";
  }
  if (size >= 1024) {
    size /= 1024;
    b = "GB";
  }
  return `${size.toFixed(1)}${b}`;
};

export const roomSort = () => {
  const { rooms, setRoom } = useChatStore.getState();
  if (!rooms) return;

  // rooms.sort(
  //   (a, b) =>
  //     new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  // );
  setRoom((prev) => {
    const newPrev = prev.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return newPrev;
  });
};

export const getFileIcon = (fileName: string) => {
  const mimeType = fileName.split(".")[fileName.split(".").length - 1];
  const fileIcons = {
    pdf: FileText,
    docx: FileText,
    doc: FileText,
    xlsx: Sheet,
    pptx: ChartPie,
    txt: LetterText,
    zip: FileArchive,
    rar: FileArchive,
    tar: FileArchive,
    js: FileJson,
    ts: FileJson,
    json: FileJson,
    png: FileImage,
    default: File,
  };

  return fileIcons[mimeType as keyof typeof fileIcons] || fileIcons.default;
};

export const handleDownload = async (fileUrl: string, fileName: string) => {
  const a = document.createElement("a");
  if (!fileUrl) return;
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.target = "_blank";
    a.click();
  } catch (error) {
    console.log(error);
  }
};

export const isMobile = (userAgent: string): boolean => {
  return /android.+mobile|ip(hone|[oa]d)/i.test(userAgent);
};

export const Copy2ClipBoard = async (text: string) => {
  const type = "text/plain";
  const clipboardItemData = {
    [type]: new Blob([text], { type: "text/plain" }),
  };

  const clipboardItem = new ClipboardItem(clipboardItemData);
  console.log(clipboardItemData);
  await navigator.clipboard.write([clipboardItem]);
};

export const fileType = (mineType: string) => {
  const type = mineType.split("/")[0];

  if (type === "image" || type === "video") {
    return "media";
  }
  if (type === "audio") {
    return type;
  }
  return "file";
};

export const startStream = async (callType: CallType) => {
  try {
    const streamConfig: MediaStreamConstraints =
      callType === "voice"
        ? { audio: true, video: false }
        : { audio: true, video: true };
    const stream = await navigator.mediaDevices.getUserMedia(streamConfig);
    return stream;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export function createPeer(
  userId: string,
  peerId: string,
  channel: RealtimeChannel
) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
  const { addRemoteStream, localStream, callRoom } = useCallStore.getState();
  localStream?.getTracks().forEach((track) => pc.addTrack(track, localStream));

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      channel.publish("signal_action", {
        type: "candidate",
        from: userId,
        to: peerId,
        candidate: e.candidate,
      });
    }
  };

  pc.ontrack = (e) => {
    console.log(e.streams);
    addRemoteStream(peerId, e.streams[0]);
  };

  pc.oniceconnectionstatechange = () => {
    const state = pc.iceConnectionState;
    console.log("ICE 狀態：", state);
    if (state === "disconnected" || state === "failed" || state === "closed") {
      channel.publish("call_action", {
        action: "leave",
        from: peerId,
        room: callRoom,
      });
    }
  };

  return pc;
}
