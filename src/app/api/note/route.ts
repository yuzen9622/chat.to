import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req: req });
  if (!token)
    return NextResponse.json({ error: "No authication" }, { status: 401 });
  const { ids } = await req.json();
  try {
    const { data, error } = await supabase
      .from("user_note")
      .select("*")
      .in("user_id", ids)
      .order("created_at");
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
