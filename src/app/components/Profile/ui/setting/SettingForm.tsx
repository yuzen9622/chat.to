"use client";
import { useCallback, useEffect, useState } from "react";
import { UserInterface } from "@/types/type";

import Input from "@/app/components/ui/Input";
import { useAblyStore } from "@/app/store/AblyStore";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/app/store/AuthStore";
import { uploadFile } from "@/app/lib/util";
import ProfileCard from "../ProfileCard";
import CircularProgress from "@mui/material/CircularProgress";
import { Backdrop } from "@mui/material";
import UploadAvatar from "@/app/components/ui/Avatar/UploadAvatar";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
interface SettingsFormProps {
  user: UserInterface;
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const { update } = useSession();
  const { theme, setTheme, systemTheme } = useTheme();
  const isDark =
    theme === "dark" || (theme === "system" && systemTheme === "dark");
  const [editProfile, setEditProfile] = useState(user);
  const { channel } = useAblyStore();
  const [userImage, setUserImage] = useState<{
    imgUrl: string;
    imgFile: File;
  } | null>(null);
  const { setSystemAlert, friends } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleEditProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      let image = editProfile?.image;
      if (userImage) {
        if (userImage.imgFile.size > 1024 * 1024 * 8) {
          setSystemAlert({
            severity: "error",
            variant: "filled",
            text: "檔案大小需低於8MB",
            open: true,
          });
          return;
        }
        const imageData = await uploadFile([userImage.imgFile]);
        if (imageData) {
          image = imageData[0].url;

          setEditProfile((prev) => {
            if (!prev) return prev;
            return { ...prev, image: imageData[0].url };
          });
        }
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
  }, [editProfile, update, channel, userImage, setSystemAlert]);

  const handleLogout = useCallback(() => {
    const check = window.confirm("確定登出?");
    if (check) {
      signOut();
    }
  }, []);

  useEffect(() => {
    if (!userImage) {
      setEditProfile((prev) => ({
        ...prev,
        image: user.image,
      }));
    } else {
      setEditProfile((prev) => ({
        ...prev,
        image: userImage?.imgUrl || prev.image,
      }));
    }
  }, [userImage, user]);
  return (
    <div className="space-y-6">
      {/* 個人資料區塊 */}
      <Backdrop open={isLoading}>
        <CircularProgress
          className="text-blue-500 dark:text-blue-400"
          color="inherit"
        />
      </Backdrop>
      <section>
        <h2 className="mb-4 text-lg font-semibold dark:text-white">預覽</h2>
        <ProfileCard
          user={editProfile}
          note={editProfile.note!}
          friends={friends!}
          isPreview={true}
        />
      </section>

      <section className="p-6 bg-white rounded-xl dark:bg-neutral-800/50">
        <h2 className="mb-4 text-lg font-semibold dark:text-white">個人資料</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <UploadAvatar
              src={userImage?.imgUrl || editProfile?.image}
              setUserImage={setUserImage}
              userImage={userImage}
            />
            {/* <button className="px-4 py-2 text-sm text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
              更換背景
            </button> */}
          </div>

          <div className="space-y-2 dark:text-white">
            <label className="text-sm text-gray-500 dark:text-gray-400">
              名稱
            </label>
            <Input
              onChange={(e) => {
                if (!editProfile) return;
                setEditProfile({ ...editProfile, name: e.target.value });
              }}
              type="text"
              defaultValue={user.name}
            />
          </div>
          <button
            onClick={handleEditProfile}
            className="px-4 py-2 text-sm text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            確認
          </button>
        </div>
      </section>

      {/* 外觀設定 */}
      <section className="p-6 bg-white rounded-xl dark:bg-neutral-800/50">
        <h2 className="mb-4 text-lg font-semibold dark:text-white">外觀</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDark ? (
              <Moon className="text-yellow-500" />
            ) : (
              <Sun className="text-yellow-500" />
            )}
            <span className="dark:text-white">深色模式</span>
          </div>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`w-12 h-6 rounded-full transition-colors ${
              isDark ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 ml-1 rounded-full bg-white transition-transform ${
                isDark ? "transform translate-x-6" : ""
              }`}
            />
          </button>
        </div>
      </section>
      <section className="p-6 bg-white rounded-xl dark:bg-neutral-800/50">
        <h2 className="mb-4 font-bold">危險</h2>
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-300"
        >
          登出
        </button>
      </section>
    </div>
  );
}
