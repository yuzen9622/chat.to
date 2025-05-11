import Modal from "@mui/material/Modal";
import { Download, X } from "lucide-react";
import { CldImage, CldVideoPlayer } from "next-cloudinary";
import React, { useCallback } from "react";

type previewParams = {
  media?: { alt: string; url: string; type: string };
  open: boolean;
  onClose: () => void;
};

export default function PreviewMediaModal({
  media,
  open,
  onClose,
}: previewParams) {
  const handleDownload = useCallback(async () => {
    try {
      if (!media) return;
      const a = document.createElement("a");
      a.target = "_BLANK";

      const res = await fetch(media.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = media.alt;
      a.click();
    } catch (error) {
      console.log(error);
    }
  }, [media]);
  return (
    <Modal
      className="flex items-center justify-center w-full h-full dark:bg-white/10 backdrop-blur-xl "
      open={open}
      onClose={onClose}
    >
      <div className="  max-h-[90%] rounded-md  max-w-5xl w-10/12 overflow-auto">
        {media &&
          (media.type === "image" ? (
            <div className="w-full max-w-[1024px] max-h-[90dvh] p-2 overflow-auto h-5/6 aspect-auto">
              <div className="flex justify-end gap-2 m-2">
                <button
                  onClick={handleDownload}
                  className="p-1 rounded-lg dark:bg-stone-800"
                >
                  <Download className="dark:text-white " />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg dark:bg-stone-800"
                >
                  <X className="dark:text-white " />
                </button>
              </div>

              <CldImage
                className={"w-full h-full rounded-md  object-contain"}
                src={media.url}
                width={400}
                zoom="0.5"
                height={400}
                alt={media.alt}
                title={media.alt}
              />
            </div>
          ) : (
            <div className=" w-full  max-w-[1024px] max-h-[90dvh] overflow-auto p-2 rounded-md">
              <div className="flex justify-end">
                <button
                  onClick={handleDownload}
                  className="p-1 rounded-lg hover:bg-white/5"
                >
                  <Download className="dark:text-white " />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-white/5"
                >
                  <X className="dark:text-white " />
                </button>
              </div>
              <CldVideoPlayer
                className="w-full h-full rounded-md "
                src={media.url}
                width={2480}
              />
            </div>
          ))}
      </div>
    </Modal>
  );
}
