import { register } from "@/server/services/authService";
import { findUserByEmail } from "@/server/services/userService";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password, image, name } = await req.json();
    const isExist = await findUserByEmail(email, "credentials");

    if (isExist) {
      return NextResponse.json(
        { success: false, error: "電子郵件已被使用" },
        { status: 401 }
      );
    }
    const hashPassword = await bcrypt.hash(password, 10);
    await register(email, name, hashPassword, image);

    return NextResponse.json({ success: true, error: null }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
