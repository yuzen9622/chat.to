import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const isLoginPage = url.pathname === "/auth/login";
    const token = await getToken({ req });

    if (isLoginPage && token) {
      console.log(url.pathname, token);
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/chat/:path*", "/", "/friend"],
};
