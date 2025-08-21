import type { UserImageData } from "@/types/type";
import { useCallback, useState } from "react";

export const useImageUpload = () => {
  const [cropOpen, setCropOpen] = useState(false);
  const [imageData, setImageData] = useState<UserImageData | null>(null);
  const [originImg, setOriginImg] = useState<string | null>(null);

  const handleCropClose = useCallback(() => {
    setCropOpen(false);
  }, []);

  const handleImageUpload = useCallback(() => {
    if (originImg) {
      setCropOpen(true);
      return;
    }
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

        setCropOpen(true);
      }
    });
  }, [originImg]);

  return {
    handleImageUpload,
    cropOpen,
    handleCropClose,
    originImg,
    imageData,
    setOriginImg,
    setImageData,
  };
};
