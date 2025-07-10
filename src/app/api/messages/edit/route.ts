import { updateMessage } from "@/server/services/messageService";

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });
  try {
    const { id, text } = await request.json();

    await updateMessage(id, text);
    return NextResponse.json({});
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
