import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ error: "No authication" }, { status: 401 });
  }
  try {
    const roomId = (await params).roomId;
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get("start") as number | null;
    const end = searchParams.get("end") as number | null;
    if (!start || !end) {
      return NextResponse.json({ error: "No message range" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*,reply(*)")
      .eq("room", roomId)
      .order("created_at", { ascending: false })
      .range(start, end);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    data.reverse();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
