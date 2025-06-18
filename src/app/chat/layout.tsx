"use client";
import React from "react";
import ChatList from "../components/Chat/ui/ChatList";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

export default function Layout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex w-full h-full gap-2 overflow-hidden sm:py-2">
      {path.startsWith("/chat") && (
        <div
          className={twMerge(
            "  h-full w-full sm:min-w-80 sm:max-w-80  max-sm:w-full   max-sm:m-0 flex-1",
            path.startsWith("/chat/") && "max-sm:hidden",
            !path.startsWith("/chat") && "max-sm:hidden"
          )}
        >
          <ChatList />
        </div>
      )}

      {children}
    </div>
  );
}
