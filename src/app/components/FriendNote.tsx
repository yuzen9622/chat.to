"use client";
import React from "react";

import NoteCard from "./ui/NoteCard";
import { useAuthStore } from "../store/AuthStore";
import { useSession } from "next-auth/react";

export default function FriendNote() {
  const { friendNote } = useAuthStore();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col h-full overflow-auto">
      {session?.user?.note && (
        <NoteCard key={session.user.id} note={session.user.note} />
      )}
      {friendNote &&
        friendNote.map((note) => <NoteCard key={note.id} note={note} />)}
    </div>
  );
}
