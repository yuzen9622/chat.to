"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

import BarList from "./BarList";
import { twMerge } from "tailwind-merge";
import { useChatStore } from "../store/ChatStore";

import { usePathname } from "next/navigation";

import { useSession } from "next-auth/react";
import ListItem from "./ui/ListItem";

export default function SideBar() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { sidebarOpen, setSidebarOpen } = useChatStore();
  const { data: session } = useSession();
  const [isRwd, setIsRwd] = useState(false);

  const pathName = usePathname();
  useEffect(() => {
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
        " h-full  xl:w-72 max-sm:w-full min-w-16  z-50 transition-all border-r dark:border-none bg-transparent dark:bg-transparent "
      )}
      ref={sidebarRef}
    >
      <nav className="flex justify-between w-full h-full p-2 overflow-auto bg-white sm:flex-col dark:bg-transparent backdrop-blur-3xl">
        <div className="flex flex-row items-center w-full gap-2 sm:flex-col">
          <div className="relative flex gap-2 p-2 transition-colors rounded-lg max-sm:hidden lg:justify-start">
            <Image
              src="/chat.png"
              className={twMerge("w-7 h-7 aspect-square ")}
              width={35}
              height={35}
              priority={true}
              alt="logo"
            />
            <span
              className={twMerge(
                "hidden xl:block text-blue-500 text-xl",
                pathName.startsWith("/chat") && "hidden sm:hidden"
              )}
            >
              Chat.to
            </span>
          </div>
          <div className="flex flex-row items-center flex-1 w-full gap-2 sm:flex-col">
            <BarList />
          </div>
        </div>

        <section>
          {session?.user && (
            <ListItem
              href={`/profile/${session.userId}`}
              className="max-sm:hidden"
            >
              <div>
                <Image
                  alt="user"
                  width={35}
                  height={35}
                  className=" rounded-2xl w-9 h-9 aspect-square"
                  src={session?.user.image || "/user.png"}
                />
              </div>
              <div className="flex flex-col max-xl:hidden">
                <span className="font-bold text-stone-800 dark:text-white ">
                  {session?.user.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-neutral-400">
                  {session?.user.email}
                </span>
              </div>
            </ListItem>
          )}
        </section>
      </nav>
    </div>
  );
}
