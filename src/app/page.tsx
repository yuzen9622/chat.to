"use client";
import Image from "next/image";
import Link from "next/link";
import NoteButton from "./components/NoteButton";
import NavBar from "./components/NavBar";
import EditProtofileBtn from "./components/EditProtofileBtn";
import FriendNote from "./components/FriendNote";

import LogoutBtn from "./components/LogoutBtn";
import { useSession } from "next-auth/react";
import { useAuthStore } from "./store/AuthStore";

export default function Home() {
  const { data: session } = useSession();
  const { friends } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2 p-2 overflow-hidden flex-nowrap">
      <section className="flex flex-col items-center justify-start w-full p-3 px-4 rounded-md min-w-fit h-fit dark:bg-white/5">
        <NavBar />
        <span className="flex items-center gap-8 mt-3 dark:text-white">
          <div className="relative w-fit h-fit">
            <Image
              className="w-24 h-24 rounded-full"
              src={session?.user?.image || "/user.png"}
              width={100}
              height={100}
              alt="avatar"
            />
            <NoteButton note={session?.user.note || null} />
          </div>

          <div className="flex flex-col gap-2 ">
            <span className="flex gap-2">
              <p className="text-2xl font-semibold">{session?.user?.name}</p>
              <EditProtofileBtn />
            </span>

            <Link className="active:dark:text-white/10" href={"/friend"}>
              {friends?.length} 位朋友{" "}
            </Link>
            <p>{session?.user?.email}</p>
            <span className="flex gap-2">
              {/* <button className="p-1 text-sm rounded-md bg-stone-200 dark:bg-white/10">
                切換帳號
              </button> */}
              <LogoutBtn />
            </span>
          </div>
        </span>
      </section>
      <section className="flex w-full h-full p-3 px-4 overflow-hidden text-white rounded-md dark:bg-white/5 ">
        <div className="flex flex-col w-full h-full">
          <p className="mb-2">便利貼</p>
          <FriendNote />
        </div>
      </section>
    </div>
  );
}
