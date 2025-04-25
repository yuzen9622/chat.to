"use client";
import {
  FriendRequestInterface,
  MessageInterface,
  MetaData,
  RoomInterface,
} from "./type";
import { useChatStore } from "../store/ChatStore";
import { useEffect, useState } from "react";
import moment from "moment";
import { useAuthStore } from "../store/AuthStore";
import { useAblyStore } from "../store/AblyStore";
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

export function TimeAgo({ date }: { date: string }) {
  const [timeAgo, setTimeAgo] = useState(moment(date).fromNow(false));

  useEffect(() => {
    setTimeAgo(moment(date).fromNow(false));
    const timer = setInterval(() => {
      setTimeAgo(moment(date).fromNow(false));
    }, 60000); // 每分鐘更新一次

    return () => clearInterval(timer);
  }, [date]);

  return timeAgo;
}

export const fetchUserRooms = async () => {
  try {
    const response = await fetch(`/api/rooms`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
};

export const fetchUsersNotify = async (
  userId: string,
  rooms: RoomInterface[]
) => {
  try {
    const roomsId = rooms.map((room) => room.id);

    const response = await fetch(`/api/messages/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, rooms: roomsId }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
};
let abortController: AbortController | null = null;

export const fetchRoomMessage = async (roomId: string) => {
  try {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    abortController = new AbortController();
    const response = await fetch(`/api/messages/${roomId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },

      signal: abortController.signal,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error("Server Error");
    }
    abortController = null;
    return data.data;
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    abortController = null;
  }
};

export const readMessage = async (roomId: string, userId: string | null) => {
  if (!roomId || !userId) return;
  try {
    useChatStore.setState((state) => ({
      notify: state.notify.filter((msg) => msg.room !== roomId),
    }));
    const response = await fetch(`/api/messages/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId, userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark messages as read");
    }

    // useChatStore.setState((state) => ({
    //   currentMessage: state.currentMessage.map((msg) =>
    //     msg.room === roomId ? { ...msg, isRead: true } : msg
    //   ),
    // }));

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error reading messages:", error);
    throw error;
  }
};

export const sendUserMessage = async (message: MessageInterface) => {
  try {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const editUserMessage = async (message: MessageInterface) => {
  try {
    const response = await fetch("/api/messages/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: message.id, text: message.text }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createRoom = async (
  userId: string | null,
  room_name: string,
  room_members: string[] | [],
  room_type?: string,
  room_img?: File
) => {
  try {
    const room_img_url: string = await uploadFile(room_img!);

    const response = await fetch("/api/rooms/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_name,
        userId,
        room_type: room_type || "personal",
        room_members,
        room_img: room_img_url || null,
      }),
    });

    const data = await response.json();
    useChatStore.setState((state) => ({
      rooms: [...state.rooms, data[0]],
    }));
    return data[0];
  } catch (error) {
    console.log(error);
  }
};

export const joinRoom = async (room_id: string, users_id: Array<string>) => {
  try {
    const { rooms } = useChatStore.getState();
    const room = rooms.find((room) => room.id === room_id);
    if (room?.room_members.some((m) => users_id.includes(m.user_id)))
      return room;
    const response = await fetch("/api/rooms/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_id,
        users_id,
      }),
    });

    const data = await response.json();
    if (room) return data.rooms;
    useChatStore.setState((state) => ({
      rooms: [...state.rooms, data.rooms],
    }));
    return data.rooms;
  } catch (error) {
    console.log(error);
  }
};

export const fetchUserFriends = async (userId: string) => {
  try {
    const response = await fetch("/api/friends", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    }
    throw data.error;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchFriendRequests = async (userId: string) => {
  try {
    const response = await fetch("/api/friends/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const queryFriend = async (query: string, userId: string) => {
  try {
    if (!query) return null;
    const response = await fetch("/api/friends/q", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        userId,
        query,
      }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const cancelFriendRequest = async (
  friendRequest: FriendRequestInterface
) => {
  try {
    const { channel } = useAblyStore.getState();
    const response = await fetch("/api/friends/request/cancel", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: friendRequest.id }),
    });
    const data = await response.json();
    if (data.success && channel) {
      await channel.publish("friend_action", {
        action: "request",
        data: { ...friendRequest, status: "canceled" },
      });
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const sendFriendRequest = async (
  receiver_id: string,
  sender_id: string
) => {
  const { channel } = useAblyStore.getState();
  try {
    if (!channel) throw "Ably error";

    const response = await fetch("/api/friends/request/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiver_id,
        sender_id,
      }),
    });
    if (!response.ok) {
      throw "Network error";
    }

    const data = await response.json();

    useAuthStore.setState((state) => {
      if (!state.friendRequests) return state;
      return { ...state, friendRequests: [...state.friendRequests, data] };
    });
    channel.publish("friend_action", { action: "request", data });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const responseFriendRequest = async (id: string, status: string) => {
  try {
    const { channel } = useAblyStore.getState();
    if (!channel) return "Ably Error";

    const response = await fetch("/api/friends/response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        status,
      }),
    });
    const data = await response.json();
    await channel.publish("friend_action", {
      action: "response",
      data: { id, status, friends: data },
    });
  } catch (error) {
    throw error;
  }
};

export async function uploadFile(file: File) {
  try {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

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
export const replyText = (reply: MessageInterface) => {
  if (!reply) return "";
  if (messageType(reply.meta_data!) === "audio") return "語音";
  if (messageType(reply.meta_data!) === "image") return "圖片";
  if (messageType(reply.meta_data!) === "file") return "檔案";
  if (messageType(reply.meta_data!) === "video") return "影片";
  return reply.text;
};
export const deleteMessage = async (messageId: string) => {
  try {
    const response = await fetch("/api/messages/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: messageId,
      }),
    });
    if (!response.ok) {
      throw new Error("Network not ok.");
    }
    useChatStore.setState((state) => ({
      ...state,
      currentMessage: state.currentMessage.filter(
        (msg) => msg.id !== messageId
      ),
    }));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
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

  rooms.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  setRoom((prev) => {
    const newPrev = prev.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return newPrev;
  });
};

export const getFileIcon = (mimeType: string) => {
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
