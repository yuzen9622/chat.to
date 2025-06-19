"use client";

import { Ghost } from "lucide-react";
import Link from "next/link";
import Button from "@mui/material/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 text-center dark:bg-transparent bg-gray-50">
      <Ghost className="w-24 h-24 mb-4 text-gray-400 animate-bounce" />
      <h1 className="mb-2 text-4xl font-bold text-gray-800">
        404 - 找不到頁面
      </h1>
      <p className="mb-6 text-gray-600">
        嗚喔～你似乎迷路了，或這個頁面不存在。
      </p>
      <Link href="/" passHref>
        <Button
          variant="contained"
          color="primary"
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          回到首頁
        </Button>
      </Link>
    </div>
  );
}
