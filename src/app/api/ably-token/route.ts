import * as Ably from "ably";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const clientId = body.get("clientId") as string;

  if (clientId == null) {
    return NextResponse.json("You must login before connecting to Ably", {
      status: 401,
    });
  }

  const ably = new Ably.Rest(process.env.ABLY_API_KEY!);
  const tokenRequestData = await ably.auth.createTokenRequest({
    clientId: clientId,
  });

  return NextResponse.json(tokenRequestData);
}
