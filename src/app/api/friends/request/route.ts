import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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
  }
}
