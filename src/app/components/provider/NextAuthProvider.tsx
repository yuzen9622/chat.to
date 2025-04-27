"use client";
import { useSession } from "next-auth/react";
import React from "react";
import ChatProvider from "./ChatProvider";
import ClientLayout from "../ClientLayout";

export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  return (
    <>
      {session.status === "unauthenticated" ? (
        <>{children}</>
      ) : (
        <ChatProvider>
          <ClientLayout>{children}</ClientLayout>
        </ChatProvider>
      )}
    </>
  );
}
