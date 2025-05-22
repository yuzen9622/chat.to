import React, { LinkHTMLAttributes } from "react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { usePathname, useRouter } from "next/navigation";
import { useChatStore } from "../../store/ChatStore";
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
        " relative flex items-center text-stone-900/70 lg:justify-start p-2 justify-center w-full   gap-2  hover:bg-stone-900/5 hover:dark:bg-white/5 transition-colors dark:text-neutral-400 hover:text-neutral-800 hover:dark:text-white rounded-lg",
        isActive() &&
          "dark:bg-white/5 bg-black/5 text-neutral-800 dark:text-white",
        className
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
        <div className="absolute top-0 right-0 flex items-center justify-center flex-shrink-0 px-1.5 text-xs text-white bg-red-500 rounded-full ">
          {notify}
        </div>
      )}
    </Link>
  );
}
