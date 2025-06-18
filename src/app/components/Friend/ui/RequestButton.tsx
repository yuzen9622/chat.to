import React, { useCallback, useState } from "react";
import { FriendRequestInterface, friendStatus } from "@/types/type";
import { useUserProfile } from "@/hook/useUserProfile";
import { useSession } from "next-auth/react";
import { Skeleton } from "@mui/material";
import { cancelFriendRequest, responseFriendRequest } from "@/app/lib/util";
import { twMerge } from "tailwind-merge";
import CircularProgress from "@mui/material/CircularProgress";
export default function RequestButton({
  friend,
}: {
  friend: FriendRequestInterface;
}) {
  const receiver = useUserProfile(friend.receiver_id);
  const sender = useUserProfile(friend.sender_id);
  const [isLoading, setIsloading] = useState(false);
  const { data: session } = useSession();
  const userId = session?.userId;
  const handleClick = useCallback(
    async (friendId: string, status: friendStatus) => {
      setIsloading(true);
      try {
        await responseFriendRequest(friendId, status);
      } catch (error) {
        console.log(error);
      } finally {
        setIsloading(false);
      }
    },
    []
  );
  return (
    <>
      {receiver && sender ? (
        <div
          className={twMerge(
            " relative flex items-center justify-between w-full p-2 my-1 rounded-md opacity-0 bg-stone-800/5 dark:bg-white/5 animate-slide-in transition-colors",
            isLoading && " pointer-events-none   select-none "
          )}
        >
          {isLoading && (
            <div className="fixed flex items-center justify-center w-full ">
              <CircularProgress
                size={25}
                color="inherit"
                className="dark:text-white"
              />
            </div>
          )}

          {friend.receiver_id === userId && (
            <>
              <span className="text-sm">{sender.name} 發送給你的朋友請求</span>
              <span className="flex flex-nowrap">
                <button
                  onClick={() => handleClick(friend.id, "accepted")}
                  className="px-2 py-1 mx-1 font-bold bg-gray-200 rounded-md whitespace-nowrap dark:bg-white/10"
                >
                  接受
                </button>
                <button
                  onClick={() => handleClick(friend.id, "declined")}
                  className="px-2 py-1 mx-1 font-bold text-white bg-red-500 rounded-md whitespace-nowrap hover:bg-red-400 "
                >
                  拒絕
                </button>
              </span>
            </>
          )}
          {friend.receiver_id !== userId && (
            <>
              <span className="text-sm">
                你發送給 {receiver.name} 的朋友邀請
              </span>
              <span className="flex flex-nowrap">
                <button
                  onClick={() => cancelFriendRequest(friend)}
                  className="px-2 py-1 mx-1 font-bold text-white bg-red-500 rounded-md whitespace-nowrap hover:bg-red-400 "
                >
                  取消發送
                </button>
              </span>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between w-full p-2 rounded-md h-9 bg-white/5">
          <Skeleton className="w-1/2 " variant="rounded" height={15} />
        </div>
      )}
    </>
  );
}
