"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AlignLeft } from "lucide-react";
import BarList from "./BarList";
import ChatList from "./ChatList";
import { twMerge } from "tailwind-merge";
import { useChatStore } from "../store/ChatStore";

export default function SideBar() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { sidebarOpen, setSidebarOpen } = useChatStore();
  const [isRwd, setIsRwd] = useState(false);
  useEffect(() => {
    console.log(document.body);
    const observer = new ResizeObserver((el) => {
      el.forEach((e) => {
        if (e.contentRect.width >= 1024 && !sidebarOpen) {
          setSidebarOpen(true);
          setIsRwd(false);
        } else if (e.contentRect.width < 1024 && sidebarOpen && !isRwd) {
          setSidebarOpen(false);
          setIsRwd(true);
        }
      });
    });
    observer.observe(document.body);
    return () => {
      observer.unobserve(document.body);
    };
  }, [setSidebarOpen, sidebarOpen, isRwd]);

  return (
    <div
      className={twMerge(
        " p-2 sm:h-full sm:pr-0  z-50 sm:absolute lg:sticky   sm:w-[300] sm:min-w-[300] transition-all border-r dark:border-none",
        !sidebarOpen && "sm:-translate-x-full sm:absolute    sm:min-w-0"
      )}
      ref={sidebarRef}
    >
      <nav className="flex flex-row items-center w-full h-full overflow-auto bg-white sm:flex-col dark:bg-stone-800/90 rounded-r-md backdrop-blur-3xl">
        <div className="box-border items-center justify-between hidden w-full p-4 h-fit sm:flex">
          <span className="inline-flex items-center px-2 space-x-2 text-3xl text-blue-400">
            <Image
              src="/chat.png"
              className=" w-9 h-9"
              width={35}
              height={35}
              priority={true}
              alt="logo"
            />
            <Image
              src="/icon.png"
              width={100}
              height={100}
              priority={true}
              alt="logo"
            />
          </span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={twMerge(
              " sticky top-8 left-4 p-1 text-3xl rounded-lg active:dark:bg-gray-600   lg:hidden"
            )}
          >
            <AlignLeft className="dark:text-white text-stone-900" size={25} />
          </button>
        </div>
        <BarList />

        <div className="hidden w-full overflow-auto sm:block">
          <ChatList />
        </div>

        {/* <div className="w-full p-2 text-white rounded-lg bg-white/10">
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="Open chat"
                open=""
                labelIcon={<DotIcon />}
              />
            </UserButton.MenuItems>
          </UserButton>
        </div> */}
      </nav>
    </div>
  );
}
