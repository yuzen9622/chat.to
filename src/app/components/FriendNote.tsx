import React from "react";
import { supabase } from "../lib/supabasedb";
import NoteCard from "./NoteCard";

export default async function FriendNote({ users }: { users: string[] }) {
  const { data: notes } = await supabase
    .from("user_note")
    .select("*")
    .in("user_id", users)
    .order("created_at");
  return (
    <>{notes && notes.map((note) => <NoteCard key={note.id} note={note} />)}</>
  );
}
