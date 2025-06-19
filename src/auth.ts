import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { NoteInterface } from "@/types/type";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SECRET_ROLE_KEY!
);
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
    CredentialProvider({
      name: "credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password }: { email: string; password: string } =
          credentials!;
        if (!email || !password) {
          throw new Error("請輸入必填欄位");
        }
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .limit(1)
          .eq("email", email)
          .eq("provider", "credentials")
          .maybeSingle();
        console.log(user);
        if (error || !user) {
          throw new Error("帳戶不存在");
        }

        if (user.password) {
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            throw new Error("帳戶或密碼錯誤");
          }
        }
        return user;
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email)
        .eq("provider", account?.provider)
        .limit(1)
        .maybeSingle();

      if (error) {
        return false;
      }

      if (
        !data &&
        (account?.provider === "google" || account?.provider === "github")
      ) {
        const { data: thirdPartUser } = await supabase
          .from("users")
          .insert([
            {
              name: user.name,
              email: user.email,
              image: user.image,
              provider: account?.provider,
            },
          ])
          .select("*")
          .limit(1)
          .maybeSingle();
        const { data: note } = await supabase
          .from("user_note")
          .select("*,user:users(id,name,image)")
          .eq("user_id", thirdPartUser.id);
        if (note) {
          user.note = note[0];
        }

        user.id = thirdPartUser.id;
        user.provider = account?.provider;
        return true;
      } else if (data) {
        const { data: note } = await supabase
          .from("user_note")
          .select("*,user:users(id,name,image)")
          .eq("user_id", data.id);
        console.log(data);

        if (note) {
          user.note = note[0];
        }
        user.id = data.id;
        user.name = data.name;
        user.image = data.image;
        user.email = data.email;
        return true;
      }

      return false;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id ?? token.sub;
        token.email = user.email;
        token.picture = user.image;
        token.name = user.name;
        token.note = user.note as NoteInterface;
        token.provider = user.provider;
      }
      if (trigger === "update" && session) {
        token.sub = session.id ?? token.sub;
        token.email = session.email;
        token.picture = session.image;
        token.name = session.name;
        token.note = session.note as NoteInterface;
        token.provider = session.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.userId = token.sub;
        session.user = {
          id: token.sub!,
          email: token.email!,
          name: token.name!,
          image: token.picture!,
          provider: token.provider,
          note: token.note,
        };
      }
      return session;
    },
  },
};
