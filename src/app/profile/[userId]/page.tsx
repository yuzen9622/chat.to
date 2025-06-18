import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

import { supabase } from "@/app/lib/supabasedb";
import { notFound } from "next/navigation";
import ProfileCard from "@/app/components/Profile/ui/ProfileCard";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const data = await getServerSession(authOptions);
  const user = await supabase
    .from("users")
    .select("*, user_note(*,user:users(image))")
    .eq("id", userId)
    .maybeSingle();
  if (!user) return {};
  return {
    title: `${data && user.data.id === data.userId ? "你" : user.data.name}`,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const [user, friends] = await Promise.all([
    supabase
      .from("users")
      .select("*, user_note(*,user:users(image))")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("friends")
      .select("*, user:users!friends_friend_id_fkey(*)")
      .eq("user_id", userId),
  ]);
  if (!user.data) {
    return notFound();
  }

  return (
    <div className="flex flex-col items-center w-full h-full gap-4 p-4 overflow-y-auto">
      {/* 個人資料卡片 */}
      <ProfileCard
        user={user.data}
        note={user.data.user_note[0]}
        friends={friends.data!}
      />

      {/* 最近動態 */}
      <section className="w-full max-w-2xl">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">最近動態</h2>
        <div className="flex items-center justify-center dark:text-white ">
          暫無動態
        </div>
      </section>
    </div>
  );
}
