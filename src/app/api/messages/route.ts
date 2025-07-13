import { Client2ServerMessage } from "@/app/lib/util";
import { insertMessage } from "@/server/services/messageService";

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });
  try {
    const message = await request.json();

    message.status = "send";
    const serverMessage = Client2ServerMessage(message);

    const data = await insertMessage(serverMessage);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
