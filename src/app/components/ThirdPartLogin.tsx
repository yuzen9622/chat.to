"use client";
import React, { useCallback, useState } from "react";
import { GitHub, Google } from "@mui/icons-material";
import { signIn } from "next-auth/react";
import { CircularProgress } from "@mui/material";

export default function ThirdPartLogin() {
  const [loginStatus, setLoginStatus] = useState({
    google: false,
    github: false,
  });

  const handleLogin = useCallback(async (provider: string) => {
    setLoginStatus((prev) => ({ ...prev, [provider]: true }));
    await signIn(provider, { callbackUrl: "/chat" });

    setLoginStatus((prev) => ({ ...prev, [provider]: false }));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-center w-full h-full gap-2 p-2 max-sm:flex-col">
        <button
          onClick={() => {
            handleLogin("google");
          }}
          disabled={loginStatus.google}
          className="relative flex items-center justify-center w-full gap-2 p-2 text-sm font-semibold border-2 rounded-lg dark:bg-white border-stone-700 text-stone-800"
        >
          {loginStatus.google && (
            <div className="absolute z-10 flex items-center justify-center w-full h-full rounded-md bg-stone-500/80">
              <CircularProgress
                className="text-white"
                color="inherit"
                size={20}
              />
            </div>
          )}
          <Google /> 使用 Google 登入
        </button>
        <button
          disabled={loginStatus.github}
          onClick={() => handleLogin("github")}
          className="relative flex items-center justify-center w-full gap-2 p-2 text-sm font-semibold text-white border-2 border-white rounded-lg bg-stone-800"
        >
          {loginStatus.github && (
            <div className="absolute z-10 flex items-center justify-center w-full h-full rounded-md bg-stone-500/80">
              <CircularProgress
                className="text-white"
                color="inherit"
                size={20}
              />
            </div>
          )}
          <GitHub /> 使用 GitHub 登入
        </button>
      </div>
    </div>
  );
}
