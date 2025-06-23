import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SECRET_ROLE_KEY!
);
export async function POST(req: NextRequest) {
  try {
    const { email, password, image, name } = await req.json();
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("provider", "credentials");
    if (data && data.length > 0) {
      return NextResponse.json(
        { success: false, error: "電子郵件已被使用" },
        { status: 401 }
      );
    }
    const { error } = await supabase.from("users").insert([
      {
        email,
        image: image,
        name,
        password: await bcrypt.hash(password, 10),
      },
    ]);

    if (error) {
      return NextResponse.json(
        { success: false, error: "資料庫錯誤" },
        { status: 401 }
      );
    }
    return NextResponse.json({ success: true, error: null }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: "伺服器錯誤" },
      { status: 500 }
    );
  }
}
