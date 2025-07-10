import { deleteNote } from "@/app/lib/services/noteService";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const { noteId } = await request.json();
    const token = await getToken({ req: request });

    if (!token || !noteId) {
      throw "No authentication or noteId.";
    }

    await deleteNote(noteId);
    return NextResponse.json({ success: true, error: null }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
};
