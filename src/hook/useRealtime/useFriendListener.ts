import { useAuthStore } from "@/app/store/AuthStore";
import { FriendInterface } from "@/types/type";
import { InboundMessage } from "ably";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { ablyEventManager } from "@/app/lib/ably/ablyManager";

export const useFriendListener = () => {
  const { setFriendRequest, setFriends } = useAuthStore();
  const userId = useSession().data?.userId;
  useEffect(() => {
    const handleFriendAction = (message: InboundMessage) => {
      const { action, data } = message.data;
      if (action === "request") {
        setFriendRequest((prev) => {
          const isExist = prev.some((request) => request.id === data.id);
          if (isExist) {
            return prev.map((fr) => (fr.id === data.id ? data : fr));
          }
          return [...prev, data];
        });
      } else if (action === "response") {
        setFriendRequest((prev) => {
          const newPrev = prev.map((request) => {
            if (request.id === data.id || data.status !== "accepted") {
              request.status = data.status;
            }
            return request;
          });
          return newPrev.filter((request) => request.status === "pending");
        });
        if (data.status !== "accepted") return;
        const currentFriend = data.friends.find(
          (friend: FriendInterface) => friend.user_id === userId
        );

        setFriends(currentFriend);
      } else if (action === "delete") {
        setFriends((prev) => {
          return prev.filter((f) => f.friend_id !== data);
        });
      }
    };

    ablyEventManager.subscribe("friend_action", handleFriendAction);
    return () => {
      ablyEventManager.unsubscribe("friend_action", handleFriendAction);
    };
  }, [setFriendRequest, userId, setFriends]);
};
