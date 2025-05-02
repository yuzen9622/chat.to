import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabasedb";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token)
      return NextResponse.json({ error: "No authcation" }, { status: 401 });
    const { userId } = await request.json();

    const { data, error } = await supabase
      .from("users")
      .select("id,image,name")
      .in("id", userId);

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
