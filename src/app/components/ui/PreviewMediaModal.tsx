import Modal from "@mui/material/Modal";
import { Download, X } from "lucide-react";
import { CldImage, CldVideoPlayer } from "next-cloudinary";
import React from "react";

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
  return (
    <Modal
      className="flex items-center justify-center w-full h-full "
      open={open}
      onClose={onClose}
    >
      <div className="  max-h-[90%] rounded-md  max-w-5xl w-10/12 overflow-auto">
        {media &&
          (media.type === "image" ? (
            <div className="w-full p-2 overflow-auto h-5/6 aspect-auto">
              <div className="flex justify-end">
                <button className="p-1 rounded-sm hover:bg-white/5">
                  <Download className="dark:text-white " />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-white/5"
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
            <div className=" w-10/12  max-w-[1024px] max-h-[90dvh] overflow-auto p-2 rounded-md">
              <div className="flex justify-end">
                <button className="p-1 rounded-lg hover:bg-white/5">
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
