"use client";
import React from "react";

import NoteCard from "./ui/NoteCard";
import { useAuthStore } from "../store/AuthStore";

import { NoteInterface } from "../lib/type";

export default function FriendNote({
  userNote,
}: {
  userNote: NoteInterface | null;
}) {
  const { friendNote } = useAuthStore();

  return (
    <div className="flex flex-col h-full overflow-auto">
      {userNote && <NoteCard key={userNote.id} note={userNote} />}
      {friendNote &&
        friendNote.map((note) => <NoteCard key={note.id} note={note} />)}
    </div>
  );
}
