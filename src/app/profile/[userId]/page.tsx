import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

import NoteButton from "@/app/components/ui/NoteButton";
import Image from "next/image";
import EditProtofileBtn from "@/app/components/ui/EditProtofileBtn";
import { supabase } from "@/app/lib/supabasedb";
import { notFound } from "next/navigation";
import FriendBtn from "@/app/components/Profile/ui/FriendBtn";
import FriendModal from "@/app/components/Profile/ui/FriendModal";
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
  const session = await getServerSession(authOptions);
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

  const isOwn = session?.userId === userId;

  return (
    <div className="flex flex-col items-center w-full h-full gap-4 p-4 overflow-y-auto">
      {/* 個人資料卡片 */}
      <section className="w-full max-w-2xl p-6 text-white rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative flex flex-col items-center gap-4 dark:text-white">
            <div className="relative ">
              <Image
                className="object-cover w-32 h-32 rounded-full ring-2 ring-blue-500 dark:ring-white"
                src={user.data.image || "/user.png"}
                width={128}
                height={128}
                priority
                alt="avatar"
              />

              <NoteButton note={user.data.user_note[0]} />
            </div>

            {isOwn && <EditProtofileBtn />}
          </div>

          <div className="flex flex-col items-center gap-3 sm:items-start">
            <h1 className="text-2xl font-bold dark:text-white">
              {user.data.name}
              {isOwn && (
                <span className="ml-2 text-sm text-blue-100">(你)</span>
              )}
            </h1>
            <h2 className=" dark:text-white"> {user.data.email}</h2>

            <div className="flex gap-4">
              <FriendModal friends={friends.data} />
            </div>
            {!isOwn && <FriendBtn id={userId} />}
          </div>
        </div>
      </section>

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
