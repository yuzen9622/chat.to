"use client";
import React from "react";
import { AlignLeft } from "lucide-react";
import { useChatStore } from "../store/ChatStore";
import { twMerge } from "tailwind-merge";
export default function NavBar() {
  const { setSidebarOpen, sidebarOpen } = useChatStore();
  return (
    <div className="box-border flex items-center w-full p-2 h-fit lg:hidden max-sm:hidden ">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={twMerge(
          "p-1 text-3xl rounded-lg text-stone-700 active:dark:bg-gray-600"
        )}
      >
        <AlignLeft />
      </button>
    </div>
  );
}
