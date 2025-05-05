"use client";
import { signOut } from "next-auth/react";
import React from "react";

export default function LogoutBtn() {
  return (
    <button
      className="p-1 px-2 text-sm text-white bg-red-500 rounded-md"
      onClick={() => signOut()}
    >
      登出
    </button>
  );
}
