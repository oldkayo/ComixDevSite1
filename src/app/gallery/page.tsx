import React from "react";
import type { Metadata } from "next";
import { getSEOSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import Link from "next/link";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Film, Image as ImageIcon, Camera, Filter } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOSettings("gallery");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: seo.ogImage ? { images: [seo.ogImage] } : undefined,
  };
}

interface PageProps {
  searchParams: Promise<{
    eventId?: string;
  }>;
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const activeEventId = resolvedParams.eventId || "ALL";

  // 1. Fetch published events
  let events: any[] = [];
  try {
    events = await db.event.findMany({
      where: { isPublished: true },
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        title: true,
      },
    });
  } catch (error) {
    console.error("Failed to query events for gallery filters:", error);
  }

  // 2. Fetch gallery items matching selection
  let items: any[] = [];
  try {
    items = await db.galleryItem.findMany({
      where: {
        event: {
          isPublished: true,
        },
        eventId: activeEventId !== "ALL" ? activeEventId : undefined,
      },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to query gallery items:", error);
  }

  return (
    <div className="w-full py-12 md:py-20 min-h-screen bg-gray-950 relative overflow-hidden">
      
      {/* Blurs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white flex items-center justify-center gap-3">
            <Camera className="w-8 h-8 text-neon-cyan" />
            معرض الوسائط والفعاليات
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed text-center">
            تصفح ألبوم الصور والتغطيات التلفزيونية والفعاليات والهاكاثونات البرمجية السابقة لـ ComixDev.
          </p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col items-center gap-3 text-right" dir="rtl">
          <span className="text-xs text-gray-500 font-bold flex items-center gap-1.5 self-center">
            <Filter className="w-4 h-4 text-neon-cyan" />
            تصفية الصور والفيديوهات حسب الحدث:
          </span>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/gallery"
              className={buttonVariants({
                variant: activeEventId === "ALL" ? "default" : "outline",
                className: `rounded-xl transition-all text-xs font-semibold px-4 h-9 cursor-pointer ${
                  activeEventId === "ALL"
                    ? "bg-gradient-to-r from-neon-cyan to-neon-blue text-white"
                    : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
                }`
              })}
            >
              الكل
            </Link>

            {events.map((ev) => {
              const isActive = activeEventId === ev.id;
              return (
                <Link
                  key={ev.id}
                  href={`/gallery?eventId=${ev.id}`}
                  className={buttonVariants({
                    variant: isActive ? "default" : "outline",
                    className: `rounded-xl transition-all text-xs font-semibold px-4 h-9 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-neon-cyan to-neon-blue text-white"
                        : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
                    }`
                  })}
                >
                  {ev.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Masonry Grid Render */}
        {items.length > 0 ? (
          <div className="pt-4">
            <GalleryGrid items={items} />
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-950/20 rounded-2xl border border-white/5 max-w-md mx-auto space-y-4">
            <ImageIcon className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-gray-400 text-sm">عذراً، لا توجد تغطيات وسائط مضافة لهذا الحدث حالياً.</p>
          </div>
        )}

      </div>
    </div>
  );
}
