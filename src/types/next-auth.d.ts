import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      points: number;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    points?: number;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    points: number;
    role: string;
    name?: string | null;
    image?: string | null;
  }
}
