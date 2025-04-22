import { supabase } from "@/app/lib/supabasedb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query, userId } = await request.json();
    const searchQuery = `%${query}%`;
    console.log(searchQuery);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .ilike("name", searchQuery)
      .neq("id", userId);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
