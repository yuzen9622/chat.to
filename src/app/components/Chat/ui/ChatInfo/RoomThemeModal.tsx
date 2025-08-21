"use client";

import { BanIcon, ChevronRightIcon, Images, Palette } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import CropModal from '@/app/components/ui/Modal/CropModal';
import { updateRoomTheme } from '@/app/lib/api/room/roomApi';
import { uploadFile } from '@/app/lib/util';
import { useChatStore } from '@/app/store/ChatStore';
import { useImageUpload } from '@/hook/useImageUpload';
import { Grow, Modal } from '@mui/material';

import type { RoomTheme, UserImageData } from "@/types/type";
const roomThemes: RoomTheme[] = [
  {
    type: "color",
    bgColor: "bg-amber-600",
    textColor: "text-white",
    ownColor: "bg-amber-400", // 自己訊息亮黃
  }, // 琥珀黃（活力感）
  {
    type: "color",
    bgColor: "bg-emerald-600",
    textColor: "text-white",
    ownColor: "bg-emerald-400", // 自己訊息亮綠
  }, // 翡翠綠（清新感）
  {
    type: "color",
    bgColor: "bg-red-600",
    textColor: "text-white",
    ownColor: "bg-red-500", // 自己訊息亮紅
  }, // 鮮紅（熱情感）
  {
    type: "color",
    bgColor: "bg-violet-600",
    textColor: "text-white",
    ownColor: "bg-violet-500", // 自己訊息亮紫
  }, // 紫色（神秘感）
  {
    type: "color",
    bgColor: "bg-gray-200",
    textColor: "text-black",
    ownColor: "bg-gray-300", // 自己訊息稍亮
  }, // 淺灰（簡約乾淨）
  {
    type: "color",
    bgColor: "bg-slate-900",
    textColor: "text-white",
    ownColor: "bg-slate-700", // 自己訊息亮藍灰
  }, // 黑藍（科技感）
];

export default function RoomThemeModal() {
  const [open, setOpen] = useState(false);
  const { setCurrentChat, currentChat, setRoom } = useChatStore();
  const {
    handleCropClose,
    handleImageUpload,
    imageData,
    setImageData,
    cropOpen,
    originImg,
    setOriginImg,
  } = useImageUpload();
  const currentTheme = useMemo(() => {
    if (!currentChat) return null;
    return currentChat.room_theme;
  }, [currentChat]);

  const [roomTheme, setRoomTheme] = useState<RoomTheme | null>(currentTheme);

  const handleSubmit = useCallback(async () => {
    try {
      if (!currentChat) return;
      if (roomTheme && roomTheme.type === "image" && imageData) {
        const uploadImageData = await uploadFile([imageData.imgFile]);
        if (uploadImageData) {
          roomTheme.image = uploadImageData[0];
          roomTheme.bgImage = `url(${uploadImageData[0].url})`;
        }
      }

      await updateRoomTheme(currentChat.id, roomTheme);
    } catch (error) {
      console.log(error);
    }
  }, [roomTheme, currentChat, imageData]);

  const handleThemeChange = useCallback(
    (theme: RoomTheme | null) => {
      if (!currentChat) return;
      const newChat = { ...currentChat };
      newChat.room_theme = theme;
      setCurrentChat(newChat);
      setRoom((prev) =>
        prev.map((room) => (room.id === currentChat.id ? currentChat : room))
      );
      setRoomTheme(theme);
    },
    [currentChat, setCurrentChat, setRoom]
  );

  const handleCrop = (imageData: UserImageData) => {
    if (!imageData) return;

    const theme: RoomTheme = {
      type: "image",
      image: { url: imageData.imgUrl, public_id: "" },
      bgImage: `url(${imageData.imgUrl})`,
    };

    handleThemeChange(theme);
  };

  return (
    <>
      <CropModal
        open={cropOpen}
        originSrc={originImg ?? "/user.png"}
        setImageData={setImageData}
        onClose={handleCropClose}
        setOriginImg={setOriginImg}
        onCrop={handleCrop}
        aspectRatio={16 / 9}
      />
      <button
        onClick={() => setOpen(true)}
        className="flex justify-between w-full p-2"
      >
        <Palette />
        <span className="flex">
          <p>主題</p>
          <ChevronRightIcon />
        </span>
      </button>
      <Modal
        className="flex items-center justify-center"
        onClose={() => {
          setOpen(false);
          handleSubmit();
        }}
        open={open}
      >
        <Grow in={open}>
          <div className="flex flex-col w-full max-w-md gap-2 p-2 bg-white rounded-md h-3/5 dark:bg-stone-900">
            <h1 className="text-xl">主題</h1>
            <p className="text-xs text-stone-400">自訂房間主題或是圖片</p>
            <div className="grid h-full max-h-full grid-cols-3 gap-2 p-2 overflow-auto">
              <button
                onClick={handleImageUpload}
                className={twMerge(
                  "flex items-center justify-center w-full h-full text-white bg-cover rounded-md min-h-24 bg-stone-800",
                  currentTheme?.type === "image" &&
                    "outline outline-offset-1 outline-blue-500"
                )}
                style={
                  currentTheme?.type === "image"
                    ? {
                        backgroundImage: currentTheme.bgImage,
                      }
                    : {}
                }
              >
                <Images />
              </button>
              <button
                onClick={() => handleThemeChange(null)}
                className={twMerge(
                  "flex items-center justify-center w-full h-full text-white rounded-md min-h-24 bg-stone-800",
                  !currentTheme && "outline outline-offset-1 outline-blue-500"
                )}
              >
                <BanIcon />
              </button>
              {roomThemes.map((theme) => {
                if (theme.type === "image") return null;
                return (
                  <button
                    onClick={() => handleThemeChange(theme)}
                    key={theme.bgColor}
                    className={twMerge(
                      `w-full h-full rounded-md min-h-24  flex flex-col items-center justify-center`,
                      currentTheme?.type === "color" &&
                        currentTheme.bgColor === theme.bgColor &&
                        "outline outline-offset-1 outline-blue-500",
                      theme.bgColor,
                      theme.textColor
                    )}
                  >
                    <p>text color</p>
                    <div
                      className={twMerge(
                        "rounded-3xl px-3 py-2 ",
                        theme.ownColor
                      )}
                    >
                      own message
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Grow>
      </Modal>
    </>
  );
}
