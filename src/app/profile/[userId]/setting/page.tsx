"use client";
import SettingsForm from "@/app/components/Profile/ui/setting/SettingForm";
import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import { use } from "react";

export default function SettingsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { data: session } = useSession();

  if (!session || userId !== session.user.id) return notFound();

  return (
    <div className="flex flex-col items-center w-full h-full p-4 overflow-y-auto">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold dark:text-white">設定</h1>
        <SettingsForm user={session.user} />
      </div>
    </div>
  );
}
