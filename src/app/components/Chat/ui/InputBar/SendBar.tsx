import { useAuthStore } from "@/app/store/AuthStore";
import { useFile } from "@/hook/useFile";
import { Popover } from "@mui/material";
import { CirclePlus, Paperclip } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";

export function SendBar({
  setMessageFiles,
}: {
  setMessageFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { handleFile } = useFile();
  const { setSystemAlert } = useAuthStore();
  const barOpen = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  return (
    <div>
      <button
        type="button"
        onClick={handleOpen}
        className={twMerge("p-1 h-fit transition-all", barOpen && " rotate-45")}
      >
        <CirclePlus className="text-gray-400 hover:dark:text-white" />
      </button>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
            padding: "2px",
          },
        }}
        onClose={handleClose}
        open={barOpen}
      >
        <div className="flex flex-col p-1 bg-white rounded-md shadow-md dark:bg-neutral-800 animate-in fade-in slide-in-from-top-1">
          <button
            type="button"
            onClick={async () => {
              const { getFiles, error } = await handleFile("*");
              setMessageFiles((prev) => [...getFiles, ...prev]);
              if (error !== "") {
                setSystemAlert({
                  open: true,
                  severity: "error",
                  text: "請檢查檔案，檔案大小不得超過10MB",
                  variant: "filled",
                });
              }
            }}
            className="flex items-center w-full gap-2 p-2 text-sm font-bold rounded-md dark:text-white hover:bg-stone-900/10 hover:dark:bg-white/10"
          >
            <Paperclip className="mr-2" size={20} />
            檔案
          </button>
        </div>
      </Popover>
    </div>
  );
}
