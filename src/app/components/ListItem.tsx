import React, { LinkHTMLAttributes } from "react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { usePathname, useRouter } from "next/navigation";
import { useChatStore } from "../store/ChatStore";
type LinkProps = LinkHTMLAttributes<HTMLAnchorElement>;
export default function ListItem({
  children,
  href,
  className,
  notify,
  ...props
}: {
  children: React.ReactNode;
  notify?: number;
  href: string;
  className?: string;
} & LinkProps) {
  const { setSidebarOpen } = useChatStore();
  const path = usePathname();
  const route = useRouter();

  const isActive = () => {
    if (href === "/") return path === "/";
    if (href === "/chat") return path.startsWith("/chat");
    return path.includes(href);
  };
  return (
    <Link
      className={twMerge(
        " relative flex items-center sm:justify-start justify-center w-11/12 p-2 m-1 gap-4 text-lg hover:bg-stone-900/5 hover:dark:bg-white/5 transition-colors  dark:text-white rounded-lg",
        className,
        isActive() && "dark:bg-white/5 bg-black/5"
      )}
      href={href}
      onClick={() => {
        route.push(href);
        setSidebarOpen(false);
      }}
      {...props}
    >
      {children}

      {notify != void 0 && notify > 0 && (
        <div className="absolute top-0 right-0 flex w-4 h-4 text-xs bg-red-500 rounded-full place-content-center">
          {notify}
        </div>
      )}
    </Link>
  );
}
