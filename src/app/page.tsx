import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  Zap,
  Cpu,
  Layers,
  BookOpen,
  Terminal,
  MessageSquare,
  MapPin,
  Film,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { getWorkshops, getPrompts, getStats } from "@/lib/data";
import {
  getHeroSettings,
  getWhyItems,
  getSiteSettings,
  getTestimonials,
} from "@/lib/settings";
import { Button, buttonVariants } from "@/components/ui/button";
import { PromptCopyButton } from "@/components/prompts/prompt-card-actions";
import { db } from "@/lib/db";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import * as LucideIcons from "lucide-react";

export default async function HomePage() {
  // Fetch data on server
  const [
    workshops,
    prompts,
    testimonials,
    latestEvents,
    galleryItems,
    partners,
    heroSettings,
    whyItems,
    siteSettings,
    stats,
  ] = await Promise.all([
    getWorkshops(),
    getPrompts(),
    getTestimonials(),
    db.event
      .findMany({
        where: { isPublished: true },
        orderBy: { startDate: "desc" },
        take: 3,
      })
      .catch(() => []),
    db.galleryItem
      .findMany({
        where: { event: { isPublished: true } },
        include: { event: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      })
      .catch(() => []),
    db.partner
      .findMany({
        orderBy: { name: "asc" },
      })
      .catch(() => []),
    getHeroSettings(),
    getWhyItems(),
    getSiteSettings(),
    getStats(),
  ]);

  // Take the next 3 workshops and next 3 prompts for the homepage preview
  const upcomingWorkshops = workshops.slice(0, 3);
  const previewPrompts = prompts.slice(0, 3);

  // Check if we have any stats data to display
  const hasAnyStats =
    stats.workshops > 0 ||
    stats.participants > 0 ||
    stats.certificates > 0 ||
    prompts.length > 0;

  return (
    <div className="w-full flex flex-col items-center relative">
      {/* 1. Hero Section */}
      <section className="relative w-full py-16 md:py-24 flex flex-col items-center overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-2/3 right-1/4 w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 space-y-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-right">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" />
                منصة تعليمية للبرمجة والذكاء الاصطناعي
              </div>

              {/* Heading */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
                تعلم البرمجة والذكاء الاصطناعي من خلال ورش عملية حقيقية
              </h1>

              {/* Subtitle */}
              <p className="text-base md:text-lg text-slate-400 leading-relaxed">
                ورش عملية، مشاريع حقيقية، شهادات، ومجتمع تقني يساعدك على تطوير
                مهاراتك
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/workshops"
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/15 font-medium text-base inline-flex items-center justify-center gap-2",
                  })}
                >
                  استكشف الورش
                  <ArrowRight className="w-4 h-4 mr-1" />
                </Link>
                <Link
                  href="/prompts"
                  className={buttonVariants({
                    size: "lg",
                    variant: "outline",
                    className:
                      "border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-600 text-white font-medium text-base inline-flex items-center justify-center",
                  })}
                >
                  مكتبة البرومبتات
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"
                  alt="مجموعة من المطورين يعملون على أجهزة لابتوب"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section - Only visible if we have data */}
      {hasAnyStats && (
        <section className="w-full py-10 border-y border-slate-800/50 bg-slate-950/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-1">
                <div className="text-2xl md:text-4xl font-extrabold font-mono text-primary">
                  {stats.workshops}
                </div>
                <div className="text-sm text-slate-400">عدد الورشات</div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-2xl md:text-4xl font-extrabold font-mono text-secondary">
                  {stats.participants}
                </div>
                <div className="text-sm text-slate-400">عدد المشاركين</div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-2xl md:text-4xl font-extrabold font-mono text-accent">
                  {stats.certificates}
                </div>
                <div className="text-sm text-slate-400">عدد الشهادات</div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-2xl md:text-4xl font-extrabold font-mono text-slate-300">
                  {prompts.length}
                </div>
                <div className="text-sm text-slate-400">عدد البرومبتات</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Upcoming Workshops Section */}
      <section className="w-full py-16 container mx-auto px-4 max-w-6xl">
        <div
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 text-right"
          dir="rtl"
        >
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              الورشات القادمة
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              سجل الآن واحجز مقعدك في إحدى ورشاتنا العملية المباشرة
            </p>
          </div>
          <Link
            href="/workshops"
            className="mt-4 md:mt-0 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            عرض كافة الورشات
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {upcomingWorkshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingWorkshops.map((workshop) => (
              <Link
                key={workshop.id}
                href={`/workshops/${workshop.slug}`}
                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative w-full h-48 bg-slate-800 overflow-hidden">
                  <Image
                    src={
                      workshop.coverImage ||
                      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop"
                    }
                    alt={workshop.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />

                  {/* Reward points badge */}
                  <div className="absolute top-4 right-4 bg-secondary text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>+{workshop.pointsReward} نقطة</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                    {workshop.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {workshop.description}
                  </p>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-400 border-t border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>
                        {new Date(workshop.date).toLocaleDateString("ar-EG", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{workshop.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{workshop.capacity} مقعد</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-2">
                    <div
                      className={buttonVariants({
                        variant: "default",
                        className:
                          "w-full bg-primary hover:bg-primary/90 text-white text-sm",
                      })}
                    >
                      عرض التفاصيل
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 max-w-md mx-auto">
            <p className="text-slate-400 text-sm">
              لا توجد ورشات قادمة حالياً.
            </p>
          </div>
        )}
      </section>

      {/* 4. Prompt Library Section */}
      <section className="w-full py-16 bg-slate-950/30 border-y border-slate-800/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div
            className="flex flex-col md:flex-row md:items-end justify-between mb-10 text-right"
            dir="rtl"
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                مكتبة البرومبتات
              </h2>
              <p className="text-slate-400 text-sm md:text-base">
                احصل على أوامر ذكاء اصطناعي احترافية لزيادة إنتاجيتك
              </p>
            </div>
            <Link
              href="/prompts"
              className="mt-4 md:mt-0 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              عرض الكل
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {previewPrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {previewPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-right"
                  dir="rtl"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                      {prompt.category?.name || "عام"}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Copy className="w-3.5 h-3.5" />
                      {prompt.copyCount} نسخ
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {prompt.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {prompt.description}
                    </p>
                  </div>

                  <div
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap text-left"
                    dir="ltr"
                  >
                    {prompt.content}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
                    <Link
                      href={`/prompts/${prompt.slug}`}
                      className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
                    >
                      التفاصيل
                    </Link>
                    <PromptCopyButton
                      promptId={prompt.id}
                      content={prompt.content}
                      className="h-8 text-xs px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* 5. Partners Section */}
      {partners.length > 0 && (
        <section className="w-full py-14">
          <div className="container mx-auto px-4 max-w-6xl text-center space-y-8">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              شركاء النجاح
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 items-center justify-center">
              {partners.map((partner) => (
                <Link
                  key={partner.id}
                  href={partner.website || "#"}
                  target={partner.website ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="bg-slate-900 p-4 rounded-xl flex items-center justify-center h-20 border border-slate-800 hover:border-slate-700 transition-all opacity-80 hover:opacity-100"
                >
                  {partner.logo ? (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={150}
                      height={80}
                      className="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all"
                    />
                  ) : (
                    <span className="font-bold text-slate-500">
                      {partner.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Gallery Section */}
      {galleryItems.length > 0 && (
        <section className="w-full py-16 bg-slate-950/30 border-y border-slate-800/50">
          <div className="container mx-auto px-4 max-w-6xl space-y-8">
            <div
              className="flex flex-col md:flex-row md:items-end justify-between text-right"
              dir="rtl"
            >
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  معرض الفعاليات
                </h2>
                <p className="text-slate-400 text-sm md:text-base">
                  لقطات حية من فعالياتنا والورش السابقة
                </p>
              </div>
              <Link
                href="/gallery"
                className="mt-4 md:mt-0 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                عرض الكل
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <GalleryGrid items={galleryItems as any[]} />
          </div>
        </section>
      )}
    </div>
  );
}
