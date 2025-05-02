import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authication" }, { status: 401 });
  try {
    const { userId } = await request.json();
    const { data, error } = await supabase
      .from("friends")
      .select("users:users!friends_friend_id_fkey(*)")
      .eq("user_id", userId);

    const users = data?.map((item) => item.users);
    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.log(error);
  }
}
