import { Mic } from 'lucide-react';

import { useAuthStore } from '@/app/store/AuthStore';
import { useFile } from '@/hook/useFile';

export default function MediaActions({
  setMessageFiles,
  setIsRecording,
}: {
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  setMessageFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const { handleFile } = useFile();
  const { setSystemAlert } = useAuthStore();

  return (
    <div className="flex animate-in zoom-in">
      <button
        type="button"
        onClick={async () => {
          const { getFiles, error } = await handleFile("image/*,video/*");
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
        className="p-1 dark:text-white "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-image"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </button>
      <button
        onClick={() => setIsRecording(true)}
        className="p-1 dark:text-white "
      >
        <Mic />
      </button>
    </div>
  );
}
