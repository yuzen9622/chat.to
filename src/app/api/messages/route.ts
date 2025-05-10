import { supabase } from "@/app/lib/supabasedb";

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authication" }, { status: 401 });
  try {
    const message = await request.json();

    message.status = "send";
    const { data, error } = await supabase
      .from("messages")
      .insert([message])
      .select("*")
      .limit(1)
      .maybeSingle();
    // const count = await redis.llen(`room:${message.room}`);
    // if (count) {
    //   if (count >= 20) {
    //     await redis.lpop(`room:${message.room}`);
    //   }
    //   await redis.rpushx(`room:${message.room}`, message);
    // }
    if (error) {
      console.log(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
