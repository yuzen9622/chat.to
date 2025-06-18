"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2 p-2 overflow-hidden flex-nowrap">
      <Image
        alt="icon"
        width={100}
        className=" w-72"
        height={100}
        src={"/icon.png"}
      />
      <a
        className="inline-block px-4 py-2 font-semibold text-white underline transition-transform shadow-md rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:scale-105 underline-offset-4"
        href="https://github.com/yuzen9622/chat.to"
        target="_blank"
        rel="noopener noreferrer"
      >
        chat.to 源代碼 贊助我星星吧 😎😎
      </a>

      <p className="text-white">開發者很懶 還沒開發~~</p>
    </div>
  );
}
