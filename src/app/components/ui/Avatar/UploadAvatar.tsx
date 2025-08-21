import { Camera, Trash } from "lucide-react";
import Image from "next/image";

import { useImageUpload } from "@/hook/useImageUpload";

import CropModal from "../Modal/CropModal";

import type { UserImageData } from "@/types/type";
type UploadAvatarProps = {
  src: string | undefined;

  setUserImage: React.Dispatch<React.SetStateAction<UserImageData | null>>;
  userImage: UserImageData | null;
};

export default function UploadAvatar({
  src,
  setUserImage,
  userImage,
}: UploadAvatarProps) {
  const {
    cropOpen,
    handleCropClose,
    handleImageUpload,
    originImg,
    setOriginImg,
  } = useImageUpload();

  const handleCrop = (imageData: UserImageData) => {
    setUserImage(imageData);
  };

  return (
    <div className="flex items-center justify-center ">
      <CropModal
        setOriginImg={setOriginImg}
        open={cropOpen}
        onClose={handleCropClose}
        setImageData={setUserImage}
        onCrop={handleCrop}
        originSrc={originImg || "/user.png"}
      />
      <span className="relative">
        <Image
          width={80}
          onClick={handleImageUpload}
          height={80}
          className="object-cover w-20 h-20 rounded-full cursor-pointer"
          src={src || "/user.png"}
          alt="img"
        />

        <button
          type="button"
          onClick={() => {
            if (userImage) {
              setUserImage(null);
            } else {
              handleImageUpload();
            }
          }}
          className="absolute right-0 p-1 rounded-full -bottom-1 bg-stone-800/10 text-stone-400 dark:text-white/50 dark:bg-stone-800"
        >
          {userImage ? <Trash size={20} /> : <Camera size={20} />}
        </button>
      </span>
    </div>
  );
}
