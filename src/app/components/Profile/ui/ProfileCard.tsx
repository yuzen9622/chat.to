"use client";
import { FriendInterface, NoteInterface, UserInterface } from "@/types/type";
import Image from "next/image";
import React from "react";
import NoteButton from "../../ui/NoteButton";

import FriendBtn from "./FriendBtn";
import FriendModal from "./FriendModal";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ProfileCard({
  user,
  note,
  friends,
}: {
  user: UserInterface;
  note?: NoteInterface;
  friends?: FriendInterface[];
}) {
  const { data: session } = useSession();
  const isOwn = session?.userId === user.id;
  return (
    <section className="w-full max-w-2xl p-6 text-white shadow-lg shadow-blue-400/50 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 backdrop-blur-xl">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative flex flex-col items-center gap-4 dark:text-white">
          <div className="relative ">
            <Image
              className="object-cover w-32 h-32 rounded-full ring-2 ring-blue-500 dark:ring-white"
              src={user.image || "/user.png"}
              width={128}
              height={128}
              priority
              alt="avatar"
            />
            {note && <NoteButton note={note} />}
          </div>

          {isOwn && (
            <Link
              href={`/profile/${user.id}/setting`}
              className="px-3 py-1 text-sm text-center text-blue-500 bg-white rounded-md"
            >
              編輯個人頁面
            </Link>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-start">
          <h1 className="text-2xl font-bold dark:text-white">
            {user.name}
            {isOwn && <span className="ml-2 text-sm text-blue-100">(你)</span>}
          </h1>
          <h2 className=" dark:text-white"> {user.email}</h2>
          {friends && (
            <div className="flex gap-4">
              <FriendModal friends={friends} />
            </div>
          )}

          {!isOwn && <FriendBtn id={user.id} />}
        </div>
      </div>
    </section>
  );
}
