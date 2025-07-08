import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { twMerge } from "tailwind-merge";

import SessionProvider from "./components/provider/SessionProvider";
import { authOptions } from "@/auth";
import NextAuthProvider from "./components/provider/NextAuthProvider";
import { ThemeProvider } from "./components/provider/ThemeProvider";

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported but less commonly used
  // interactiveWidget: 'resizes-visual',
};
export const metadata: Metadata = {
  title: {
    template: "%s｜chat.to",
    default: "主頁｜chat.to",
  },
  description: "The modern online chat app",

  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="max-h-dvh">
      <body
        className={twMerge(
          " bg-white dark:bg-neutral-900   h-dvh max-h-dvh overflow-y-hidden  [&::-webkit-scrollbar]:w-2   [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300",

          geistSans.className
        )}
      >
        <SessionProvider session={session}>
          <NextAuthProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </NextAuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
