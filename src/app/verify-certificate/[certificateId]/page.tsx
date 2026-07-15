import React from "react";
import { db } from "@/lib/db";
import { Award, ShieldCheck, XCircle, Calendar, FileText, Zap, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    certificateId: string;
  }>;
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const resolvedParams = await params;
  const certificateId = resolvedParams.certificateId;

  let certificate: any = null;
  let isValid = false;

  try {
    certificate = await db.certificate.findUnique({
      where: { id: certificateId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        workshop: {
          select: {
            title: true,
          },
        },
      },
    });
    isValid = !!certificate;
  } catch (error) {
    console.error("Certificate verification query error:", error);
  }

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-12 px-4 relative overflow-hidden bg-gray-950">
      
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main card */}
      <div className="max-w-md w-full glass p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10 space-y-6 text-right" dir="rtl">
        
        {/* Logo and Icon Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-neon-cyan to-neon-purple flex items-center justify-center mx-auto shadow-lg shadow-neon-cyan/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white">التحقق من الشهادات</h1>
          <p className="text-xs text-gray-500 font-mono tracking-wider">CERTIFICATE VERIFICATION SERVICE</p>
        </div>

        {isValid && certificate ? (
          /* SUCCESS STATE: VALID CERTIFICATE */
          <div className="space-y-6">
            
            {/* Status Alert Banner */}
            <div className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-2">
              <ShieldCheck className="w-12 h-12 text-emerald-400 animate-pulse" />
              <div>
                <span className="text-sm font-extrabold block">شهادة معتمدة وصالحة</span>
                <span className="text-[10px] text-emerald-500 font-mono font-bold tracking-wider">{certificate.certificateNumber}</span>
              </div>
            </div>

            {/* Certificate Meta Details */}
            <div className="space-y-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl text-sm">
              
              {/* Participant name */}
              <div className="space-y-1">
                <span className="text-xs text-gray-500 block">اسم صاحب الشهادة:</span>
                <span className="font-bold text-white text-base block">{certificate.user.name || "عضو نشط"}</span>
              </div>

              {/* Workshop Title */}
              <div className="space-y-1">
                <span className="text-xs text-gray-500 block">عنوان ورشة العمل:</span>
                <span className="font-bold text-neon-cyan text-sm block leading-snug">{certificate.workshop.title}</span>
              </div>

              {/* Issue Date */}
              <div className="space-y-1">
                <span className="text-xs text-gray-500 block">تاريخ الإصدار:</span>
                <span className="font-semibold text-gray-300 block flex items-center gap-1.5 justify-end">
                  {new Date(certificate.issuedAt).toLocaleDateString("ar-EG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  <Calendar className="w-4 h-4 text-gray-500" />
                </span>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <span className="text-xs text-gray-500 block">حالة المستند:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  VALID (صالح ومؤكد)
                </span>
              </div>

            </div>

            <p className="text-center text-[10px] text-gray-500 leading-relaxed">
              هذا المستند صادر رسمياً ومسجل إلكترونياً بقواعد بيانات ComixDev لورشات العمل والذكاء الاصطناعي.
            </p>

          </div>
        ) : (
          /* FAILURE STATE: INVALID CERTIFICATE */
          <div className="space-y-6">
            
            {/* Status Alert Banner */}
            <div className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 space-y-2">
              <ShieldAlert className="w-12 h-12 text-red-400 animate-bounce" />
              <div>
                <span className="text-sm font-extrabold block">مستند غير صالح أو غير معتمد</span>
                <span className="text-[10px] text-red-500 font-mono font-bold tracking-wider">INVALID CERTIFICATE</span>
              </div>
            </div>

            <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl text-center space-y-3">
              <p className="text-xs text-gray-400 leading-relaxed">
                رمز التحقق المرفق بهذا المستند غير مسجل في منصتنا، أو قد تم إلغاء صلاحية الشهادة. يرجى التأكد من الرمز الممسوح ضوئياً.
              </p>
              <div className="text-[10px] text-gray-500 font-mono bg-white/5 p-2 rounded-lg break-all">
                المعرف المطلوب: {certificateId}
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Link
                href="/"
                className={buttonVariants({
                  className: "bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs px-6 py-4",
                })}
              >
                العودة للصفحة الرئيسية
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
