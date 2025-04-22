import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
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
