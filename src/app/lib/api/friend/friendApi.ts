import { useAblyStore } from "@/app/store/AblyStore";
import { useAuthStore } from "@/app/store/AuthStore";
import { FriendRequestInterface } from "@/types/type";

export const fetchUserFriends = async (userId: string) => {
  try {
    const response = await fetch(`/api/friends`, {
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
