import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabasedb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession(authOptions);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user?.userId);

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
