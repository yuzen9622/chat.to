import { Camera, Trash } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

import CropModal from "../Modal/CropModal";

type UploadAvatarProps = {
  src: string | undefined;

  setUserImage: React.Dispatch<
    React.SetStateAction<{
      imgUrl: string;
      imgFile: File;
    } | null>
  >;
  userImage: {
    imgUrl: string;
    imgFile: File;
  } | null;
};

export default function UploadAvatar({
  src,
  setUserImage,
  userImage,
}: UploadAvatarProps) {
  const [open, setOpen] = useState(false);
  const [originImg, setOriginImg] = useState<string | null>(null);

  const handleImageUpload = useCallback(async () => {
    if (userImage) {
      setOpen(true);
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

        setUserImage({ imgUrl: url, imgFile: file });
        setOpen(true);
      }
    });
  }, [userImage, setUserImage]);

  return (
    <div className="flex items-center justify-center ">
      <CropModal
        setOriginImg={setOriginImg}
        open={open}
        onClose={() => setOpen(false)}
        setImageData={setUserImage}
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
