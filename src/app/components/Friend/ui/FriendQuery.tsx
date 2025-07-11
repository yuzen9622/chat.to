import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/AuthStore";
import { UserInterface } from "../../../../types/type";
import { useSession } from "next-auth/react";
import { queryUsers } from "@/app/lib/api/user/userApi";
import { sendFriendRequest } from "@/app/lib/api/friend/friendApi";
import { Skeleton } from "@mui/material";
import BadgeAvatar from "@/app/components/ui/Avatar/Avatar";
import { useRouter } from "next/navigation";

function Loading() {
  return (
    <div className="absolute z-20 w-full bg-gray-100 dark:bg-neutral-700 backdrop-blur-2xl rounded-b-md ">
      <span className="flex items-center p-2 rounded-b-md ">
        <Skeleton
          animation={"wave"}
          variant="circular"
          width={40}
          height={40}
        />
        <Skeleton
          animation={"wave"}
          variant="text"
          width={"100%"}
          height={40}
          className="mx-2 dark:text-white"
        />
      </span>
      <span className="flex items-center w-full p-2 rounded-b-md ">
        <Skeleton
          animation={"wave"}
          variant="circular"
          width={40}
          height={40}
        />
        <Skeleton
          animation={"wave"}
          variant="text"
          width={"100%"}
          height={40}
          className="mx-2 dark:text-white"
        />
      </span>
      <span className="flex items-center w-full p-2 rounded-b-md ">
        <Skeleton
          animation={"wave"}
          variant="circular"
          width={40}
          height={40}
        />
        <Skeleton
          animation={"wave"}
          variant="text"
          width={"100%"}
          height={40}
          className="mx-2 dark:text-white"
        />
      </span>
    </div>
  );
}
export default function FriendQuery({ queryValue }: { queryValue: string }) {
  const userId = useSession()?.data?.userId;
  const router = useRouter();
  const { friends, friendRequests } = useAuthStore();
  const [searchFriends, setSearchFriends] = useState<UserInterface[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    const getFriends = async () => {
      if (!userId) return;
      setIsLoading(true);
      const data = await queryUsers(queryValue, userId);
      setSearchFriends(data);
      setIsLoading(false);
    };
    getFriends();
  }, [queryValue, userId]);

  if (!userId || !queryValue) return null;

  if (isLoading) {
    return <Loading />;
  }
  if (searchFriends && searchFriends.length === 0) {
    return (
      <div className="absolute z-20 w-full p-2 bg-gray-100 rounded-b-md dark:bg-neutral-700 backdrop-blur-sm">
        <p className="w-full font-medium text-blue-600 ">
          暫無搜尋結果:{queryValue}
        </p>
      </div>
    );
  }
  return (
    <div className="absolute z-20 w-full p-2 bg-gray-100 rounded-b-md dark:bg-neutral-700 backdrop-blur-sm">
      {searchFriends &&
        searchFriends.map((friend) => (
          <div
            className="flex items-center justify-between my-2"
            key={friend.id}
            onClick={() => router.push(`/profile/${friend.id}`)}
          >
            <div className="flex items-center">
              <BadgeAvatar user={friend} />

              <span className="px-2 text-stone-800 dark:text-white">
                {friend.name}
              </span>
            </div>
            {friends &&
              friendRequests &&
              !friends.find((f) => f.friend_id === friend.id) &&
              !friendRequests.some(
                (request) => request.receiver_id === friend.id
              ) && (
                <div>
                  <button
                    disabled={requestLoading}
                    onClick={async () => {
                      setRequestLoading(true);
                      await sendFriendRequest(friend.id, userId!);
                      setRequestLoading(false);
                    }}
                    className="p-1 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-500 "
                  >
                    發送邀請
                  </button>
                </div>
              )}
            {friends &&
              friendRequests &&
              !friends.some((f) => f.id === friend.id) &&
              friendRequests.some(
                (request) => request.receiver_id === friend.id
              ) && (
                <div>
                  <button className="p-1 text-sm font-bold text-white bg-red-500 rounded-md hover:bg-red-400">
                    取消發送
                  </button>
                </div>
              )}
            {friends && friends.find((f) => f.friend_id === friend.id) && (
              <div className="px-3 py-1 text-sm text-blue-500 bg-white dark:text-white dark:bg-white/10 rounded-3xl">
                已成為好友
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
