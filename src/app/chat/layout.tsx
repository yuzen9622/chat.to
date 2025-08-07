"use client";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

import ChatList from "../components/Chat/ui/ChatList/index";

export default function Layout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex w-full h-full overflow-hidden dark:my-2 dark:sm:rounded-l-md">
      {path.startsWith("/chat") && (
        <div
          className={twMerge(
            "  h-full w-full sm:min-w-80 sm:max-w-80  max-sm:w-full  border-r dark:border-r-white/10   max-sm:m-0 flex-1",
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
