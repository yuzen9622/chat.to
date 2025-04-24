import { supabase } from "@/app/lib/supabasedb";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    const { data, error } = await supabase
      .from("friends_requests")
      .update({ status: status })
      .eq("id", id)
      .select("*");

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    if (status !== "accepted") {
      return NextResponse.json({}, { status: 200 });
    }
    console.log(data);

    const friendData = [
      { user_id: data[0].sender_id, friend_id: data[0].receiver_id },
      { user_id: data[0].receiver_id, friend_id: data[0].sender_id },
    ];
    const { error: friendError } = await supabase
      .from("friends")
      .insert(friendData);

    if (friendError) {
      return NextResponse.json({ friendError }, { status: 500 });
    }

    const { data: users, error: userError } = await supabase
      .from("users")
      .select("*")
      .in("id", [data[0].sender_id, data[0].receiver_id]);

    if (userError) {
      return NextResponse.json({ userError }, { status: 500 });
    }

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.log(error);
  }
}
