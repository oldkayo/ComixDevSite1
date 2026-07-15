import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const authMiddleware = NextAuth(authConfig).auth;

export const proxy = authMiddleware((req) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  // Protect all paths except for API routes, Next.js static/image optimization files, and favicon
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
