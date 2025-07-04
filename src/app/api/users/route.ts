import { NextResponse, NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";
import { fetchUserInfo } from "@/app/lib/services/userService";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token)
      return NextResponse.json({ error: "No authcation" }, { status: 401 });
    const { userId } = await request.json();

    const user = await fetchUserInfo(userId);

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error:" + error },
      { status: 500 }
    );
  }
}
