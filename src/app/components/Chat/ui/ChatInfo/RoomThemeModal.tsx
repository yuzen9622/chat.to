"use client";

import { Palette } from "lucide-react";
import { useState } from "react";

import { Grow, Modal } from "@mui/material";

export default function RoomTheme() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex justify-between w-full p-2"
      >
        <Palette />

        <p>主題</p>
      </button>
      <Modal
        className="flex items-center justify-center"
        onClose={() => setOpen(false)}
        open={open}
      >
        <Grow in={open}>
          <div className="flex flex-col w-full h-64 max-w-md gap-2 p-2 bg-white rounded-md dark:bg-stone-900">
            <h1 className="text-xl">主題</h1>
            <p className="text-xs text-stone-400">自訂房間主題或是圖片</p>
            <div className="flex">
              <p>暫未開發</p>
            </div>
          </div>
        </Grow>
      </Modal>
    </>
  );
}
