"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import UploadAvatar from "@/app/components/ui/Avatar/UploadAvatar";
import Input from "@/app/components/ui/Input";
import ThirdPartLogin from "@/app/components/ui/ThirdPartLogin";
import { uploadFile } from "@/app/lib/util";
import { useAuthStore } from "@/app/store/AuthStore";

export default function RegisterPage() {
  const [registerForm, setRegister] = useState<{
    email: string;
    password: string;
    image: string;
    name: string;
  }>({
    email: "",
    password: "",
    image: "",
    name: "",
  });
  const [userImage, setUserImage] = useState<{
    imgUrl: string;
    imgFile: File;
  } | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { systemAlert, setSystemAlert } = useAuthStore();

  const validForm = useCallback(() => {
    const { email, password } = registerForm;
    const validateEmail = (email: string) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };
    if (!validateEmail(email)) {
      setError("不合法電子郵件");
      return false;
    } else if (password.length < 6) {
      setError("密碼長度不地低於7個字");
      return false;
    }
    return true;
  }, [registerForm]);

  const handleRegister = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validForm()) return;
      try {
        setIsLoading(true);
        let avatar_url = "";
        if (userImage) {
          const avatarData = await uploadFile([userImage.imgFile]);
          if (avatarData) {
            avatar_url = avatarData[0].url;
          }
        }

        const res = await fetch("/api/auth/register", {
          headers: { "Content-Type": "application/json" },
          method: "post",
          body: JSON.stringify({
            ...registerForm,
            image: avatar_url,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSystemAlert({
            ...systemAlert,
            text: "註冊成功",
            severity: "success",
            open: true,
          });
          router.push("/auth/login");
        }
        if (data.error) {
          setError(data.error);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [validForm, registerForm, systemAlert, setSystemAlert, router, userImage]
  );

  // const handleAvatar = useCallback(async () => {
  //   const input = document.createElement("input");
  //   input.type = "file";
  //   input.accept = "image/*";
  //   input.click();
  //   input.addEventListener("change", () => {
  //     if (input.files) {
  //       const file = input.files[0];
  //       const url = URL.createObjectURL(file);
  //       setRegister((prev) => ({ ...prev, image: { file, url } }));
  //     }
  //   });
  // }, []);

  return (
    <div className="flex flex-col items-center justify-center h-dvh w-dvw dark:text-white">
      <Image alt="icon" width={200} height={100} src={"/icon.png"} />
      <div className="w-4/5 max-w-sm ">
        <h1 className="text-2xl font-bold text-center text-blue-500">
          歡迎加入
        </h1>
        <form onSubmit={handleRegister} className="flex flex-col gap-2">
          <UploadAvatar
            src={userImage?.imgUrl}
            userImage={userImage}
            setUserImage={setUserImage}
          />
          <span className="w-full">
            <label htmlFor="name">用戶名</label>
            <Input
              value={registerForm.name}
              type="text"
              id="name"
              required
              placeholder="John"
              onChange={(e) =>
                setRegister({ ...registerForm, name: e.target.value })
              }
            />
          </span>
          <span className="w-full">
            <label htmlFor="email">郵件</label>
            <Input
              value={registerForm.email}
              type="email"
              required
              id="email"
              placeholder="example@example.com"
              onChange={(e) =>
                setRegister({ ...registerForm, email: e.target.value })
              }
            />
          </span>
          <span className="w-full py-1">
            <label htmlFor="password">密碼</label>
            <Input
              value={registerForm.password}
              type="password"
              placeholder="*****"
              id="password"
              required
              onChange={(e) =>
                setRegister({ ...registerForm, password: e.target.value })
              }
            />
          </span>
          {error && <p className="py-1 text-sm text-red-600">*{error}</p>}
          <span className="w-full ">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-2 text-white bg-blue-500 rounded-md disabled:bg-blue-300 hover:bg-blue-600 active:bg-blue-300"
            >
              {isLoading ? "註冊中..." : "註冊"}
            </button>
          </span>
        </form>
        <span className="inline-flex items-center">
          <p className="font-medium ">已經有帳戶了? </p>
          <Link
            className="px-1 text-sm font-medium text-blue-500"
            href={"/auth/login"}
          >
            登入
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
