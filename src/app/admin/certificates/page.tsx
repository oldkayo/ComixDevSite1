import React from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Award, Calendar, User, FileText, Search } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminCertificatesPage() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const certificates = await db.certificate.findMany({
    include: {
      user: true,
      workshop: true,
    },
    orderBy: {
      issuedAt: "desc",
    },
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">الشهادات</h1>
          <p className="text-sm text-gray-400 mt-1">
            إدارة شهادات الحضور للورشات
          </p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-gray-950/20 rounded-xl border border-white/5">
          <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">لا توجد شهادات بعد</h3>
          <p className="text-gray-400 text-sm">سيتم إضافة الشهادات تلقائياً عند إتمام الورشات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="glass p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-neon-purple" />
                    <h3 className="font-semibold text-white">{cert.title}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{cert.user.name || cert.user.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>ورشة: {cert.workshop.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>تاريخ الإصدار: {new Date(cert.issuedAt).toLocaleDateString("ar-EG")}</span>
                    </div>
                    <span className="text-xs font-mono text-neon-purple">
                      {cert.certificateNumber}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/certificates/${cert.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      className: "border-white/10 hover:bg-white/10 text-gray-300 text-xs h-9",
                    })}
                  >
                    عرض الشهادة
                  </Link>
                  <Link
                    href={`/verify-certificate/${cert.id}`}
                    className={buttonVariants({
                      className: "bg-gradient-to-r from-neon-cyan to-neon-blue text-white text-xs h-9",
                    })}
                  >
                    صفحة التحقق
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
