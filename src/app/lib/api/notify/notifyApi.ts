import { RoomInterface } from "@/types/type";

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
