"use client";
import React, { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import FriendQuery from "@/app/components/Friend/FriendQuery";
export default function FriendSearch() {
  const [searchValue, setSerchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchValue);
    }, 300); // 300ms 防抖

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);
  return (
    <div
      className={twMerge(
        "relative w-full rounded-md bg-gray-100 dark:bg-neutral-700 my-2",
        debouncedValue.length > 0 && "rounded-b-none"
      )}
    >
      <input
        type="search"
        placeholder="Search friend..."
        onChange={(e) => setSerchValue(e.target.value)}
        value={searchValue}
        className="w-full p-2 text-blue-400 bg-transparent outline-none dark:text-white placeholder:text-blue-600"
      />

      <FriendQuery queryValue={debouncedValue} />
    </div>
  );
}
