import { useChatStore } from "@/app/store/ChatStore";

import { uploadFile } from "../../util";

import type { RoomInterface, RoomTheme } from "@/types/type";
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

export const createRoom = async (
  userId: string | null,
  room_name: string,
  room_members: string[] | [],
  room_type?: string,
  room_img?: File
): Promise<RoomInterface | null> => {
  try {
    let roomImageInfo = {};
    if (!userId) return null;
    if (room_img) {
      const roomImage = await uploadFile([room_img]);
      if (roomImage) {
        roomImageInfo = roomImage[0];
      }
    }

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
        room_img: roomImageInfo || null,
      }),
    });

    const data = await response.json();
    console.log(data);

    useChatStore.setState((state) => ({
      rooms: [...state.rooms, data],
    }));
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getPersonalRoom = async (
  id: string,
  userId: string,
  friendId: string
): Promise<RoomInterface> => {
  try {
    const data = fetch("/api/rooms/personal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId: id,
        userId,
        friendId,
        room_type: "personal",
      }),
    });
    const res = (await data).json();
    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const joinRoom = async (
  room: RoomInterface,
  users_id: Array<string>
): Promise<RoomInterface | null> => {
  try {
    if (users_id.length === 0) return null;

    if (room.room_members.some((m) => users_id.includes(m.user_id))) {
      return room;
    }

    const response = await fetch("/api/rooms/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_id: room.id,
        users_id,
        room_type: room.room_type,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error("Join failed");
    }

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const quitRoom = async (
  room_id: string,
  user_id: string,
  room_type: string
) => {
  try {
    const res = await fetch("/api/rooms/quit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id,
        room_id,
        room_type,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error("Delete room failed");
    }
    return data.success;
  } catch (error) {
    console.log(error);
  }
};

export const deleteRoom = async (
  room_id: string,
  user_id: string,
  room_type: string
) => {
  try {
    const res = await fetch("/api/rooms/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id,
        room_id,
        room_type,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error("Delete room failed");
    }
    return data.success;
  } catch (error) {
    console.log(error);
  }
};

export const updateRoomTheme = async (
  roomId: string,
  roomTheme: RoomTheme | null
) => {
  try {
    const res = await fetch("/api/rooms/theme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId,
        roomTheme: roomTheme,
      }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
