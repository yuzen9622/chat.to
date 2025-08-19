import "cropperjs/dist/cropper.css";

import { createRef } from "react";
import Cropper from "react-cropper";

import { Grow, Modal } from "@mui/material";

import type { Dispatch, SetStateAction } from "react";
import type { ReactCropperElement } from "react-cropper";
type CropProps = {
  open: boolean;
  setImageData: Dispatch<
    SetStateAction<{
      imgUrl: string;
      imgFile: File;
    } | null>
  >;
  originSrc: string;
  setOriginImg: Dispatch<SetStateAction<string | null>>;
  onClose: () => void;
  aspectRatio?: number;
};

export default function CropModal({
  open,
  onClose,
  setImageData,
  originSrc,
  setOriginImg,
  aspectRatio = 1,
}: CropProps) {
  const cropperRef = createRef<ReactCropperElement>();

  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const file = target.files[0];
        const url = URL.createObjectURL(file);
        setOriginImg(url);
        setImageData({ imgUrl: url, imgFile: file });
      }
    });
  };
  const handleCrop = async () => {
    const cropEl = cropperRef.current;
    if (!cropEl) return;
    console.log(cropEl.cropper);

    const url = cropEl.cropper.getCroppedCanvas().toDataURL();
    const res = await fetch(url);
    const blob = await res.blob();

    setImageData((prev) => ({
      imgUrl: url,
      imgFile: new File([blob], prev?.imgFile.name ?? ""),
    }));
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="flex items-center justify-center w-full h-full"
    >
      <Grow in={open}>
        <div className="flex flex-col w-11/12 max-w-2xl gap-4 p-2 rounded-md max-h-[90%] overflow-auto bg-stone-800">
          <h1 className="text-2xl ">裁切</h1>
          <Cropper
            ref={cropperRef}
            className="w-full max-h-[50dvh]"
            aspectRatio={aspectRatio}
            src={originSrc}
            background={false}
            initialAspectRatio={aspectRatio}
            viewMode={1}
            dragMode={"move"}
            minCropBoxHeight={10}
            minCropBoxWidth={10}
            responsive={true}
            autoCropArea={1}
            checkOrientation={false}
            guides={true}
          />
          <div className="flex justify-between ">
            <button
              onClick={handleImageUpload}
              className="p-2 bg-blue-500 rounded-md"
            >
              選擇別張
            </button>
            <button onClick={handleCrop} className="p-2 bg-blue-500 rounded-md">
              裁切
            </button>
          </div>
        </div>
      </Grow>
    </Modal>
  );
}
