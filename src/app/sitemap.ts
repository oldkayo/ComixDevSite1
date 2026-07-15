import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://comixdev.com";

  const staticRoutes = [
    "",
    "/about",
    "/workshops",
    "/prompts",
    "/events",
    "/partners",
    "/contact",
    "/connect",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  let dynamicWorkshops: any[] = [];
  let dynamicPrompts: any[] = [];

  try {
    dynamicWorkshops = await db.workshop.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    dynamicPrompts = await db.prompt.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
  } catch (e) {
    console.error("Failed to query sitemap dynamic paths:", e);
  }

  const workshopRoutes = dynamicWorkshops.map((w) => ({
    url: `${baseUrl}/workshops/${w.slug}`,
    lastModified: w.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const promptRoutes = dynamicPrompts.map((p) => ({
    url: `${baseUrl}/prompts/${p.slug}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...workshopRoutes, ...promptRoutes];
}
