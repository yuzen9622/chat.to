"use client";
import { signOut, useSession } from "next-auth/react";
export default function Home() {
  const session = useSession();
  return (
    <div className="flex items-center justify-center w-full h-full ">
      <p>{session.data?.userId}</p>
      <button onClick={() => signOut()}>logout</button>
    </div>
  );
}
