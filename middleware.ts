export { proxy as middleware } from "@/proxy";

export const config = {
  // Exclude Auth.js API routes, Next.js internals, and static assets from middleware
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
