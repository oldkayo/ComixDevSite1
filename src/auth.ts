import NextAuth from "next-auth";
import { db } from "./lib/db";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null; // User doesn't exist
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        points: user.points,
        role: user.role,
      };
    }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // First map standard properties
      const updatedToken = await authConfig.callbacks.jwt({ token, user, trigger, session } as any);
      
      if (trigger === "update" && session) {
        if (session.name) updatedToken.name = session.name;
        if (session.image) updatedToken.image = session.image;
        if (session.points !== undefined) updatedToken.points = session.points;
      }

      // Dynamically query Neon PostgreSQL to resolve stale token cache (Role promotions, updates, etc.)
      if (updatedToken.email) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: updatedToken.email },
            select: { id: true, role: true, points: true },
          });
          if (dbUser) {
            updatedToken.id = dbUser.id;
            updatedToken.role = dbUser.role;
            updatedToken.points = dbUser.points;
            console.log("[JWT DB SYNC SUCCESS]", { email: updatedToken.email, role: dbUser.role });
          }
        } catch (error) {
          console.error("[JWT DB SYNC ERROR]", error);
        }
      }

      return updatedToken;
    },
    async session({ session, token }) {
      const updatedSession = await authConfig.callbacks.session({ session, token } as any);
      console.log("[SESSION CALLBACK LOG]", {
        user: updatedSession.user,
      });
      return updatedSession;
    },
  },
});
