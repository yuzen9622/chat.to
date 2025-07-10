import {
  insertNote,
  selectNote,
  updateNote,
} from "@/app/lib/services/noteService";

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req: req });
  if (!token)
    return NextResponse.json({ error: "No authentication" }, { status: 401 });
  const { text, user_id, is_public } = await req.json();
  try {
    const data = await selectNote([user_id]);

    if (data && data.length === 0) {
      const newData = await insertNote(user_id, text, is_public);

      return NextResponse.json(newData, { status: 200 });
    }
    const updateData = await updateNote(user_id, text);

    return NextResponse.json(updateData, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
