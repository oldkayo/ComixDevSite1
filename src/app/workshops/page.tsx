import React from "react";
import type { Metadata } from "next";
import { getSEOSettings } from "@/lib/settings";
import Link from "next/link";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Clock, Users, Award, Search, ArrowRight, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOSettings("workshops");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: seo.ogImage ? { images: [seo.ogImage] } : undefined,
  };
}

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function WorkshopsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";

  // Fetch only published workshops matching search query from Neon PostgreSQL
  let workshops: any[] = [];
  try {
    workshops = await db.workshop.findMany({
      where: {
        isPublished: true,
        OR: query
          ? [
              { title: { contains: query, mode: "insensitive" } },
              { shortDescription: { contains: query, mode: "insensitive" } },
              { location: { contains: query, mode: "insensitive" } },
            ]
          : undefined,
      },
      orderBy: {
        date: "asc",
      },
    });
  } catch (error) {
    console.error("Database query failed inside workshops directory:", error);
  }

  return (
    <div className="w-full py-16 relative overflow-hidden">
      {/* Background decoration blurs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl space-y-12 relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            الورشات التقنية المباشرة
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            سجل في ورشات العمل التقنية التفاعلية لتطبيق مهاراتك عملياً واكتساب نقاط ولاء مكافئة.
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="max-w-md mx-auto">
          <form method="GET" action="/workshops" className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="ابحث عن ورشة عمل تقنية..."
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan"
            />
          </form>
        </div>

        {/* Workshops Grid */}
        {workshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {workshops.map((workshop) => {
              const defaultImage = "/images/workshop_ai.png";
              return (
                <div key={workshop.id} className="glass rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between h-full shadow-lg">
                  <div>
                    {/* Cover Photo */}
                    <div className="h-48 w-full overflow-hidden relative bg-gray-900">
                      <img
                        src={workshop.image || defaultImage}
                        alt={workshop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute top-3 right-3 bg-neon-cyan/90 backdrop-blur text-gray-950 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow">
                        <Award className="w-3.5 h-3.5" />
                        <span>+{workshop.pointsReward} نقطة ولاء</span>
                      </div>
                    </div>

                    {/* Metadata Content */}
                    <div className="p-6 space-y-4">
                      <h3 className="text-lg font-bold text-white group-hover:text-neon-cyan transition-colors line-clamp-2 leading-snug">
                        {workshop.title}
                      </h3>
                      
                      <p className="text-gray-400 text-xs md:text-sm line-clamp-3 leading-relaxed">
                        {workshop.shortDescription}
                      </p>

                      {/* Technical specifications logs */}
                      <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-neon-cyan shrink-0" />
                          <span>
                            {new Date(workshop.date).toLocaleDateString("ar-EG", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-neon-cyan shrink-0" />
                          <span>المدة: {workshop.duration} دقيقة</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-neon-cyan shrink-0" />
                          <span className="truncate">الموقع: {workshop.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Action */}
                  <div className="px-6 pb-6 pt-2">
                    <Link
                      href={`/workshops/${workshop.slug}`}
                      className={buttonVariants({
                        className: "w-full bg-white/5 hover:bg-neon-cyan hover:text-gray-950 text-white transition-all duration-300 border border-white/10 hover:border-neon-cyan inline-flex items-center justify-center"
                      })}
                    >
                      عرض التفاصيل
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-950/20 rounded-xl border border-white/5 max-w-md mx-auto space-y-4">
            <p className="text-gray-400">عذراً، لم نجد أي ورشة عمل منشورة تطابق بحثك حالياً.</p>
            {query && (
              <Link
                href="/workshops"
                className={buttonVariants({
                  variant: "outline",
                  className: "border-white/10 hover:bg-white/10 inline-flex items-center justify-center gap-2"
                })}
              >
                عرض جميع الورشات
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
