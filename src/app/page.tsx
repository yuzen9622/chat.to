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
      <p className="text-white">開發者很懶 還沒開發~~</p>
    </div>
  );
}
