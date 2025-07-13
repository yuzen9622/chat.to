import { useChatStore } from "@/app/store/ChatStore";
import { ClientMessageInterface, Forward } from "@/types/type";

export const readMessage = async (roomId: string, userId: string | null) => {
  if (!roomId || !userId) return;
  try {
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error reading messages:", error);
    throw error;
  }
};

export const sendUserMessage = async (
  message: ClientMessageInterface
): Promise<ClientMessageInterface> => {
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

export const editUserMessage = async (
  message: ClientMessageInterface
): Promise<ClientMessageInterface> => {
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

export const forwardMessage = async (
  targets: Forward[],
  message: ClientMessageInterface
): Promise<ClientMessageInterface[]> => {
  try {
    const res = await fetch("/api/messages/forward", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, targets }),
    });
    const data = await res.json();
    if (!data.success) {
      throw data.error;
    }
    return data.messages as ClientMessageInterface[];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchRoomMessage = async (
  roomId: string,
  start: number,
  end: number
): Promise<ClientMessageInterface[]> => {
  try {
    const response = await fetch(
      `/api/messages/${roomId}?start=${start}&end=${end}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error("Server Error");
    }

    return data.data;
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
  }
};
