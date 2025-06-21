import { Popover } from "@mui/material";
import React from "react";
import ProfileCard from "../Profile/ui/ProfileCard";
import { UserInterface } from "@/types/type";
import { useRouter } from "next/navigation";

export default function UserPopbox({
  user,
  anchorEl,
  handleClose,
}: {
  user: UserInterface;
  anchorEl: null | HTMLElement;
  handleClose: () => void;
}) {
  const open = Boolean(anchorEl);
  const router = useRouter();
  return (
    <div>
      <Popover
        anchorEl={anchorEl}
        onClose={handleClose}
        open={open}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        className="w-full p-0 space-x-3"
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
            padding: "2px",
          },
        }}
      >
        <div className="p-2 space-y-4 rounded-lg shadow-md bg-stone-100 dark:bg-stone-800">
          <ProfileCard user={user} />
          <button
            onClick={() => router.push(`/profile/${user.id}`)}
            className="w-full px-3 py-1 font-bold text-blue-500 bg-white rounded-md dark:text-white dark:bg-white/10 "
          >
            查看對方主頁
          </button>
        </div>
      </Popover>
    </div>
  );
}
