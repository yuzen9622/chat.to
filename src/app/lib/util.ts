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

// 請求函式 making fetch data function

// export const getAllUserById = async (userIds: string[]) => {
//   try {
//     const res = await fetch("/api/users", {
//       method: "post",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId: userIds }),
//     });
//     const data = await res.json();
//     if (!res.ok) {
//       throw data.error;
//     }
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const fetchUserRooms = async () => {
//   try {
//     const response = await fetch(`/api/rooms`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching rooms:", error);
//     throw error;
//   }
// };

// export const fetchUsersNotify = async (
//   userId: string,
//   rooms: RoomInterface[]
// ) => {
//   try {
//     const roomsId = rooms.map((room) => room.id);

//     const response = await fetch(`/api/messages/notify`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ userId, rooms: roomsId }),
//     });

//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching rooms:", error);
//     throw error;
//   }
// };

// export const fetchRoomMessage = async (
//   roomId: string,
//   start: number,
//   end: number
// ) => {
//   try {
//     const response = await fetch(
//       `/api/messages/${roomId}?start=${start}&end=${end}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error("Server Error");
//     }

//     return data.data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   } finally {
//   }
// };

// export const readMessage = async (roomId: string, userId: string | null) => {
//   if (!roomId || !userId) return;
//   try {
//     const response = await fetch(`/api/messages/read`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ roomId, userId }),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to mark messages as read");
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error reading messages:", error);
//     throw error;
//   }
// };

// export const sendUserMessage = async (message: ClientMessageInterface) => {
//   try {
//     const response = await fetch("/api/messages", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(message),
//     });
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// export const editUserMessage = async (message: ClientMessageInterface) => {
//   try {
//     const response = await fetch("/api/messages/edit", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ id: message.id, text: message.text }),
//     });
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// export const createRoom = async (
//   userId: string | null,
//   room_name: string,
//   room_members: string[] | [],
//   room_type?: string,
//   room_img?: File
// ) => {
//   try {
//     let roomImageUrl;
//     if (room_img) {
//       const roomImage = await uploadFile([room_img]);
//       if (roomImage) {
//         roomImageUrl = roomImage[0].url;
//       }
//     }

//     const response = await fetch("/api/rooms/create/", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         room_name,
//         userId,
//         room_type: room_type || "personal",
//         room_members,
//         room_img: roomImageUrl || null,
//       }),
//     });

//     const data = await response.json();
//     console.log(data);

//     useChatStore.setState((state) => ({
//       rooms: [...state.rooms, data],
//     }));
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const getPersonalRoom = async (
//   id: string,
//   userId: string,
//   friendId: string
// ): Promise<RoomInterface> => {
//   try {
//     const data = fetch("/api/rooms/personal", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         roomId: id,
//         userId,
//         friendId,
//         room_type: "personal",
//       }),
//     });
//     const res = (await data).json();
//     return res;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// export const joinRoom = async (room_id: string, users_id: Array<string>) => {
//   try {
//     const { rooms } = useChatStore.getState();
//     if (users_id.length === 0) return;

//     const room = rooms.find((room) => room.id === room_id);
//     if (room?.room_members.some((m) => users_id.includes(m.user_id)) || room) {
//       return room;
//     }

//     const response = await fetch("/api/rooms/join", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         room_id,
//         users_id,
//       }),
//     });

//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error("Join failed");
//     }

//     useChatStore.setState((state) => ({
//       rooms: [...state.rooms, data],
//     }));
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const deleteRoom = async (
//   room_id: string,
//   user_id: string,
//   room_type: string
// ) => {
//   try {
//     const res = await fetch("/api/rooms/delete", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         user_id,
//         room_id,
//         room_type,
//       }),
//     });
//     const data = await res.json();
//     if (!data.success) {
//       throw new Error("Delete room failed");
//     }
//     return data.success;
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const fetchUserFriends = async (userId: string) => {
//   try {
//     const response = await fetch(`/api/friends`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         userId,
//       }),
//     });
//     const data = await response.json();
//     if (response.ok) {
//       return data;
//     }
//     throw data.error;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// export const fetchFriendRequests = async (userId: string) => {
//   try {
//     const response = await fetch("/api/friends/request", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         userId,
//       }),
//     });
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// export const queryFriend = async (query: string, userId: string) => {
//   try {
//     if (!query) return null;
//     const response = await fetch("/api/friends/q", {
//       headers: { "Content-Type": "application/json" },
//       method: "POST",
//       body: JSON.stringify({
//         userId,
//         query,
//       }),
//     });
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const cancelFriendRequest = async (
//   friendRequest: FriendRequestInterface
// ) => {
//   try {
//     const { channel } = useAblyStore.getState();
//     const response = await fetch("/api/friends/request/cancel", {
//       method: "post",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ id: friendRequest.id }),
//     });
//     const data = await response.json();
//     if (data.success && channel) {
//       await channel.publish("friend_action", {
//         action: "request",
//         data: { ...friendRequest, status: "canceled" },
//       });
//       return true;
//     }
//     return false;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// export const sendFriendRequest = async (
//   receiver_id: string,
//   sender_id: string
// ) => {
//   const { channel } = useAblyStore.getState();
//   try {
//     if (!channel) throw "Ably error";

//     const response = await fetch("/api/friends/request/send", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         receiver_id,
//         sender_id,
//       }),
//     });
//     if (!response.ok) {
//       throw "Network error";
//     }

//     const data = await response.json();

//     useAuthStore.setState((state) => {
//       if (!state.friendRequests) return state;
//       return { ...state, friendRequests: [...state.friendRequests, data] };
//     });
//     channel.publish("friend_action", { action: "request", data });
//     return data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// export const responseFriendRequest = async (id: string, status: string) => {
//   try {
//     const { channel } = useAblyStore.getState();
//     if (!channel) return "Ably Error";

//     const response = await fetch("/api/friends/response", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         id,
//         status,
//       }),
//     });
//     const data = await response.json();

//     await channel.publish("friend_action", {
//       action: "response",
//       data: { id, status, friends: data },
//     });
//   } catch (error) {
//     throw error;
//   }
// };

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

// export const deleteMessage = async (messageId: string) => {
//   try {
//     const response = await fetch("/api/messages/delete", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         id: messageId,
//       }),
//     });
//     if (!response.ok) {
//       throw new Error("Network not ok.");
//     }
//     useChatStore.setState((state) => ({
//       ...state,
//       currentMessage: state.currentMessage.filter(
//         (msg) => msg.id !== messageId
//       ),
//     }));
//     return true;
//   } catch (error) {
//     console.log(error);
//     return false;
//   }
// };

// export const fetchFriendNote = async (userIds: string[]) => {
//   try {
//     // const userIds = friends.map((f) => f.user.id);
//     const response = await fetch("/api/note", {
//       method: "post",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ ids: userIds }),
//     });
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     throw error;
//   }
// };

//功能函式 nornal function

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
