import React from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  if (!userId) return null;
  return <div>{userId}</div>;
}
