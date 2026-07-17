import React from "react";
import type { Metadata } from "next";
import { getSEOSettings } from "@/lib/settings";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  getUpcomingWorkshops,
  getCompletedWorkshops,
  getWorkshopStats,
} from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  Award,
  Search,
  ArrowRight,
  MapPin,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { autoUpdateWorkshopStatuses } from "@/actions/workshop";

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

  // Auto-sync workshop statuses based on current date/time
  await autoUpdateWorkshopStatuses();

  // Fetch workshops from Neon PostgreSQL
  let upcomingWorkshops: any[] = [];
  let completedWorkshops: any[] = [];
  let stats = { upcoming: 0, completed: 0, totalAttendees: 0 };

  try {
    if (query) {
      const allWorkshops = await db.workshop.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { shortDescription: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { certificates: true },
        orderBy: { date: "asc" },
      });
      upcomingWorkshops = allWorkshops.filter((w) =>
        ["UPCOMING", "ONGOING"].includes(w.status)
      );
      completedWorkshops = allWorkshops.filter(
        (w) => w.status === "COMPLETED"
      );
    } else {
      [upcomingWorkshops, completedWorkshops, stats] = await Promise.all([
        getUpcomingWorkshops(),
        getCompletedWorkshops(),
        getWorkshopStats(),
      ]);
    }
  } catch (error) {
    console.error("Database query failed inside workshops directory:", error);
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "ONGOING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/15 border border-yellow-500/30 text-yellow-400">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
            جارية الآن
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <Zap className="w-3 h-3" />
            قادمة
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            مكتملة
          </span>
        );
      default:
        return null;
    }
  };

  // Card for upcoming workshops
  const UpcomingCard = ({ workshop }: { workshop: any }) => {
    const defaultImage = "/images/workshop_ai.png";
    const coverImage = workshop.coverImage || defaultImage;
    return (
      <div className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-neon-cyan/30 transition-all duration-300 group hover:-translate-y-1 flex flex-col h-full shadow-lg">
        {/* Cover */}
        <div className="h-48 w-full overflow-hidden relative bg-gray-900 shrink-0">
          <img
            src={coverImage}
            alt={workshop.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
          <div className="absolute top-3 right-3">{statusBadge(workshop.status)}</div>
          <div className="absolute bottom-3 left-3 backdrop-blur-sm bg-black/40 rounded-full px-2.5 py-1 text-[11px] font-bold text-neon-purple flex items-center gap-1">
            <Award className="w-3 h-3" />
            +{workshop.pointsReward} نقطة
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 flex-1 flex flex-col">
          <h3 className="text-base font-bold text-white group-hover:text-neon-cyan transition-colors line-clamp-2 leading-snug text-right">
            {workshop.title}
          </h3>
          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed text-right flex-1">
            {workshop.shortDescription}
          </p>

          <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
              <span>
                {new Date(workshop.date).toLocaleDateString("ar-EG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            {workshop.startTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                <span>
                  {workshop.startTime}
                  {workshop.endTime ? ` – ${workshop.endTime}` : ""}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
              <span className="truncate">{workshop.location}</span>
            </div>
          </div>

          <Link
            href={`/workshops/${workshop.slug}`}
            className={buttonVariants({
              className:
                "w-full mt-2 bg-white/5 hover:bg-neon-cyan hover:text-gray-950 text-white transition-all duration-300 border border-white/10 hover:border-neon-cyan inline-flex items-center justify-center gap-2 text-sm",
            })}
          >
            <BookOpen className="w-4 h-4" />
            عرض التفاصيل والتسجيل
          </Link>
        </div>
      </div>
    );
  };

  // Card for completed (past) workshops
  const CompletedCard = ({ workshop }: { workshop: any }) => {
    const defaultImage = "/images/workshop_ai.png";
    const coverImage = workshop.coverImage || defaultImage;
    const photosCount = workshop.workshopPhotos?.length || 0;
    return (
      <div className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1 flex flex-col h-full shadow-lg">
        {/* Cover */}
        <div className="h-44 w-full overflow-hidden relative bg-gray-900 shrink-0">
          <img
            src={coverImage}
            alt={workshop.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70 grayscale-[30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 to-transparent" />
          <div className="absolute top-3 right-3">{statusBadge("COMPLETED")}</div>
          {workshop.attendeeCount > 0 && (
            <div className="absolute bottom-3 left-3 backdrop-blur-sm bg-black/40 rounded-full px-2.5 py-1 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {workshop.attendeeCount} حضر
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 flex-1 flex flex-col">
          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug text-right">
            {workshop.title}
          </h3>
          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed text-right flex-1">
            {workshop.shortDescription}
          </p>

          <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {new Date(workshop.date).toLocaleDateString("ar-EG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            {workshop.certificates && (
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-neon-purple shrink-0" />
                <span>{workshop.certificates.length} شهادة صادرة</span>
              </div>
            )}
            {photosCount > 0 && (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                <span>{photosCount} صورة من الورشة</span>
              </div>
            )}
            {workshop.hostOrganization && (
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                <span className="truncate">مع: {workshop.hostOrganization}</span>
              </div>
            )}
          </div>

          <Link
            href={`/workshops/${workshop.slug}`}
            className={buttonVariants({
              className:
                "w-full mt-2 bg-white/5 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-300 transition-all duration-300 border border-white/10 hover:border-emerald-500/40 inline-flex items-center justify-center gap-2 text-sm",
            })}
          >
            <BookOpen className="w-4 h-4" />
            عرض التفاصيل
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full py-16 relative overflow-hidden">
      {/* Background decoration blurs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl space-y-16 relative z-10">
        {/* Hero Header */}
        <div className="text-center space-y-5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            الورشات التقنية التفاعلية
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            تعلّم بالتطبيق المباشر
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            سجّل في ورشات عمل تقنية متخصصة، اكتسب مهارات حقيقية، واحصل على
            شهادات موثّقة ونقاط ولاء.
          </p>
        </div>

        {/* Stats Row */}
        {!query && (stats.upcoming > 0 || stats.completed > 0 || stats.totalAttendees > 0) && (
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="glass rounded-xl p-4 text-center border border-white/5 space-y-1">
              <p className="text-2xl font-black text-neon-cyan">{stats.upcoming}</p>
              <p className="text-xs text-gray-400">ورشة قادمة</p>
            </div>
            <div className="glass rounded-xl p-4 text-center border border-white/5 space-y-1">
              <p className="text-2xl font-black text-emerald-400">{stats.completed}</p>
              <p className="text-xs text-gray-400">ورشة مكتملة</p>
            </div>
            <div className="glass rounded-xl p-4 text-center border border-white/5 space-y-1">
              <p className="text-2xl font-black text-neon-purple">{stats.totalAttendees}</p>
              <p className="text-xs text-gray-400">مشارك إجمالي</p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="max-w-lg mx-auto">
          <form method="GET" action="/workshops" className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="ابحث عن ورشة عمل تقنية..."
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan h-11"
            />
          </form>
        </div>

        {/* Upcoming Workshops Section */}
        <section className="space-y-8" id="upcoming">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-1 h-7 bg-neon-cyan rounded-full" />
            <h2 className="text-xl md:text-2xl font-bold text-white">
              الورشات القادمة
            </h2>
            {upcomingWorkshops.length > 0 && (
              <span className="ml-auto bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs font-bold px-2.5 py-1 rounded-full">
                {upcomingWorkshops.length}
              </span>
            )}
          </div>

          {upcomingWorkshops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingWorkshops.map((workshop) => (
                <UpcomingCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-950/20 rounded-2xl border border-white/5 space-y-3">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">لا توجد ورشات قادمة حالياً.</p>
              <p className="text-gray-600 text-xs">
                تابعنا على منصات التواصل الاجتماعي لمعرفة مواعيد الورشات الجديدة.
              </p>
            </div>
          )}
        </section>

        {/* Past Workshops Section */}
        <section className="space-y-8" id="past">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-1 h-7 bg-emerald-500 rounded-full" />
            <h2 className="text-xl md:text-2xl font-bold text-white">
              الورشات السابقة
            </h2>
            {completedWorkshops.length > 0 && (
              <span className="ml-auto bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">
                {completedWorkshops.length}
              </span>
            )}
          </div>

          {completedWorkshops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedWorkshops.map((workshop) => (
                <CompletedCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-950/20 rounded-2xl border border-white/5 space-y-3">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">لا توجد ورشات سابقة حالياً.</p>
            </div>
          )}
        </section>

        {/* No search results */}
        {query &&
          upcomingWorkshops.length === 0 &&
          completedWorkshops.length === 0 && (
            <div className="text-center py-20 bg-gray-950/20 rounded-2xl border border-white/5 space-y-4">
              <p className="text-gray-400">
                عذراً، لم نجد أي ورشة عمل تطابق بحثك عن «{query}».
              </p>
              <Link
                href="/workshops"
                className={buttonVariants({
                  variant: "outline",
                  className:
                    "border-white/10 hover:bg-white/10 inline-flex items-center justify-center gap-2",
                })}
              >
                عرض جميع الورشات
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          )}
      </div>
    </div>
  );
}
