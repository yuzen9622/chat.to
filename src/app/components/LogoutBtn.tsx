"use client";
import { signOut } from "next-auth/react";
import React from "react";

export default function LogoutBtn() {
  return (
    <button
      className="p-1 px-2 text-sm rounded-md dark:bg-red-500"
      onClick={() => signOut()}
    >
      登出
    </button>
  );
}
