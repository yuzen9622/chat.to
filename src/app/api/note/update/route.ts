import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, user_id, is_public } = await req.json();
  try {
    const { data, error } = await supabase
      .from("user_note")
      .select("*")
      .eq("user_id", user_id);
    if (error) {
      return NextResponse.json(error, { status: 500 });
    }
    console.log(data);
    if (data && data.length === 0) {
      const { data: newData } = await supabase
        .from("user_note")
        .insert([{ text, user_id, public: is_public }])
        .select("*")
        .single();

      return NextResponse.json(newData, { status: 200 });
    }
    const { data: updateData } = await supabase
      .from("user_note")
      .update({ text: text, public: is_public, updated_at: new Date() })
      .eq("user_id", user_id)
      .select("*")
      .single();

    console.log(updateData);
    return NextResponse.json(updateData, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
