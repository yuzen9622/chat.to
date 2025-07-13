import { Client2ServerMessage } from "@/app/lib/util";
import { insertMessage } from "@/server/services/messageService";
import { ClientMessageInterface, Forward } from "@/types/type";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const {
    message,
    targets,
  }: { message: ClientMessageInterface; targets: Forward[] } =
    await request.json();
  const token = getToken({ req: request });
  if (!token)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });
  try {
    const forwardMessages = await Promise.all(
      targets.map(async (target) => {
        message.room = target.room_id;
        message.status = "send";
        const serverMessage = Client2ServerMessage(message);
        console.log(serverMessage);
        const msg = await insertMessage(serverMessage);
        return msg;
      })
    );

    return NextResponse.json(
      { success: true, error: null, messages: forwardMessages },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error, messages: null },
      { status: 500 }
    );
  }
};
