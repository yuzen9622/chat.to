import { NextResponse } from "next/server";

import { updateRoomTheme } from "@/server/services/roomService";

import type { NextRequest } from "next/server";
export const POST = async (request: NextRequest) => {
  const { roomId, roomTheme } = await request.json();
  try {
    await updateRoomTheme(roomId, roomTheme);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
};
