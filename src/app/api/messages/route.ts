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
    if (message.reply) {
      message.reply = message.reply.id;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([message])
      .select("*,reply(*)")
      .limit(1)
      .maybeSingle();

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
