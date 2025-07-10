import { queryUsers } from "@/server/services/userService";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const { query, userId } = await request.json();
  const token = getToken({ req: request });
  if (!token) {
    return NextResponse.json({ error: "No authentication" }, { status: 401 });
  }
  try {
    const searchQuery = `%${query}%`;
    const data = await queryUsers(searchQuery, userId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};
