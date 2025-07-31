import moment from 'moment';
import { useSession } from 'next-auth/react';

import BadgeAvatar from '@/app/components/ui/Avatar/Avatar';
import UserPopbox from '@/app/components/ui/UserPopbox';
import { usePopbox } from '@/hook/usePopbox';

import type { RoomMemberInterface } from "@/types/type";

export default function RoomUserItem({
  member,
}: {
  member: RoomMemberInterface;
}) {
  const { anchorEl, handleClose, handleOpen } = usePopbox();
  const userId = useSession()?.data?.userId;
  return (
    <>
      <button
        className="flex flex-row items-center gap-4 p-2 rounded-md hover:dark:bg-white/10"
        onClick={handleOpen}
      >
        <BadgeAvatar user={member.user} />
        <span className="text-start">
          <p>{userId === member.user_id ? "你" : member.user?.name}</p>
          <p className="text-xs dark:text-white/40">
            加入日期:
            {member?.created_at && moment(member.created_at).format("LL")}
          </p>
        </span>
      </button>
      <UserPopbox
        handleClose={handleClose}
        user={member.user}
        anchorEl={anchorEl}
      />
    </>
  );
}
