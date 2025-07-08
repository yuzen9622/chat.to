import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });
  try {
    const { userId } = await request.json();
    const { data, error } = await supabase
      .from("friends_requests")
      .select("*")
      .eq("status", "pending")
      .or(`receiver_id.eq.${userId},sender_id.eq.${userId}`);

    if (error) {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
