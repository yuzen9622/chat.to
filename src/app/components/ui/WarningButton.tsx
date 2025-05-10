import React, { DetailsHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = DetailsHTMLAttributes<HTMLButtonElement>;

export default function WaringButton({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
} & ButtonProps) {
  return (
    <button
      className={twMerge(
        "p-1 px-3 text-red-500 rounded-md !outline outline-offset-2 outline-2 outline-red-500 ",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
