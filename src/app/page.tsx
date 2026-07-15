import React from "react";
import Link from "next/link";
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
} from "lucide-react";
import { getWorkshops, getPrompts, getStats } from "@/lib/data";
import { getHeroSettings, getWhyItems, getSiteSettings, getTestimonials } from "@/lib/settings";
import { CopyButton } from "@/components/copy-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { PromptCopyButton } from "@/components/prompts/prompt-card-actions";
import { db } from "@/lib/db";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import * as LucideIcons from "lucide-react";

export default async function HomePage() {
  // Fetch data on server
  const [workshops, prompts, testimonials, latestEvents, galleryItems, partners, heroSettings, whyItems, siteSettings, stats] = await Promise.all([
    getWorkshops(),
    getPrompts(),
    getTestimonials(),
    db.event.findMany({
      where: { isPublished: true },
      orderBy: { startDate: "desc" },
      take: 3,
    }).catch(() => []),
    db.galleryItem.findMany({
      where: { event: { isPublished: true } },
      include: { event: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }).catch(() => []),
    db.partner.findMany({
      orderBy: { name: "asc" },
    }).catch(() => []),
    getHeroSettings(),
    getWhyItems(),
    getSiteSettings(),
    getStats(),
  ]);

  // Take the next 3 workshops and next 3 prompts for the homepage preview
  const upcomingWorkshops = workshops.slice(0, 3);
  const previewPrompts = prompts.slice(0, 3);

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* 1. Hero Section */}
      <section 
        className="relative w-full py-20 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden border-b border-white/5 bg-cover bg-center"
        style={heroSettings.backgroundImage ? { backgroundImage: `url(${heroSettings.backgroundImage})` } : undefined}
      >
        {heroSettings.backgroundImage && (
          <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-[2px] pointer-events-none" />
        )}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-neon-purple/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 space-y-6 max-w-4xl">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan text-xs font-semibold tracking-wide uppercase mx-auto animate-pulse">
            <LucideIcons.Zap className="w-3.5 h-3.5" />
            منصة الورش البرمجية والذكاء الاصطناعي الأولى
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-tight md:leading-none">
            {heroSettings.title.includes("Build. Learn. Innovate") ? (
              <>
                Build. Learn. <br className="md:hidden" />
                <span className="bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple bg-clip-text text-transparent neon-glow-cyan">
                  Innovate with AI
                </span>
              </>
            ) : (
              <span className="bg-gradient-to-r from-white via-gray-300 to-gray-400 bg-clip-text text-transparent">
                {heroSettings.title}
              </span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {heroSettings.description}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            {heroSettings.buttonText1 && heroSettings.buttonLink1 && (
              <Link
                href={heroSettings.buttonLink1}
                className={buttonVariants({
                  size: "lg",
                  className: "w-full sm:w-auto bg-gradient-to-r from-neon-cyan to-neon-blue text-white shadow-lg shadow-neon-cyan/15 hover:opacity-90 font-medium text-base inline-flex items-center justify-center gap-2 cursor-pointer"
                })}
              >
                {heroSettings.buttonText1}
                <LucideIcons.ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            )}
            {heroSettings.buttonText2 && heroSettings.buttonLink2 && (
              <Link
                href={heroSettings.buttonLink2}
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white font-medium text-base inline-flex items-center justify-center cursor-pointer"
                })}
              >
                {heroSettings.buttonText2}
              </Link>
            )}
          </div>

        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="w-full py-12 bg-gray-950/40 border-b border-white/5 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="glass p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="text-3xl md:text-4xl font-bold font-mono text-neon-cyan mb-1">{stats.workshops}</div>
              <div className="text-sm text-gray-400">الورشات التقنية</div>
            </div>

            <div className="glass p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="text-3xl md:text-4xl font-bold font-mono text-neon-purple mb-1">{stats.participants}</div>
              <div className="text-sm text-gray-400">المشاركين النشطين</div>
            </div>

            <div className="glass p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="text-3xl md:text-4xl font-bold font-mono text-neon-cyan mb-1">{stats.projects}</div>
              <div className="text-sm text-gray-400">مشاريع تخرج حقيقية</div>
            </div>

            <div className="glass p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="text-3xl md:text-4xl font-bold font-mono text-neon-purple mb-1">{stats.certificates}</div>
              <div className="text-sm text-gray-400">شهادة معتمدة موثقة</div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Upcoming Workshops Section */}
      <section className="w-full py-20 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">الورشات القادمة</h2>
            <p className="text-gray-400 text-sm md:text-base">سجل الآن واحجز مقعدك في إحدى ورشاتنا العملية المباشرة.</p>
          </div>
          <Link href="/workshops" className="mt-4 md:mt-0 inline-flex items-center gap-1 text-sm font-semibold text-neon-cyan hover:underline">
            عرض كافة الورشات
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {upcomingWorkshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingWorkshops.map((workshop) => (
              <div key={workshop.id} className="glass rounded-xl overflow-hidden flex flex-col glass-hover relative group">
                
                {/* Image */}
                <div className="relative w-full h-48 bg-gray-900 overflow-hidden">
                  <img
                    src={workshop.image || "/images/workshop_ai.png"}
                    alt={workshop.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ height: "auto", minHeight: "100%" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />
                  
                  {/* Reward points badge */}
                  <div className="absolute top-4 left-4 bg-neon-purple/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md shadow-neon-purple/20">
                    <Award className="w-3.5 h-3.5" />
                    <span>+{workshop.pointsReward} نقطة</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-neon-cyan transition-colors line-clamp-1">
                    {workshop.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed flex-grow">
                    {workshop.description}
                  </p>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-y-3 pt-2 text-xs text-gray-400 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-neon-cyan" />
                      <span>
                        {new Date(workshop.date).toLocaleDateString("ar-EG", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Clock className="w-4 h-4 text-neon-cyan" />
                      <span>{workshop.duration} دقيقة</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Users className="w-4 h-4 text-neon-cyan" />
                      <span>المقاعد المتاحة: {workshop.capacity} مقعد فقط</span>
                    </div>
                  </div>

                  {/* CTA Action */}
                  <Link
                    href={`/workshops/${workshop.slug}`}
                    className={buttonVariants({
                      className: "w-full bg-white/5 hover:bg-neon-cyan hover:text-gray-950 text-white transition-all duration-300 border border-white/10 hover:border-neon-cyan inline-flex items-center justify-center"
                    })}
                  >
                    سجل الآن بالتفاصيل
                  </Link>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5 max-w-md mx-auto">
            <p className="text-gray-400 text-sm">لا توجد ورشات عمل متاحة حالياً.</p>
          </div>
        )}
      </section>

      {/* 3b. Latest Events Section */}
      {latestEvents.length > 0 && (
        <section className="w-full py-20 bg-gray-950/20 border-b border-white/5 relative">
          <div className="container mx-auto px-4 max-w-6xl space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between">
              <div className="space-y-2 text-right" dir="rtl">
                <h2 className="text-2xl md:text-4xl font-extrabold text-white">الفعاليات والمؤتمرات الأخيرة</h2>
                <p className="text-gray-400 text-sm md:text-base">تغطية شاملة ومباشرة للهاكاثونات والمؤتمرات التي أقمناها مؤخراً.</p>
              </div>
              <Link href="/events" className="mt-4 md:mt-0 inline-flex items-center gap-1 text-sm font-semibold text-neon-cyan hover:underline">
                عرض كافة الفعاليات
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestEvents.map((event) => {
                const startFormatted = new Date(event.startDate).toLocaleDateString("ar-EG", {
                  day: "numeric",
                  month: "short",
                });
                return (
                  <div key={event.id} className="glass rounded-2xl overflow-hidden flex flex-col justify-between border border-white/5 relative group hover:border-neon-cyan/20 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/5 text-right" dir="rtl">
                    <div className="relative w-full h-40 bg-gray-900 overflow-hidden">
                      <img
                        src={event.coverImage || "/images/workshop_ai.png"}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />
                      <div className="absolute top-3 left-3 bg-neon-purple/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {event.hostedBy}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow space-y-3">
                      <h3 className="text-base font-bold text-white group-hover:text-neon-cyan transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed flex-grow">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-3 pt-2 text-[10px] text-gray-500 border-t border-white/5 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neon-cyan" />
                          {startFormatted}
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-[120px]">
                          <MapPin className="w-3.5 h-3.5 text-neon-cyan" />
                          {event.location}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <Link
                        href={`/events/${event.slug}`}
                        className={buttonVariants({
                          className: "w-full bg-white/5 hover:bg-neon-cyan hover:text-gray-950 text-white transition-all text-xs h-8 rounded-lg flex items-center justify-center cursor-pointer"
                        })}
                      >
                        تفاصيل التغطية
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. Why ComixDev Section */}
      <section className="w-full py-20 bg-gray-950/30 border-y border-white/5 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-2 mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">لماذا ComixDev؟</h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm md:text-base">نقدم تجربة تعليمية فريدة تدمج التطبيق العملي مع التقنيات المستقبلية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whyItems.map((item, index) => {
              const renderWhyIcon = (iconName: string | null) => {
                if (!iconName) return <LucideIcons.Cpu className="w-6 h-6" />;
                const IconComponent = (LucideIcons as any)[iconName];
                if (!IconComponent) return <LucideIcons.Cpu className="w-6 h-6" />;
                return <IconComponent className="w-6 h-6" />;
              };

              const isEven = index % 2 === 0;

              return (
                <div 
                  key={item.id} 
                  className={`glass p-6 rounded-xl flex items-start gap-4 transition-colors ${
                    isEven ? "hover:border-neon-cyan/30" : "hover:border-neon-purple/30"
                  }`}
                >
                  <div className={`p-3 rounded-lg bg-white/5 border border-white/10 ${
                    isEven ? "text-neon-cyan" : "text-neon-purple"
                  }`}>
                    {renderWhyIcon(item.icon)}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Prompt Library Preview Section */}
      <section className="w-full py-20 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">مكتبة البرومبتات المميزة</h2>
            <p className="text-gray-400 text-sm md:text-base">احصل على أوامر ذكاء اصطناعي احترافية لزيادة إنتاجيتك وتوليد الأكواد.</p>
          </div>
          <Link href="/prompts" className="mt-4 md:mt-0 inline-flex items-center gap-1 text-sm font-semibold text-neon-cyan hover:underline">
            عرض كافة البرومبتات
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {previewPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {previewPrompts.map((prompt) => (
              <div key={prompt.id} className="glass p-6 rounded-2xl flex flex-col space-y-4 justify-between border border-white/5 relative overflow-hidden group hover:border-neon-cyan/20 transition-all text-right" dir="rtl">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-[10px] font-bold">
                    {prompt.category?.name || "عام"}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-gray-500" />
                    جاهز للنسخ
                  </span>
                </div>
                
                <div className="space-y-1.5 flex-grow">
                  <h3 className="text-base font-bold text-white group-hover:text-neon-cyan transition-colors line-clamp-1">
                    {prompt.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {prompt.description}
                  </p>
                </div>
                
                <div className="bg-gray-950 p-3 rounded-xl border border-white/5 font-mono text-[10px] text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap text-left" dir="ltr">
                  {prompt.content}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3">
                  <Link
                    href={`/prompts/${prompt.slug}`}
                    className={buttonVariants({
                      variant: "outline",
                      className: "border-white/10 hover:bg-white/10 text-gray-300 text-xs px-3 h-8 rounded-lg"
                    })}
                  >
                    التفاصيل
                  </Link>
                  <PromptCopyButton promptId={prompt.id} content={prompt.content} className="h-8 py-1 text-xs" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5 max-w-md mx-auto">
            <p className="text-gray-400 text-sm">لا توجد برومبتات متاحة حالياً.</p>
          </div>
        )}
      </section>

      {/* 6. Gallery Section (Dynamic & Interactive Lightbox) */}
      <span id="gallery" className="scroll-mt-20" />
      <section className="w-full py-20 bg-gray-950/20 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div className="space-y-2 text-right" dir="rtl">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white">معرض الفعاليات والأنشطة</h2>
              <p className="text-gray-400 text-sm md:text-base">لقطات حية وتغطيات فيديو من فعالياتنا والهاكاثونات السابقة.</p>
            </div>
            <Link href="/gallery" className="mt-4 md:mt-0 inline-flex items-center gap-1 text-sm font-semibold text-neon-cyan hover:underline">
              عرض كامل معرض الصور
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {galleryItems.length > 0 ? (
            <GalleryGrid items={galleryItems as any[]} />
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 max-w-sm mx-auto">
              <p className="text-gray-400 text-xs">لا توجد وسائط مضافة لمعرض التغطيات حالياً.</p>
            </div>
          )}
        </div>
      </section>

      {/* 6b. Partners Section */}
      {partners.length > 0 && (
        <section className="w-full py-16 bg-gray-950/40 border-t border-white/5">
          <div className="container mx-auto px-4 max-w-6xl space-y-10 text-center">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-bold text-white">شركاء النجاح والرعاة</h2>
              <p className="text-xs md:text-sm text-gray-400 max-w-md mx-auto">نعتز بالتعاون والعمل المشترك مع كبرى الحواضن، الشركات، والمؤسسات التعليمية.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 items-center justify-center">
              {partners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.website || "#"}
                  target={partner.website ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="glass p-4 rounded-xl flex items-center justify-center h-16 border border-white/5 hover:border-neon-cyan/20 transition-all cursor-pointer opacity-70 hover:opacity-100"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain brightness-95"
                  />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="w-full py-20 bg-gray-950/40 border-t border-white/5">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center space-y-2 mb-16">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white">آراء المشاركين</h2>
              <p className="text-gray-400 text-sm md:text-base">ماذا يقول طلابنا وخريجونا عن الورش والخدمات المقدمة.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div key={t.id} className="glass p-6 rounded-xl space-y-4 relative">
                  <MessageSquare className="absolute top-6 left-6 w-8 h-8 text-white/5 pointer-events-none" />
                  <p className="text-sm text-gray-300 leading-relaxed italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                    <div className="w-10 h-10 rounded-full bg-neon-cyan/15 flex items-center justify-center font-bold text-neon-cyan border border-neon-cyan/20">
                      {t.name[0]}
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold">{t.name}</h4>
                      <span className="text-xs text-gray-500">{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
