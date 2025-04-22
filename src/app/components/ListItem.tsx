import React, { LinkHTMLAttributes } from "react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { usePathname } from "next/navigation";
type LinkProps = LinkHTMLAttributes<HTMLAnchorElement>;
export default function ListItem({
  children,
  href,
  className,
  ...props
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
} & LinkProps) {
  const path = usePathname();
  const isActive = () => {
    if (href === "/") return path === "/";
    if (href === "/chat") return path.startsWith("/chat");
    return path.includes(href);
  };
  return (
    <Link
      className={twMerge(
        "flex items-center sm:justify-start justify-center w-11/12 p-2 m-1 text-lg hover:bg-stone-900/5 hover:dark:bg-white/5 transition-colors  dark:text-white rounded-lg",
        className,
        isActive() && "dark:bg-white/5 bg-black/5"
      )}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
