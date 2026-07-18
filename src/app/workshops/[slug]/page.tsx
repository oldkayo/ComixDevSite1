import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { RegisterButton } from "@/components/register-button";
import { buttonVariants } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  Award,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Image,
  Video,
  ExternalLink,
} from "lucide-react";
import { notFound } from "next/navigation";
import { RegistrationStatus } from "@prisma/client";
import { calculateWorkshopDuration } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WorkshopDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  // Decode the slug to handle URL-encoded Arabic characters
  const slug = decodeURIComponent(resolvedParams.slug);

  console.log(`[WorkshopDetails] Querying slug: "${slug}"`);

  // Retrieve workshop details from database
  let workshop: any = null;
  try {
    workshop = await db.workshop.findUnique({
      where: { slug },
      include: {
        registrations: {
          where: {
            status: { not: RegistrationStatus.CANCELLED },
          },
        },
        certificates: true,
        workshopPartners: {
          include: { partner: true },
        },
      },
    });
  } catch (error) {
    console.error(`[WorkshopDetails] Database error for slug "${slug}":`, error);
  }

  console.log(`[WorkshopDetails] Result: ${workshop ? workshop.title : "NOT FOUND"}, isPublished: ${workshop?.isPublished}`);

  // Workshop not found in DB at all
  if (!workshop) {
    return (
      <div className="w-full py-12 min-h-screen flex items-center justify-center">
        <div className="text-center py-20 bg-gray-950/20 rounded-xl border border-white/5 max-w-md mx-auto space-y-4">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 inline-flex">
            <Calendar className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">الورشة غير موجودة</h2>
          <p className="text-sm text-gray-400">
            لا توجد ورشة عمل بهذا الرابط أو قد تم حذفها.
          </p>
          <Link
            href="/workshops"
            className={buttonVariants({
              className: "bg-gradient-to-r from-neon-cyan to-neon-blue text-white text-sm px-4 h-9",
            })}
          >
            العودة إلى جميع الورشات
          </Link>
        </div>
      </div>
    );
  }

  // Workshop exists but not published
  if (!workshop.isPublished) {
    return (
      <div className="w-full py-12 min-h-screen flex items-center justify-center">
        <div className="text-center py-20 bg-gray-950/20 rounded-xl border border-white/5 max-w-md mx-auto space-y-4">
          <div className="p-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 inline-flex">
            <Calendar className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white">هذا المحتوى غير منشور حالياً</h2>
          <p className="text-sm text-gray-400">
            ورشة العمل هذه غير متاحة للعرض في الوقت الحالي.
          </p>
          <Link
            href="/workshops"
            className={buttonVariants({
              className: "bg-gradient-to-r from-neon-cyan to-neon-blue text-white text-sm px-4 h-9",
            })}
          >
            العودة إلى جميع الورشات
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = workshop.status === "COMPLETED";
  const isCancelled = workshop.status === "CANCELLED";
  const isUpcomingOrOngoing = ["UPCOMING", "ONGOING"].includes(workshop.status);

  // Get active session
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userId = session?.user?.id;

  // Check if current user is already registered (non-cancelled)
  let isAlreadyRegistered = false;
  if (isLoggedIn && userId && workshop) {
    let userReg = null;
    try {
      userReg = await db.workshopRegistration.findUnique({
        where: {
          userId_workshopId: {
            userId,
            workshopId: workshop.id,
          },
        },
      });
    } catch (error) {
      console.error(
        "Database connection failed inside userReg details check:",
        error,
      );
    }
    isAlreadyRegistered =
      !!userReg && userReg.status !== RegistrationStatus.CANCELLED;
  }

  // Seat capacity calculations
  const activeRegistrantsCount = workshop.registrations.length;
  const seatsLeft = Math.max(0, workshop.capacity - activeRegistrantsCount);
  const isFull = seatsLeft <= 0;

  const defaultImage = "/images/workshop_ai.png";
  const coverImage = workshop.coverImage || defaultImage;

  return (
    <div className="w-full py-12 relative overflow-hidden">
      {/* Background neon blurs */}
      <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-5xl space-y-8 relative z-10">
        {/* Back Link */}
        <div>
          <Link
            href="/workshops"
            className={buttonVariants({
              variant: "outline",
              className:
                "border-white/10 hover:bg-white/10 text-gray-300 inline-flex items-center gap-2",
            })}
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            العودة إلى الورشات
          </Link>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main details info (2 cols wide) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover image wrapper */}
            <div className="h-64 sm:h-96 w-full rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl bg-gray-900">
              <img
                src={coverImage}
                alt={workshop.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

              <div className="absolute bottom-6 right-6 left-6 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight text-right">
                    {workshop.title}
                  </h1>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isCompleted
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : isCancelled
                          ? "bg-red-500/10 border border-red-500/20 text-red-400"
                          : "bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan"
                    }`}
                  >
                    {isCompleted
                      ? "مكتملة"
                      : isCancelled
                        ? "ملغية"
                        : workshop.status === "ONGOING"
                          ? "جارية"
                          : "قادمة"}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 text-right font-medium">
                  {workshop.shortDescription}
                </p>
              </div>
            </div>

            {/* Syllabus Description */}
            <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 space-y-6 text-right">
              <h2 className="text-xl font-bold text-white border-b border-white/5 pb-4">
                {isCompleted ? "ملخص ورشة العمل" : "عن ورشة العمل"}
              </h2>
              <div className="text-gray-300 text-sm md:text-base leading-relaxed space-y-4 whitespace-pre-line">
                {workshop.description}
              </div>

              {!isCompleted && (
                /* What you'll learn - only for upcoming/ongoing */
                <div className="pt-4 space-y-3">
                  <h3 className="font-bold text-white text-sm md:text-base">
                    محاور الورشة الأساسية:
                  </h3>
                  <ul className="space-y-2 text-xs md:text-sm text-gray-400">
                    <li className="flex items-center justify-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-neon-cyan shrink-0" />
                      <span>
                        تطبيقات عملية ومشاريع برمجية متكاملة يتم بناؤها أثناء
                        الورشة.
                      </span>
                    </li>
                    <li className="flex items-center justify-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-neon-cyan shrink-0" />
                      <span>
                        فهم أعمق للمفاهيم الأساسية والأدوات المستعملة في سوق
                        العمل.
                      </span>
                    </li>
                    <li className="flex items-center justify-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-neon-cyan shrink-0" />
                      <span>
                        نقاش تفاعلي للإجابة على تساؤلات المطورين وتوجيههم.
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {isCompleted && workshop.workshopNotes && (
                <div className="pt-4 space-y-3">
                  <h3 className="font-bold text-white text-sm md:text-base">
                    ملاحظات ورشة العمل:
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400 whitespace-pre-line">
                    {workshop.workshopNotes}
                  </p>
                </div>
              )}

              {isCompleted &&
                (workshop.workshopPhotos.length > 0 ||
                  workshop.workshopVideos.length > 0) && (
                  <div className="pt-4 space-y-3">
                    <h3 className="font-bold text-white text-sm md:text-base">
                      محتوى الورشة:
                    </h3>

                    {workshop.workshopPhotos.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 flex items-center gap-2">
                          <Image className="w-4 h-4 text-neon-cyan" />
                          الصور:
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {workshop.workshopPhotos.map(
                            (photo: string, idx: number) => (
                              <a
                                key={idx}
                                href={photo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={photo}
                                  alt={`صورة ${idx + 1}`}
                                  className="rounded-lg border border-white/5 aspect-square object-cover"
                                />
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {workshop.workshopVideos.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 flex items-center gap-2">
                          <Video className="w-4 h-4 text-neon-purple" />
                          الفيديوهات:
                        </h4>
                        <div className="space-y-2">
                          {workshop.workshopVideos.map(
                            (video: string, idx: number) => (
                              <a
                                key={idx}
                                href={video}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-neon-blue text-sm hover:underline"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span>فيديو {idx + 1}</span>
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Partners Section - completed only */}
            {isCompleted &&
              workshop.workshopPartners &&
              workshop.workshopPartners.length > 0 && (
                <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 space-y-4 text-right">
                  <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">
                    الشركاء والجهات المشاركة
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {workshop.workshopPartners.map((wp: any) => (
                      <a
                        key={wp.id}
                        href={wp.partner.website || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/5 hover:border-white/15 bg-white/2 transition-colors group"
                      >
                        {wp.partner.logo && (
                          <img
                            src={wp.partner.logo}
                            alt={wp.partner.name}
                            className="w-12 h-12 object-contain rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        )}
                        <span className="text-xs text-gray-400 group-hover:text-white transition-colors text-center">
                          {wp.partner.name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Sidebar Card (1 col wide) */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-white/10 shadow-2xl space-y-6 text-right">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">
                {isCompleted ? "تفاصيل ورشة العمل" : "تفاصيل الحجز والاشتراك"}
              </h3>

              {/* Specs items */}
              <div className="space-y-4 text-sm text-gray-300">
                {/* Date */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-gray-400">تاريخ الورشة:</span>
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-neon-cyan" />
                    {new Date(workshop.date).toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {workshop.startTime && (
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-gray-400">وقت البدء:</span>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-neon-cyan" />
                      {workshop.startTime}
                    </span>
                  </div>
                )}

                {workshop.endTime && (
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-gray-400">وقت الانتهاء:</span>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-neon-cyan" />
                      {workshop.endTime}
                    </span>
                  </div>
                )}

                {!isCompleted &&
                  calculateWorkshopDuration(
                    workshop.startTime,
                    workshop.endTime,
                  ) && (
                    /* Duration - only show for not completed */
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-gray-400">المدة الزمنية:</span>
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-neon-cyan" />
                        {calculateWorkshopDuration(
                          workshop.startTime,
                          workshop.endTime,
                        )}
                      </span>
                    </div>
                  )}

                {/* Location */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-gray-400">الموقع:</span>
                  <span className="font-semibold text-white flex items-center gap-1.5 max-w-[160px] truncate">
                    <MapPin className="w-4 h-4 text-neon-cyan" />
                    {workshop.location}
                  </span>
                </div>

                {isCompleted && (
                  /* Attendee count - only for completed */
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-gray-400">عدد الحضور:</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {workshop.attendeeCount || 0} مشارك
                    </span>
                  </div>
                )}

                {isCompleted && workshop.certificates.length > 0 && (
                  /* Certificates count - only for completed */
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-gray-400">الشهادات الصادرة:</span>
                    <span className="font-semibold text-neon-purple flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      {workshop.certificates.length} شهادة
                    </span>
                  </div>
                )}

                {!isCompleted && (
                  /* Seats Left & Points - only show if not completed */
                  <>
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-gray-400">المقاعد المتبقية:</span>
                      <span
                        className={`font-semibold flex items-center gap-1.5 ${seatsLeft < 5 ? "text-red-400 font-bold" : "text-neon-cyan"}`}
                      >
                        <Users className="w-4 h-4" />
                        {seatsLeft} مقعد / {workshop.capacity}
                      </span>
                    </div>

                    {/* Points Reward */}
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-gray-400">نقاط المكافأة:</span>
                      <span className="font-mono font-bold text-neon-purple text-base flex items-center gap-1.5">
                        <Award className="w-4.5 h-4.5" />+
                        {workshop.pointsReward} نقطة ولاء
                      </span>
                    </div>
                  </>
                )}

                {isCompleted && workshop.galleryLink && (
                  <div className="pt-2">
                    <a
                      href={workshop.galleryLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({
                        className:
                          "w-full bg-white/5 hover:bg-neon-purple hover:text-gray-950 text-white border border-white/10 hover:border-neon-purple transition-all duration-300 flex items-center justify-center gap-2",
                      })}
                    >
                      <ExternalLink className="w-4 h-4" />
                      عرض المعرض الكامل
                    </a>
                  </div>
                )}

                {isCompleted && workshop.hostOrganization && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">مع:</span>
                      <span className="font-semibold text-neon-blue text-xs">
                        {workshop.hostOrganization}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!isCompleted && !isCancelled && (
                /* Registration Trigger CTA - only show if not completed and not cancelled */
                <div className="pt-2 border-t border-white/5">
                  <RegisterButton
                    workshopId={workshop.id}
                    workshopSlug={workshop.slug}
                    isLoggedIn={isLoggedIn}
                    isAlreadyRegistered={isAlreadyRegistered}
                    isFull={isFull}
                  />
                </div>
              )}

              {isCompleted && (
                <div className="pt-2 border-t border-white/5">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-xs py-3 px-4 rounded-lg">
                    هذه الورشة مكتملة بالفعل.
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="pt-2 border-t border-white/5">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-center text-xs py-3 px-4 rounded-lg">
                    هذه الورشة ملغية.
                  </div>
                </div>
              )}

              {!isCompleted && !isCancelled && (
                <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                  سيتلقى المشاركون رسالة بالبريد تحتوي على رابط القاعة
                  الافتراضية للورشة بمجرد تأكيد الحجز.
                </p>
              )}
            </div>

            {/* Additional verification badge panel */}
            <div className="glass p-4 rounded-xl border border-white/5 text-right flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">منصة موثوقة</h4>
                <p className="text-[10px] text-gray-400 leading-normal">
                  {isCompleted
                    ? "الشهادات موثقة ومحفوظة في قاعدة البيانات."
                    : "تتم معالجة الطلبات وإصدار المقاعد تلقائياً فور الحجز."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
