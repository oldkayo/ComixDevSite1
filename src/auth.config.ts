import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role;
      
      console.log("[MIDDLEWARE AUTHORIZED LOG]", {
        email: auth?.user?.email,
        isLoggedIn,
        role,
        pathname: nextUrl.pathname
      });
      
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      
      if (isOnAdmin) {
        if (!isLoggedIn) return false; // Redirects unauthenticated to /login
        if (role !== "ADMIN") {
          // Normal users trying to access admin are redirected to dashboard
          return Response.redirect(new URL("/dashboard/workshops", nextUrl));
        }
        return true;
      }
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirects unauthenticated to /login
      }
      
      if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
        // Redirect logged-in users based on their role
        const destination = role === "ADMIN" ? "/admin/workshops" : "/dashboard/workshops";
        return Response.redirect(new URL(destination, nextUrl));
      }
      
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.points = user.points ?? 0;
        token.role = (user as any).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.points = token.points as number;
        session.user.role = token.role as string;
        if (token.name) session.user.name = token.name as string;
        if (token.image) session.user.image = token.image as string;
      }
      return session;
    },
  },
  providers: [], // Configured inside src/auth.ts with full DB adapter access
} satisfies NextAuthConfig;
