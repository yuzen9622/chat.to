import { UserPlus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import BadgeAvatar from '@/app/components/ui/Avatar/Avatar';
import { useAuthStore } from '@/app/store/AuthStore';
import { Modal } from '@mui/material';

import { useChatAction } from './hook/useChatAction';

import type { RoomInterface } from "@/types/type";
export default function JoinUserModal({
  currentChat,
}: {
  currentChat: RoomInterface;
}) {
  const [joinOpen, setJoinOpen] = useState(false);
  const [roomMembers, setRoomMembers] = useState<string[]>([]);
  const { friends } = useAuthStore();

  const { handleJoin } = useChatAction();
  const handleRoomMember = useCallback(
    (userId: string) => {
      if (currentChat?.room_members.some((rm) => rm.user_id === userId)) return;
      if (roomMembers.includes(userId)) {
        setRoomMembers((prev) => {
          return prev.filter((m) => m !== userId);
        });
      } else {
        setRoomMembers((prev) => [...prev, userId]);
      }
    },
    [currentChat, roomMembers]
  );

  return (
    <>
      <button
        title="新增"
        onClick={() => setJoinOpen(true)}
        className="flex flex-col justify-center p-1 rounded-md dark:text-white hover:bg-white/10"
      >
        <UserPlus />
      </button>

      <Modal
        open={joinOpen}
        onClose={() => {
          setJoinOpen(false);
          setRoomMembers([]);
        }}
      >
        <div className="absolute w-11/12  max-w-[500px] p-4 max-h-full h-4/6 overflow-auto  transform -translate-x-1/2 -translate-y-1/2 bg-stone-900 rounded-md top-1/2 left-1/2  ">
          <button className="w-full p-2 my-2 text-sm font-bold text-white rounded-md bg-white/5 hover:bg-white/10 ">
            複製邀請碼
          </button>
          <div className="relative flex items-center text-sm justify-center w-full p-2 text-center text-white/20 before:absolute before:w-[43%] before:h-[1px] before:left-0 before:bg-white/20 after:absolute after:w-[43%] after:h-[1px] after:right-0 after:bg-white/20">
            OR
          </div>
          <div className="w-full py-2 ">
            <p className="text-white">邀請好友</p>
            <div className="flex flex-col items-center w-full max-w-full gap-2 overflow-auto">
              {friends?.map((friend) => {
                return (
                  <button
                    key={friend.id}
                    disabled={currentChat.room_members.some(
                      (rm) => rm.user_id === friend.user.id
                    )}
                    type="button"
                    onClick={() => handleRoomMember(friend.user.id)}
                    className={twMerge(
                      " relative flex  items-center disabled:text-white/40  gap-2 w-full text-white  min-w-fit after:content-[''] after:text-xs after:absolute after:w-4 after:h-4 after:border after:bottom-6 after:right-2 after:rounded-full",
                      roomMembers.includes(friend.user.id) &&
                        "after:content-['✔'] after:text-xs after:absolute after:w-4 after:border-0 after:h-4 after:bottom-6 after:right-2 after:rounded-full after:animate-in after:zoom-in-0 after:bg-blue-500"
                    )}
                  >
                    <BadgeAvatar width={55} height={55} user={friend.user} />
                    <p className="truncate">{friend.user.name}</p>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => handleJoin(roomMembers)}
              className={twMerge(
                "flex items-center p-2 justify-center mt-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-400 "
              )}
            >
              <p>新增</p>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
