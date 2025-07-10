import { selectNote } from "@/app/lib/services/noteService";

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req: req });
  if (!token)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });
  const { ids } = await req.json();
  try {
    const data = await selectNote(ids);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
