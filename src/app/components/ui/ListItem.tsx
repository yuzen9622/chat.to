import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

import { useChatStore } from "../../store/ChatStore";

import type { LinkHTMLAttributes } from "react";
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

  const isActive = () => {
    if (href === "/") return path === "/";
    if (href === "/chat") return path.startsWith("/chat");
    return path.includes(href);
  };
  return (
    <Link
      className={twMerge(
        " relative flex items-center text-stone-900/70 lg:justify-start p-2 justify-center w-full active:scale-95   gap-2  hover:bg-stone-100 hover:dark:bg-white/5  dark:text-neutral-400   transition-all hover:text-neutral-800 hover:dark:text-white rounded-lg",
        isActive() && " font-bold  text-neutral-800 dark:text-white",
        path.startsWith("/chat") ? " lg:justify-center " : " lg:justify-start",
        className
      )}
      href={href}
      onClick={() => {
        setSidebarOpen(false);
      }}
      rel="prefetch"
      {...props}
    >
      {children}

      {notify !== void 0 && notify > 0 && (
        <div className="absolute top-0 right-0 flex items-center justify-center flex-shrink-0 px-1.5 text-xs text-white bg-red-500 rounded-full ">
          {notify}
        </div>
      )}
    </Link>
  );
}
