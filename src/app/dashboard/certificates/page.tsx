import React from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Award, Calendar, FileText, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default async function UserDashboardCertificatesPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/dashboard/certificates");
  }

  const userId = session.user.id;
  let certificates: any[] = [];

  try {
    certificates = await db.certificate.findMany({
      where: { userId },
      include: {
        workshop: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        issuedAt: "desc",
      },
    });
  } catch (error) {
    console.error("Dashboard certificates query error:", error);
  }

  return (
    <div className="w-full py-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl space-y-8 text-right" dir="rtl">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center justify-start gap-2">
            <Award className="w-7 h-7 text-neon-purple" />
            شهاداتي المعتمدة
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            استعرض وقم بتحميل شهادات حضور ورشات العمل التقنية الموثقة برموز التحقق المشفرة.
          </p>
        </div>

        {/* Certificates Grid */}
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => {
              return (
                <div 
                  key={cert.id} 
                  className="glass p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between gap-6 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-neon-purple/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Header/Info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neon-purple/10 border border-neon-purple/20 text-neon-purple font-mono">
                        {cert.certificateNumber}
                      </span>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-neon-purple">
                        <FileText className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white group-hover:text-neon-purple transition-colors leading-snug">
                        {cert.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        الورشة: {cert.workshop.title}
                      </p>
                    </div>
                  </div>

                  {/* Footer Stats & Actions */}
                  <div className="border-t border-white/5 pt-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-4 h-4 text-neon-purple" />
                      <span>
                        تاريخ الإصدار:{" "}
                        {new Date(cert.issuedAt).toLocaleDateString("ar-EG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Link */}
                      <Link
                        href={`/certificates/${cert.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          className: "border-white/10 hover:bg-white/10 text-gray-300 text-xs px-3 h-8 flex items-center gap-1",
                        })}
                      >
                        عرض
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      {/* Print/Download Link */}
                      <Link
                        href={`/certificates/${cert.id}?print=true`}
                        target="_blank"
                        className={buttonVariants({
                          className: "bg-gradient-to-r from-neon-purple to-neon-pink text-white hover:opacity-90 text-xs px-3 h-8 flex items-center gap-1",
                        })}
                      >
                        تحميل PDF
                        <Download className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-950/20 rounded-xl border border-white/5 max-w-md mx-auto space-y-4">
            <Award className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-gray-400 text-sm">لم تحصل على أي شهادة حضور حتى الآن.</p>
            <p className="text-xs text-gray-600 max-w-[280px] mx-auto leading-relaxed">
              يتم إصدار شهادة حضور مخصصة لك تلقائياً بمجرد تسجيل حضورك في أي ورشة عمل من قبل إدارة ComixDev.
            </p>
            <Link
              href="/dashboard/workshops"
              className={buttonVariants({
                variant: "outline",
                className: "border-white/10 hover:bg-white/10 text-white text-xs px-4 h-9",
              })}
            >
              استعرض ورشاتي المسجلة
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
