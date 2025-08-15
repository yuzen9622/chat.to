"use client";
import { useSession } from "next-auth/react";

import ClientLayout from "../components/layout/ClientLayout";
import ChatProvider from "./ChatProvider";

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
