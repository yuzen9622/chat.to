"use client";
import React from "react";
import { GitHub, Google } from "@mui/icons-material";
import { signIn } from "next-auth/react";
export default function ThirdPartLogin() {
  return (
    <div>
      <div className="flex items-center justify-center w-full h-full gap-2 p-2 max-sm:flex-col">
        <button
          onClick={() => signIn("google")}
          className="flex items-center justify-center w-full p-2 text-sm font-semibold border-2 rounded-lg dark:bg-white border-stone-700 text-stone-800 "
        >
          <Google /> 使用 Google 登入
        </button>
        <button
          onClick={() => signIn("github")}
          className="flex items-center justify-center w-full p-2 text-sm font-semibold text-white border-2 border-white rounded-lg bg-stone-800"
        >
          <GitHub /> 使用 GitHub 登入
        </button>
      </div>
    </div>
  );
}
