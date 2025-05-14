import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authication" }, { status: 401 });

  try {
    const { user_id, friend_id } = await request.json();
    const { error } = await supabase
      .from("friends")
      .delete()
      .or(
        `and(user_id.eq.${user_id},friend_id.eq.${friend_id}),and(user_id.eq.${friend_id},friend_id.eq.${user_id})`
      );

    const { error: requestError } = await supabase
      .from("friends_requests")
      .delete()
      .or(
        `and(sender_id.eq.${user_id},receiver_id.eq.${friend_id}),and(sender_id.eq.${friend_id},receiver_id.eq.${user_id})`
      );
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    if (requestError) {
      return NextResponse.json({ requestError }, { status: 500 });
    }
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
