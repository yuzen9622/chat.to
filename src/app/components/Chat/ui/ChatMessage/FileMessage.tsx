import { memo } from 'react';
import { twMerge } from 'tailwind-merge';

import { formatSize, getFileIcon, handleDownload } from '@/app/lib/util';

import type { ClientMessageInterface } from "@/types/type";
import type { LucideIcon } from "lucide-react";
const FileMessage = memo(function FileMessage({
  message,
  isOwn,
}: {
  message: ClientMessageInterface;
  isOwn: boolean;
}) {
  const metaData = message.meta_data;
  if (!metaData) return null;
  const Icon: LucideIcon = getFileIcon(message.text);
  return (
    <button
      title={message.text}
      onClick={() => handleDownload(metaData.url, message.text)}
      className={twMerge(
        "flex items-center p-2 px-3 rounded-3xl dark:text-white bg-gray-500/20 gap-x-1 dark:bg-stone-700/70",
        isOwn && "dark:bg-blue-500 bg-blue-500 text-white"
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <span className="flex flex-col items-center p-2 rounded-full bg-white/5">
          <Icon />
        </span>
        <p className="text-xs">
          {message.text.split(".")[message.text.split(".").length - 1]}
        </p>
      </div>
      <span className="w-full max-w-40">
        <p className="text-sm break-all text-start">{message.text}</p>
        <span className="flex items-center justify-between w-full gap-1 mt-1 text-xs">
          <p>大小:{formatSize(metaData.size)}</p>
          <p>點擊下載</p>
        </span>
      </span>
    </button>
  );
});
export default FileMessage;
