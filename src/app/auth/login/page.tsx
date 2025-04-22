"use client";
import { supabase } from "@/app/lib/supabasedb";
import { redirect } from "next/navigation";
import Image from "next/image";
import { useCallback, useState } from "react";
import ThirdPartLogin from "@/app/components/ThirdPartLogin";

export default function LoginPage() {
  const [loginForm, setLoginForm] = useState<{
    email: string;
    password: string;
  }>({ email: "", password: "" });

  const handleLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const { error } = await supabase.auth.signInWithPassword(loginForm);
      if (!error) {
        redirect("/chat");
      }
    },
    [loginForm]
  );

  return (
    <div className="flex flex-col items-center justify-center h-dvh w-dvw ">
      <Image alt="icon" width={200} height={100} src={"/icon.png"} />
      <div className="w-4/5 max-w-sm ">
        <h1 className="text-2xl font-bold text-center text-blue-500">
          歡迎回來
        </h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-2">
          <span className="w-full">
            <label htmlFor="">郵件</label>
            <input
              type="email"
              placeholder="example@example.com"
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              className="w-full p-2 rounded-md outline-2 outline-blue-300 focus:outline-blue-500"
            />
          </span>
          <span className="w-full">
            <label htmlFor="">密碼</label>
            <input
              type="password"
              placeholder="*****"
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              className="w-full p-2 rounded-md outline-2 outline-blue-300 focus:outline-blue-500"
            />
          </span>
          <span className="w-full">
            <button
              type="submit"
              className="w-full p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 active:bg-blue-300"
            >
              登入
            </button>
          </span>
        </form>
        <div className="relative text-stone-800/55 flex items-center text-sm justify-center w-full p-2 text-center dark:text-white/20 before:absolute before:w-[43%] before:h-[1px] before:left-0 before:bg-stone-800/55 after:bg-stone-800/55 before:dark:bg-white/20 after:absolute after:w-[43%] after:h-[1px] after:right-0 after:dark:bg-white/20">
          OR
        </div>
        <ThirdPartLogin />
      </div>
    </div>
  );
}
