import { db } from "./db";
import { headers } from "next/headers";

/**
 * Basic IP and Key (Email) based rate limiter for Server Actions.
 * Stored in Neon PostgreSQL to ensure state persistence across stateless serverless edge functions.
 */
export async function rateLimit(action: string, key: string, limit: number, windowSeconds: number) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  // Periodic inline cleanup to keep the PostgreSQL database clean
  try {
    await db.rateLimit.deleteMany({
      where: {
        timestamp: { lt: windowStart },
      },
    });
  } catch (e) {
    console.error("Rate-limit database cleanup failed:", e);
  }

  // Check how many times the IP or Key has called this action in the time window
  const count = await db.rateLimit.count({
    where: {
      action,
      timestamp: { gte: windowStart },
      OR: [
        { ip },
        { key },
      ],
    },
  });

  if (count >= limit) {
    throw new Error("لقد تجاوزت الحد المسموح به من المحاولات. يرجى الانتظار قليلاً والمحاولة مجدداً.");
  }

  // Log the new attempt
  await db.rateLimit.create({
    data: {
      action,
      ip,
      key,
    },
  });
}
