import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabasedb";

export async function GET() {
  const { data, error } = await supabase.from("rooms").select("*");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    console.log(userId);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error:" + error },
      { status: 500 }
    );
  }
}
