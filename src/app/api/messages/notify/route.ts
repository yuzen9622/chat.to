import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });
  try {
    const { userId, rooms } = await request.json();

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .in("room", rooms)
      .not("is_read", "cs", `{${userId}}`);

    if (error) {
      console.log(error.message);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};
