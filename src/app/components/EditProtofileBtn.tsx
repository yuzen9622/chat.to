"use client";
import { Modal } from "@mui/material";
import React, { useCallback, useState } from "react";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { CircularProgress } from "@mui/material";
import { twMerge } from "tailwind-merge";
import { useAblyStore } from "../store/AblyStore";

export default function EditProtofileBtn() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, update } = useSession();
  const [editProfile, setEditProfile] = useState(session?.user);
  const { channel } = useAblyStore();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleEditProfofile = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/users/edit", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProfile),
      });
      const data = await res.json();
      if (!res.ok) {
        throw data.error;
      }

      await update(editProfile);
      channel?.publish("user_action", { user: editProfile });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [editProfile, update, channel]);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 text-sm rounded-md bg-stone-200 dark:bg-white/10"
      >
        編輯個人資料
      </button>
      <Modal
        onClose={() => setIsOpen(false)}
        className="flex items-center justify-center h-full"
        open={isOpen}
      >
        <div className="w-11/12 max-w-md rounded-md dark:bg-stone-800 h-fit dark:text-white">
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
            <span className="w-full">
              <label htmlFor="name">用戶名</label>
              <input
                value={editProfile?.name}
                type="text"
                id="name"
                required
                placeholder="example@example.com"
                onChange={(e) => {
                  if (!editProfile) return;
                  setEditProfile({ ...editProfile, name: e.target.value });
                }}
                className="w-full p-2 rounded-md dark:bg-stone-800 outline outline-2 outline-blue-300 focus:outline-blue-500"
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
              <input
                value={editProfile?.email}
                type="email"
                id="email"
                required
                disabled={editProfile?.provider !== "credentials"}
                placeholder="example@example.com"
                onChange={(e) => {
                  if (!editProfile) return;
                  setEditProfile({ ...editProfile, email: e.target.value });
                }}
                className="w-full p-2 rounded-md dark:bg-stone-800 dark:disabled:bg-stone-600 dark:disabled:text-white/50 outline outline-2 outline-blue-300 focus:outline-blue-500"
              />
            </span>
            <span className="w-full">
              <label htmlFor="pass">密碼</label>
              <input
                value={password}
                type="password"
                id="pass"
                required
                placeholder=""
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className="w-full p-2 rounded-md dark:bg-stone-800 outline outline-2 outline-blue-300 focus:outline-blue-500"
              />
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
