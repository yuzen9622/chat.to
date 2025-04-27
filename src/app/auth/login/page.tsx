"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import ThirdPartLogin from "@/app/components/ThirdPartLogin";
import Link from "next/link";
import { getSession, signIn, useSession } from "next-auth/react";
import { twMerge } from "tailwind-merge";
import { redirect, useRouter } from "next/navigation";

export default function LoginPage() {
  const [loginForm, setLoginForm] = useState<{
    email: string;
    password: string;
  }>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    const getAuthSession = async () => {
      const sessoin = await getSession();
      if (sessoin) {
        redirect("/");
      }
    };
    getAuthSession();
  }, [router]);

  const handleLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");
      setIsLoading(true);
      const res = await signIn("credentials", {
        redirect: false,
        email: loginForm.email,
        password: loginForm.password,
      });
      if (res && res.ok) {
        redirect("/");
      }

      if (res && res.error) {
        setError(res.error);
      }
      setIsLoading(false);
    },
    [loginForm]
  );

  return (
    <div className="flex flex-col items-center justify-center h-dvh w-dvw dark:text-white">
      <Image alt="icon" width={200} height={100} src={"/icon.png"} />
      <div className="w-4/5 max-w-sm ">
        <h1 className="text-2xl font-bold text-center text-blue-500">
          歡迎回來
        </h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-2 ">
          <span className="w-full">
            <label htmlFor="email">郵件</label>
            <input
              value={loginForm.email}
              type="email"
              id="email"
              required
              placeholder="example@example.com"
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              className="w-full p-2 rounded-md dark:bg-white/5 outline outline-2 outline-blue-300 focus:outline-blue-500"
            />
          </span>
          <span className="w-full">
            <label htmlFor="password">密碼</label>
            <input
              value={loginForm.password}
              type="password"
              placeholder="*****"
              id="password"
              required
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              className="w-full p-2 rounded-md outline dark:bg-white/5 outline-2 outline-blue-300 focus:outline-blue-500"
            />
          </span>
          {error && <p className="py-1 text-sm text-red-600">{error}</p>}
          <span className="w-full">
            <button
              disabled={isLoading}
              type="submit"
              className={twMerge(
                "w-full p-2 text-white bg-blue-600 rounded-md hover:bg-blue-500 active:bg-blue-300",
                isLoading && "bg-blue-400"
              )}
            >
              {isLoading || status === "loading" ? "登入中..." : "登入"}
            </button>
          </span>
        </form>

        <span className="inline-flex items-center">
          <p className="font-medium ">還沒有帳戶? </p>
          <Link
            className="px-1 text-sm font-medium text-blue-500"
            href={"/auth/register"}
          >
            註冊
          </Link>
        </span>
        <div className="relative text-stone-800/55 flex items-center text-sm justify-center w-full p-2 text-center dark:text-white/20 before:absolute before:w-[43%] before:h-[1px] before:left-0 before:bg-stone-800/55 after:bg-stone-800/55 before:dark:bg-white/20 after:absolute after:w-[43%] after:h-[1px] after:right-0 after:dark:bg-white/20">
          OR
        </div>
        <ThirdPartLogin />
      </div>
    </div>
  );
}
