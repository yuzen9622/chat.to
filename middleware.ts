// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// middleware 本體
export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;
  console.log(pathname);
  // ✅ 如果登入中，又嘗試訪問 /login，導回首頁
  if (token && pathname === "/api/auth/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ 如果沒登入，卻想進入 /chat 開頭的頁面，導回 login
  if (!token && pathname.startsWith("/chat")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// ✅ 設定哪些路徑會被 middleware 攔截
export const config = {
  matcher: ["/login", "/chat/:path*"], // 根據需求加更多路徑
};
