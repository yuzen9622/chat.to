import { formatSize, getFileIcon } from "@/app/lib/util";
import { LucideIcon, X } from "lucide-react";
import Image from "next/image";
import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";

export function FileItem({
  file,
  handleRemove,
}: {
  file: File;
  handleRemove: (lastModified: number) => void;
}) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  const type = useMemo(() => file.type.split("/")[0], [file]);
  const Icon: LucideIcon = getFileIcon(file.name);
  return (
    <div className="relative w-fit animate-in zoom-in-0 ">
      {type === "image" && (
        <Image
          className="object-cover w-full h-full rounded-2xl max-w-24 max-h-24"
          alt={file.name}
          width={100}
          height={100}
          src={url}
        />
      )}
      {type === "video" && (
        <video className=" rounded-2xl max-w-24 max-h-24" src={url}></video>
      )}
      {type !== "video" && type != "image" && (
        <div
          title={file.name}
          className={twMerge(
            "flex items-center p-2 px-3 rounded-3xl w-fit dark:text-white bg-gray-500/20 gap-x-1 dark:bg-stone-800",
            "dark:bg-blue-500 bg-blue-500 text-white"
          )}
        >
          <div className="flex flex-col items-center justify-center w-fit">
            <span className="flex flex-col items-center p-2 rounded-full bg-white/5">
              <Icon />
            </span>
            <p className="text-xs ">
              {file.name.split(".")[file.name.split(".").length - 1]}
            </p>
          </div>
          <span className="w-fit max-w-40">
            <p className="text-sm break-all text-start w-fit">{file.name}</p>
            <span className="flex items-center justify-between w-full gap-1 mt-1 text-xs text-nowrap">
              <p>大小:{formatSize(file.size)}</p>
            </span>
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => handleRemove(file.lastModified)}
        className="absolute p-1 text-xs rounded-full -top-1 -right-1 dark:bg-stone-900 dark:text-white bg-stone-200"
      >
        <X size={12} />
      </button>
    </div>
  );
}
