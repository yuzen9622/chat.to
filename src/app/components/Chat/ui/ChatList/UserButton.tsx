import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import BadgeAvatar from '@/app/components/ui/Avatar/Avatar';

import type { FriendInterface } from "@/types/type";

interface Props {
  friend: FriendInterface;
  handleRoomMember: (userId: string) => void;
  roomMembers: string[];
}

export default function UserButton({
  handleRoomMember,
  roomMembers,
  friend,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => handleRoomMember(friend.friend_id)}
      className={twMerge(
        " relative flex flex-col items-center dark:text-white max-w-20 min-w-fit "
      )}
    >
      <span className="relative ">
        {roomMembers.includes(friend.friend_id) && (
          <div className="absolute z-20 p-1 bg-blue-500 rounded-full -right-1 animate-in zoom-in-0">
            <Check size={15} />
          </div>
        )}

        <BadgeAvatar width={55} height={55} user={friend.user} />
      </span>

      <p className="truncate">{friend.user.name}</p>
    </button>
  );
}
