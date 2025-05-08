"use client";
import React from "react";

import NoteCard from "./ui/NoteCard";
import { useAuthStore } from "../store/AuthStore";

export default function FriendNote() {
  const { friendNote } = useAuthStore();

  return (
    <div className="flex flex-col h-full overflow-auto">
      {friendNote &&
        friendNote.map((note) => <NoteCard key={note.id} note={note} />)}
    </div>
  );
}
