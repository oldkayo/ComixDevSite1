import React from "react";
import type { Metadata } from "next";
import { getSEOSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import Link from "next/link";
import { Calendar, MapPin, Users, Award, ShieldAlert, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOSettings("events");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: seo.ogImage ? { images: [seo.ogImage] } : undefined,
  };
}

export default async function EventsPage() {
  // Fetch published events
  let events: any[] = [];
  try {
    events = await db.event.findMany({
      where: { isPublished: true },
      orderBy: { startDate: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch public events list:", error);
  }

  return (
    <div className="w-full py-12 md:py-20 min-h-screen bg-gray-950 text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        
        {/* Header section */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">
            الفعاليات والمؤتمرات
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            استعرض المؤتمرات التقنية، والهاكاثونات، وورش العمل الكبرى التي أقامتها أو استضافتها منصة ComixDev.
          </p>
        </div>

        {/* Events Grid layout */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const startFormatted = new Date(event.startDate).toLocaleDateString("ar-EG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div 
                  key={event.id} 
                  className="glass rounded-2xl overflow-hidden flex flex-col justify-between border border-white/5 relative group hover:border-neon-cyan/20 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/5"
                >
                  
                  {/* Image Cover */}
                  <div className="relative w-full h-48 bg-gray-900 overflow-hidden">
                    <img
                      src={event.coverImage || "/images/workshop_ai.png"}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />
                    
                    {/* Hosted by badge */}
                    <div className="absolute top-4 left-4 bg-neon-purple/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md shadow-neon-purple/20">
                      مستضاف بواسطة: {event.hostedBy}
                    </div>
                  </div>

                  {/* Details body */}
                  <div className="p-6 flex flex-col flex-grow space-y-4">
                    
                    <div className="space-y-1.5 flex-grow">
                      <h3 className="text-base md:text-lg font-bold text-white group-hover:text-neon-cyan transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                    </div>

                    {/* Metadata lines */}
                    <div className="grid grid-cols-1 gap-2 pt-3 text-xs text-gray-400 border-t border-white/5 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-neon-cyan shrink-0" />
                        <span>تاريخ البدء: {startFormatted}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-neon-cyan shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-neon-cyan shrink-0" />
                        <span>عدد الحضور: {event.attendeeCount}+ مهتم</span>
                      </div>
                    </div>

                    {/* CTA button */}
                    <div className="pt-2">
                      <Link
                        href={`/events/${event.slug}`}
                        className={buttonVariants({
                          className: "w-full bg-white/5 hover:bg-neon-cyan hover:text-gray-950 text-white transition-all duration-300 border border-white/10 hover:border-neon-cyan inline-flex items-center justify-center gap-1.5 h-9 rounded-xl"
                        })}
                      >
                        عرض التفاصيل والتغطية
                        <ArrowLeft className="w-4 h-4 mr-1" />
                      </Link>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-950/20 rounded-2xl border border-white/5 max-w-md mx-auto space-y-4">
            <ShieldAlert className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-gray-400 text-sm">عذراً، لا توجد فعاليات معلنة في قاعدة البيانات حالياً.</p>
          </div>
        )}

      </div>
    </div>
  );
}
