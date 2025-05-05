// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession } from "next-auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type JWT } from "next-auth/jwt";
import { NoteInterface, UserInterface } from "@/app/lib/type";
import { ProviderType } from "@/app/lib/type";
declare module "next-auth" {
  // Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
  interface Session {
    // A JWT which can be used as Authorization header with supabase-js for RLS.
    supabaseAccessToken?: string;
    userId?: string;
    user: UserInterface;
  }
  interface User extends UserInterface {
    provider: ProviderType;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    provider: ProviderType;
    note: NoteInterface;
  }
}
