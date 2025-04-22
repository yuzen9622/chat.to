import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { id, text } = await request.json();

    const { error } = await supabase
      .from("messages")
      .update({ text })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json({});
  } catch (error) {
    console.log(error);
  }
}
