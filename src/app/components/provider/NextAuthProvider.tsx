"use client";
import { useSession } from "next-auth/react";
import React, { useCallback } from "react";
import ChatProvider from "./ChatProvider";
import ClientLayout from "../layout/ClientLayout";
import { Alert, Snackbar } from "@mui/material";
import { useAuthStore } from "@/app/store/AuthStore";

export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const { systemAlert, setSystemAlert } = useAuthStore();
  const handleClose = useCallback(() => {
    setSystemAlert({ ...systemAlert, open: false });
  }, [systemAlert, setSystemAlert]);
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={handleClose}
        autoHideDuration={5000}
        open={systemAlert.open}
      >
        <Alert
          onClose={handleClose}
          severity={systemAlert.severity}
          variant={systemAlert.variant}
        >
          {systemAlert.text}
        </Alert>
      </Snackbar>
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
