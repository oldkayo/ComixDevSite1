import React from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Award,
  ShieldAlert,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { buttonVariants } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let event: any = null;
  try {
    event = await db.event.findUnique({
      where: { slug },
      include: {
        galleryItems: {
          orderBy: { createdAt: "desc" },
        },
        eventPartners: {
          include: { partner: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to query event by slug:", error);
  }

  if (!event || !event.isPublished) {
    return (
      <div className="w-full py-12 min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center py-20 bg-gray-950/20 rounded-xl border border-white/5 max-w-md mx-auto space-y-4">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 inline-flex">
            <Calendar className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">
            الفعالية غير موجودة أو تم حذفها
          </h2>
          <p className="text-sm text-gray-400">
            لا توجد فعالية بهذا الرابط أو قد تم إيقاف نشرها.
          </p>
          <Link
            href="/events"
            className={buttonVariants({
              className:
                "bg-gradient-to-r from-neon-cyan to-neon-blue text-white text-sm px-4 h-9",
            })}
          >
            العودة إلى جميع الفعاليات
          </Link>
        </div>
      </div>
    );
  }

  const startFormatted = new Date(event.startDate).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const endFormatted = new Date(event.endDate).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="w-full py-12 md:py-20 min-h-screen bg-gray-950 text-right"
      dir="rtl"
    >
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-4xl space-y-8 relative z-10">
        {/* Navigation back */}
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          العودة لكافة الفعاليات
        </Link>

        {/* Event details block */}
        <div className="glass rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col">
          {/* Cover image banner */}
          <div className="relative w-full h-[300px] md:h-[400px] bg-gray-900">
            <img
              src={event.coverImage || "/images/workshop_ai.png"}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

            <div className="absolute bottom-6 right-6 left-6 space-y-2">
              <span className="px-3 py-1 rounded-full bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan text-xs font-bold font-mono">
                مستضاف بواسطة: {event.hostedBy}
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mt-2">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Details body */}
          <div className="p-6 md:p-10 space-y-8">
            {/* Meta Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/5 pb-6 text-sm text-gray-400 font-mono">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neon-cyan" />
                <div>
                  <span className="text-[10px] text-gray-500 block">
                    التاريخ والموعد:
                  </span>
                  <span className="text-white text-xs">
                    {startFormatted} - {endFormatted}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neon-cyan" />
                <div>
                  <span className="text-[10px] text-gray-500 block">
                    الموقع الجغرافي:
                  </span>
                  <span className="text-white text-xs truncate max-w-[200px] block">
                    {event.location}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neon-cyan" />
                <div>
                  <span className="text-[10px] text-gray-500 block">
                    عدد الحضور التقديري:
                  </span>
                  <span className="text-white text-xs">
                    {event.attendeeCount}+ مشارك مهتم
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white">تفاصيل الفعالية</h2>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Partners section */}
            {event.eventPartners.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-neon-purple" />
                  الشركاء والجهات الداعمة
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {event.eventPartners.map((eventPartner: any) => {
                    const partner = eventPartner.partner;
                    return (
                      <div
                        key={eventPartner.id}
                        className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-between text-center space-y-3 hover:border-white/10 transition-colors"
                      >
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="h-10 object-contain brightness-95 opacity-80"
                        />
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white block">
                            {partner.name}
                          </span>
                          {partner.description && (
                            <span className="text-[10px] text-gray-400 block line-clamp-1">
                              {partner.description}
                            </span>
                          )}
                        </div>
                        {partner.website && (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-neon-cyan hover:underline font-mono"
                          >
                            الموقع الإلكتروني
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Media Gallery items */}
            {event.galleryItems.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-white/5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-neon-cyan" />
                  تغطية الوسائط (الصور والفيديوهات)
                </h2>

                {/* Mount the GalleryGrid component with dynamic records */}
                <GalleryGrid
                  items={event.galleryItems.map((item: any) => ({
                    id: item.id,
                    type: item.type,
                    fileUrl: item.fileUrl,
                    title: item.title,
                    thumbnail: item.thumbnail,
                    event: {
                      title: event.title,
                    },
                  }))}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
