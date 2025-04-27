"use client";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import NoteCard from "./components/NoteCard";
import NoteButton from "./components/NoteButton";
import { useAuthStore } from "./store/AuthStore";
export default function Home() {
  const user = useSession().data?.user;
  const { friendNote, friends } = useAuthStore();
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2 p-2 flex-nowrap">
      <section className="flex items-start justify-center w-full p-3 px-4 rounded-md min-w-fit h-fit dark:bg-white/5">
        <span className="flex items-center gap-8 mt-3 dark:text-white">
          <div className="relative w-fit h-fit">
            <Image
              className="w-24 h-24 rounded-full"
              src={user?.image || "/user.png"}
              width={100}
              height={100}
              alt="avatar"
            />
            <NoteButton />
          </div>

          <div className="flex flex-col gap-2 ">
            <span className="flex gap-2">
              <p className="text-2xl font-semibold">{user?.name}</p>
              <button className="p-1 text-sm rounded-md dark:bg-white/10">
                編輯個人資料
              </button>
            </span>

            <Link className="" href={"/friend"}>
              {friends?.length} 位朋友{" "}
            </Link>
            <p>{user?.email}</p>
            <span className="flex gap-2">
              <button className="p-1 text-sm rounded-md dark:bg-white/10">
                切換帳號
              </button>
              <button
                onClick={() => signOut()}
                className="p-1 px-2 text-sm rounded-md dark:bg-red-500"
              >
                登出
              </button>
            </span>
          </div>
        </span>
      </section>
      <section className="flex w-full h-full p-3 px-4 text-white rounded-md dark:bg-white/5 ">
        <div className="w-1/2 h-full ">
          <p className="mb-2">便利貼</p>
          {friendNote &&
            friendNote.map((note) => <NoteCard key={note.id} note={note} />)}
        </div>
      </section>
    </div>
  );
}
