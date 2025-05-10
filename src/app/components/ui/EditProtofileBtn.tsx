"use client";
import { Modal } from "@mui/material";
import React, { useCallback, useState } from "react";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { CircularProgress } from "@mui/material";
import { twMerge } from "tailwind-merge";
import { useAblyStore } from "@/app/store/AblyStore";
import { uploadFile } from "@/app/lib/util";
import Input from "./Input";
import UploadAvatar from "./UploadAvatar";
export default function EditProtofileBtn() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, update } = useSession();
  const [editProfile, setEditProfile] = useState(session?.user);
  const { channel } = useAblyStore();
  const [password, setPassword] = useState("");
  const [userImage, setUserImage] = useState<{
    imgUrl: string;
    imgFile: File;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditProfofile = useCallback(async () => {
    try {
      setIsLoading(true);
      let image = editProfile?.image;
      if (userImage) {
        const imageData: { url: string; public_id: string } = await uploadFile(
          userImage.imgFile
        );
        image = imageData.url;

        setEditProfile((prev) => {
          if (!prev) return prev;
          return { ...prev, image: imageData.url };
        });
      }
      const res = await fetch("/api/users/edit", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editProfile, image: image }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw data.error;
      }

      await update({ ...editProfile, image: image });
      channel?.publish("user_action", {
        user: { ...editProfile, image: image },
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setUserImage(null);
    }
  }, [editProfile, update, channel, userImage]);

  // const handleImageUpload = async () => {
  //   const input = document.createElement("input");
  //   input.type = "file";
  //   input.accept = "image/*";
  //   input.click();
  //   input.addEventListener("change", (e) => {
  //     const target = e.target as HTMLInputElement;
  //     if (target.files) {
  //       const file = target.files[0];
  //       const url = URL.createObjectURL(file);

  //       setUserImage({ imgUrl: url, imgFile: file });
  //     }
  //   });
  // };
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 px-4 text-sm rounded-md outline outline-2 outline-black dark:outline dark:outline-2 dark:outline-white"
      >
        編輯個人檔案
      </button>
      <Modal
        onClose={() => setIsOpen(false)}
        className="flex items-center justify-center h-full"
        open={isOpen}
      >
        <div className="w-11/12 max-w-md bg-white rounded-md dark:bg-stone-800 h-fit dark:text-white">
          <span className="flex justify-between p-2 border-b">
            <button type="button" onClick={() => setIsOpen(false)}>
              <X />
            </button>
            <h1 className="text-lg">編輯個人資料</h1>
            <button
              onClick={() => {
                handleEditProfofile();
              }}
              className="text-blue-400"
            >
              {isLoading ? <CircularProgress size={18} /> : "儲存"}
            </button>
          </span>
          <div className="flex flex-col gap-2 p-4">
            <UploadAvatar
              src={userImage?.imgUrl || editProfile?.image}
              setUserImage={setUserImage}
              userImage={userImage}
            />
            <span className="w-full">
              <label htmlFor="name">用戶名</label>
              <Input
                value={editProfile?.name}
                type="text"
                id="name"
                required
                placeholder="example@example.com"
                onChange={(e) => {
                  if (!editProfile) return;
                  setEditProfile({ ...editProfile, name: e.target.value });
                }}
              />
            </span>{" "}
            <span className="w-full">
              <label
                htmlFor="email"
                className={twMerge(
                  "dark:text-white after:content-['*由第三方登入無法更改郵件'] after:text-xs after:text-red-500",
                  editProfile?.provider !== "credentials" &&
                    "dark:text-white/50"
                )}
              >
                郵件
              </label>
              <Input
                value={editProfile?.email || ""}
                type="email"
                id="email"
                required
                disabled={editProfile?.provider !== "credentials"}
                placeholder="example@example.com"
                onChange={(e) => {
                  if (!editProfile || editProfile.provider !== "credentials")
                    return;
                  setEditProfile({ ...editProfile, email: e.target.value });
                }}
              />
            </span>
            <span className="w-full">
              <label
                htmlFor="pass"
                className={twMerge(
                  "dark:text-white after:content-['*由第三方登入無法更改密碼'] after:text-xs after:text-red-500",
                  editProfile?.provider !== "credentials" &&
                    "dark:text-white/50"
                )}
              >
                密碼
              </label>
              <Input
                value={password}
                type="password"
                disabled={editProfile?.provider !== "credentials"}
                id="pass"
                required
                placeholder=""
                onChange={(e) => {
                  if (!editProfile || editProfile.provider !== "credentials")
                    return;
                  setPassword(e.target.value);
                }}
              />
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
