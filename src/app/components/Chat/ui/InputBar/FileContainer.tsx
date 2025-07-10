import { CloudUpload } from "lucide-react";
import React, { useCallback } from "react";
import { FileItem } from "./FileItem";
import { useFile } from "@/hook/useFile";
import { useAuthStore } from "@/app/store/AuthStore";

export default function FileContainer({
  messageFiles,
  setMessageFiles,
}: {
  messageFiles: File[];
  setMessageFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const { handleFile } = useFile();
  const { setSystemAlert } = useAuthStore();

  const removeFile = useCallback(
    (lastModified: number) => {
      setMessageFiles((prev) => {
        return prev.filter((file) => file.lastModified !== lastModified);
      });
    },
    [setMessageFiles]
  );

  return (
    <div className="flex gap-2 p-2 overflow-auto">
      <div>
        <button
          className="flex flex-col items-center justify-center h-full p-2 text-xs text-white bg-blue-500 rounded-2xl w-fit text-nowrap"
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
          type="button"
        >
          上傳檔案或照片
          <span className="p-1 rounded-full bg-white/10">
            <CloudUpload />
          </span>
        </button>
      </div>

      {messageFiles.map((file, index) => (
        <FileItem handleRemove={removeFile} file={file} key={index} />
      ))}
    </div>
  );
}
