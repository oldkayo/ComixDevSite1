import React from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle2, 
  BookmarkCheck, 
  ArrowLeft, 
  Mail, 
  User as UserIcon, 
  XCircle, 
  FileText,
  FileCheck2
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { RegistrationStatus } from "@prisma/client";

export default async function UserDashboardHomePage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const userId = session.user.id;
  const defaultAvatar = "/images/workshop_ai.png";

  // Data queries wrapped inside try-catch structure
  let registrations: any[] = [];
  let certificates: any[] = [];
  let userPoints = 0;
  let userName = session.user.name || "عضو نشط";
  let userImage = session.user.image || defaultAvatar;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { points: true, name: true, image: true }
    });
    
    if (user) {
      userPoints = user.points;
      if (user.name) userName = user.name;
      if (user.image) userImage = user.image;
    }

    registrations = await db.workshopRegistration.findMany({
      where: { userId },
      include: { workshop: true },
      orderBy: { registeredAt: "desc" }
    });

    certificates = await db.certificate.findMany({
      where: { userId },
      include: { workshop: true },
      orderBy: { issuedAt: "desc" }
    });
  } catch (error) {
    console.error("Dashboard home query error:", error);
  }

  // Previews lists (take last 3 items)
  const recentRegistrations = registrations.slice(0, 3);
  const recentCertificates = certificates.slice(0, 3);

  return (
    <div className="w-full py-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl space-y-8 text-right">
        
        {/* Profile Welcome Header */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 left-0 w-64 h-64 bg-neon-cyan/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-neon-purple/5 rounded-full blur-[80px] pointer-events-none" />

          {/* User profile details */}
          <div className="flex items-center gap-4 relative z-10">
            <img
              src={userImage}
              alt={userName}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-neon-cyan/30 shadow-lg shadow-neon-cyan/10 shrink-0"
            />
            <div className="space-y-1.5">
              <h2 className="text-xl md:text-2xl font-extrabold text-white">
                أهلاً بك، <span className="bg-gradient-to-l from-neon-cyan to-neon-purple bg-clip-text text-transparent">{userName}</span>! 👋
              </h2>
              <div className="flex flex-col gap-1 text-xs md:text-sm text-gray-400">
                <span className="flex items-center gap-1.5 justify-end">
                  {session.user.email}
                  <Mail className="w-4 h-4 text-gray-500" />
                </span>
                <span className="flex items-center gap-1.5 justify-end">
                  عضو معتمد ComixDev
                  <UserIcon className="w-4 h-4 text-gray-500" />
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex gap-2">
            <Link
              href="/dashboard/profile"
              className={buttonVariants({
                variant: "outline",
                className: "border-white/10 hover:bg-white/10 text-white text-xs md:text-sm px-5 py-4",
              })}
            >
              تعديل الملف الشخصي
            </Link>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Registered Workshops */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-semibold block">الورشات المسجلة</span>
              <span className="text-2xl font-extrabold text-white block font-mono">{registrations.length}</span>
              <span className="text-[10px] text-neon-cyan/70 block">ورشات عمل تفاعلية</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan shadow-lg shadow-neon-cyan/10">
              <BookmarkCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Certificates */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-semibold block">الشهادات المكتسبة</span>
              <span className="text-2xl font-extrabold text-white block font-mono">{certificates.length}</span>
              <span className="text-[10px] text-neon-purple/70 block">شهادة معتمدة موثقة</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-neon-purple/5 border border-neon-purple/20 flex items-center justify-center text-neon-purple shadow-lg shadow-neon-purple/10">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Loyalty Points */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-semibold block">نقاط الولاء</span>
              <span className="text-2xl font-extrabold text-white block font-mono">{userPoints}</span>
              <span className="text-[10px] text-emerald-400/70 block">رصيد نقاط التفاعل</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Award className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Dynamic Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Column 1: Recent Workshops */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <Link 
                href="/dashboard/workshops" 
                className="text-xs font-semibold text-neon-cyan hover:underline flex items-center gap-1"
              >
                عرض الكل
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-neon-cyan" />
                آخر الورشات المسجلة
              </h3>
            </div>

            {recentRegistrations.length > 0 ? (
              <div className="space-y-3">
                {recentRegistrations.map((reg) => {
                  const workshop = reg.workshop;
                  const isRegistered = reg.status === RegistrationStatus.REGISTERED;
                  const isAttended = reg.status === RegistrationStatus.ATTENDED;

                  return (
                    <div 
                      key={reg.id} 
                      className="glass p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 text-right">
                        <h4 className="text-sm font-bold text-white leading-snug line-clamp-1">
                          {workshop.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-neon-cyan" />
                            {new Date(workshop.date).toLocaleDateString("ar-EG")}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-neon-purple">
                            <Award className="w-3 h-3" />
                            +{workshop.pointsReward} نقطة
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isRegistered ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            مسجل
                          </span>
                        ) : isAttended ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            تم الحضور
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                            ملغى
                          </span>
                        )}
                        <Link
                          href={`/workshops/${workshop.slug}`}
                          className={buttonVariants({
                            variant: "outline",
                            className: "border-white/10 hover:bg-white/10 text-gray-400 text-[10px] px-2 py-1 h-7",
                          })}
                        >
                          التفاصيل
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                <BookmarkCheck className="w-10 h-10 text-gray-600 mx-auto" />
                <p className="text-gray-500 text-xs">لم تقم بالتسجيل في أي ورشة عمل تقنية بعد.</p>
                <Link
                  href="/workshops"
                  className={buttonVariants({
                    className: "bg-gradient-to-r from-neon-cyan to-neon-blue text-white text-xs px-4 h-8",
                  })}
                >
                  سجل الآن
                </Link>
              </div>
            )}
          </div>

          {/* Column 2: Recent Certificates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <Link 
                href="/dashboard/certificates" 
                className="text-xs font-semibold text-neon-purple hover:underline flex items-center gap-1"
              >
                عرض الكل
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-neon-purple" />
                آخر الشهادات المكتسبة
              </h3>
            </div>

            {recentCertificates.length > 0 ? (
              <div className="space-y-3">
                {recentCertificates.map((cert) => {
                  return (
                    <div 
                      key={cert.id} 
                      className="glass p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 text-right overflow-hidden">
                        <h4 className="text-sm font-bold text-white leading-snug truncate">
                          {cert.title}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-mono">
                          رقم الشهادة: {cert.certificateNumber}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/certificates/${cert.id}`}
                          className={buttonVariants({
                            variant: "outline",
                            className: "border-neon-purple/20 bg-neon-purple/5 text-neon-purple text-[10px] px-3 py-1 h-7 hover:bg-neon-purple/10",
                          })}
                        >
                          عرض الشهادة
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                <FileCheck2 className="w-10 h-10 text-gray-600 mx-auto" />
                <p className="text-gray-500 text-xs">لا توجد شهادات صادرة لك حتى الآن.</p>
                <p className="text-[10px] text-gray-600 max-w-[200px] mx-auto">سوف تحصل على شهادة معتمدة موثقة برمز QR فور إثبات حضورك لأي ورشة عمل.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
