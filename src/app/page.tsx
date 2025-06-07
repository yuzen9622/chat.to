"use client";
import Image from "next/image";
import Link from "next/link";
import NoteButton from "./components/ui/NoteButton";
import EditProtofileBtn from "@/app/components/ui/EditProtofileBtn";

import LogoutBtn from "./components/ui/LogoutBtn";
import { useSession } from "next-auth/react";
import { useAuthStore } from "./store/AuthStore";
import { useEffect } from "react";

import { fetchFriendNote } from "./lib/util";

export default function Home() {
  const { data: session } = useSession();
  const { friends, userNote, setUserNote } = useAuthStore();

  useEffect(() => {
    const getNote = async () => {
      if (!session?.user) return;
      try {
        const data = await fetchFriendNote([session.userId!]);
        setUserNote(data[0]);
      } catch (error) {
        console.log(error);
      }
    };
    getNote();
  }, [session, setUserNote]);

  return (
    <div className="flex flex-col items-center w-full h-full gap-2 p-2 overflow-hidden flex-nowrap">
      <section className="flex flex-col items-center justify-start w-full p-3 px-4 rounded-md min-w-fit h-fit ">
        <span className="flex items-center gap-8 mt-3 dark:text-white">
          <div className="relative w-fit h-fit">
            <Image
              className="w-24 h-24 rounded-full"
              src={session?.user?.image || "/user.png"}
              width={100}
              height={100}
              alt="avatar"
            />
            <NoteButton note={userNote || null} />
          </div>

          <div className="flex flex-col gap-2 ">
            <span className="flex gap-2">
              <p className="text-2xl font-semibold">{session?.user?.name}</p>
            </span>

            <Link className="active:dark:text-white/10" href={"/friend"}>
              {friends?.length} 位朋友
            </Link>
            <p>{session?.user?.email}</p>
            <span className="flex gap-4">
              {/* <button className="p-1 text-sm rounded-md bg-stone-200 dark:bg-white/10">
                切換帳號
              </button> */}
              <EditProtofileBtn />
              <LogoutBtn />
            </span>
          </div>
        </span>
      </section>
    </div>
  );
}
