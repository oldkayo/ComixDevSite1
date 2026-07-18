import React, { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  BookmarkCheck,
  Loader2,
} from "lucide-react";
import { redirect } from "next/navigation";
import { RegistrationStatus } from "@prisma/client";
import { WorkshopsFilter } from "@/components/dashboard/workshops-filter";
import { calculateWorkshopDuration } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
}

export default async function UserDashboardWorkshopsPage({
  searchParams,
}: PageProps) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/dashboard/workshops");
  }

  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const statusFilter = resolvedParams.status || "ALL";
  const userId = session.user.id;

  let registrations: any[] = [];
  try {
    registrations = await db.workshopRegistration.findMany({
      where: {
        userId,
        status:
          statusFilter !== "ALL"
            ? (statusFilter as RegistrationStatus)
            : undefined,
        workshop: {
          OR: q
            ? [
                { title: { contains: q, mode: "insensitive" } },
                { shortDescription: { contains: q, mode: "insensitive" } },
              ]
            : undefined,
        },
      },
      include: {
        workshop: true,
      },
      orderBy: {
        registeredAt: "desc",
      },
    });
  } catch (error) {
    console.error("Dashboard workshops query error:", error);
  }

  return (
    <div className="w-full py-12 min-h-screen">
      <div
        className="container mx-auto px-4 max-w-5xl space-y-8 text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <BookmarkCheck className="w-7 h-7 text-neon-cyan" />
              ورشاتي المسجلة
            </h1>
            <p className="text-sm text-gray-400">
              تابع مواعيد ورشات العمل وحالة حضورك ورصيد نقاط الولاء الخاص بك.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-neon-cyan/5 border border-neon-cyan/15 rounded-lg px-4 py-2 text-neon-cyan">
            <Award className="w-5 h-5" />
            <span className="text-xs font-semibold">إجمالي نقاطك:</span>
            <span className="font-mono font-bold text-lg">
              {session.user.points ?? 0}
            </span>
          </div>
        </div>

        {/* Filter controls wrapped in Suspense for client-side routing params check */}
        <Suspense
          fallback={
            <div className="h-10 w-full bg-white/5 animate-pulse rounded-lg" />
          }
        >
          <WorkshopsFilter />
        </Suspense>

        {/* Registrations List */}
        {registrations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {registrations.map((reg) => {
              const workshop = reg.workshop;
              const isRegistered = reg.status === RegistrationStatus.REGISTERED;
              const isAttended = reg.status === RegistrationStatus.ATTENDED;
              const isCancelled = reg.status === RegistrationStatus.CANCELLED;

              return (
                <div
                  key={reg.id}
                  className="glass p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/10 transition-colors"
                >
                  {/* Info details */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {workshop.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-neon-cyan" />
                        <span>
                          {new Date(workshop.date).toLocaleDateString("ar-EG", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {calculateWorkshopDuration(
                        workshop.startTime,
                        workshop.endTime,
                      ) && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-neon-cyan" />
                          <span>
                            {calculateWorkshopDuration(
                              workshop.startTime,
                              workshop.endTime,
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 font-semibold text-neon-purple">
                        <Award className="w-4 h-4" />
                        <span>+{workshop.pointsReward} نقطة ولاء</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Badges */}
                  <div className="flex items-center gap-4 self-end md:self-center">
                    {/* Status Badge */}
                    <div>
                      {isRegistered ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تم التسجيل بنجاح
                        </span>
                      ) : isAttended ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تم الحضور
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                          <XCircle className="w-3.5 h-3.5" />
                          تم الإلغاء
                        </span>
                      )}
                    </div>

                    {/* View Workshop public page */}
                    <Link
                      href={`/workshops/${workshop.slug}`}
                      className={buttonVariants({
                        variant: "outline",
                        className:
                          "border-white/10 hover:bg-white/10 text-gray-300 px-4 text-xs h-9",
                      })}
                    >
                      صفحة الورشة
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-950/20 rounded-xl border border-white/5 max-w-md mx-auto space-y-4">
            <BookmarkCheck className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-gray-400 text-sm">
              لا توجد ورشات مسجلة تطابق معايير البحث والفلترة المحددة.
            </p>
            <Link
              href="/workshops"
              className={buttonVariants({
                className:
                  "bg-gradient-to-r from-neon-cyan to-neon-blue text-white text-xs px-4 h-9",
              })}
            >
              استكشف الورشات وسجل الآن
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
