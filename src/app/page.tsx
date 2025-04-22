"use client";
import { signOut } from "next-auth/react";
export default function Home() {
  return (
    <div className="flex items-center justify-center w-full h-full ">
      {" "}
      <button onClick={() => signOut()}>logout</button>
    </div>
  );
}
