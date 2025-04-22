"use client";
import React from "react";
import ChatList from "../components/ChatList";
import { usePathname } from "next/navigation";
import NavBar from "../components/NavBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {path === "/chat" && (
        <div className="flex-1 w-full h-full overflow-hidden sm:hidden">
          <ChatList />
        </div>
      )}

      {path === "/chat" && (
        <div>
          <NavBar />
        </div>
      )}

      {children}
    </div>
  );
}
