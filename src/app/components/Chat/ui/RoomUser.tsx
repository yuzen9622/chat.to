import React from "react";
import BadgeAvatar from "../../ui/Avatar/Avatar";
import { RoomMemberInterface } from "@/types/type";
import { usePopbox } from "@/hook/usePopbox";
import UserPopbox from "../../ui/UserPopbox";
import moment from "moment";
import { useSession } from "next-auth/react";

export default function RoomUser({ member }: { member: RoomMemberInterface }) {
  const { anchorEl, handleClose, handleOpen } = usePopbox();
  const userId = useSession()?.data?.userId;
  return (
    <>
      <button
        className="flex flex-row items-center gap-4 p-2 rounded-md hover:dark:bg-white/10"
        onClick={handleOpen}
      >
        <BadgeAvatar user={member.user_id} />
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
