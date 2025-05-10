"use client";
import { signOut } from "next-auth/react";
import React from "react";
import WarningButton from "./WarningButton";

export default function LogoutBtn() {
  return (
    <WarningButton
      className="p-1 px-3 text-sm text-red-500 rounded-md outline outline-offset-2 outline-2 outline-red-500 "
      onClick={() => signOut()}
    >
      登出
    </WarningButton>
  );
}
