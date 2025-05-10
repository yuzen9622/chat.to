"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AlignLeft } from "lucide-react";
import BarList from "./BarList";
import ChatList from "./ChatList";
import { twMerge } from "tailwind-merge";
import { useChatStore } from "../store/ChatStore";
import { Drawer } from "@mui/material";

type SideType = {
  anchor: "bottom" | "left" | "right" | "top";
  variant: "permanent" | "temporary" | "persistent";
  size: "xl" | "lg" | "sm";
};

export default function SideBar() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { sidebarOpen, setSidebarOpen } = useChatStore();
  const [isRwd, setIsRwd] = useState(false);
  const [sideStyle, setSideStyle] = useState<SideType>({
    anchor: "left",
    variant: "permanent",
    size: "xl",
  });

  useEffect(() => {
    const observer = new ResizeObserver((el) => {
      el.forEach((e) => {
        const width = e.contentRect.width;

        // 根據目前寬度判斷應該設定哪種樣式
        let newStyle: SideType = {
          anchor: "left",
          variant: "permanent",
          size: "xl",
        };
        if (width >= 1024) {
          newStyle = { anchor: "left", variant: "permanent", size: "xl" };
        } else if (width > 640) {
          newStyle = { anchor: "left", variant: "temporary", size: "lg" };
        } else {
          newStyle = { anchor: "bottom", variant: "permanent", size: "sm" };
        }

        // 避免重複設定相同 style
        setSideStyle((prev) => {
          if (
            prev.anchor !== newStyle.anchor ||
            prev.variant !== newStyle.variant ||
            prev.size !== newStyle.size
          ) {
            return newStyle;
          }
          return prev;
        });

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
    <Drawer
      sx={{
        width: sideStyle.size === "sm" ? "auto" : 300,
        height: 40,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: sideStyle.size === "sm" ? "auto" : 300,
          border: "none",
          boxSizing: "border-box",
        },
        border: "none",
      }}
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      className="w-full"
      anchor={sideStyle.anchor}
      variant={sideStyle.variant}
    >
      <div
        className={twMerge(
          " h-full   z-50 transition-all border-r dark:border-none"
        )}
        ref={sidebarRef}
      >
        <nav className="flex flex-row items-center w-full h-full overflow-auto bg-white sm:flex-col dark:bg-stone-800 backdrop-blur-3xl">
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
                " sticky top-8 left-4 p-1 text-3xl rounded-lg hover:bg-stone-900/10 hover:dark:bg-white/10 active:dark:bg-white/10   lg:hidden"
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
    </Drawer>
  );
}
