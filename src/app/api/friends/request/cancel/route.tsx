import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  try {
    const { error } = await supabase
      .from("friends_requests")
      .delete()
      .eq("id", id);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: "Server Error." },
      { status: 500 }
    );
  }
}
