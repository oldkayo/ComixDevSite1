import React from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, User, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { RegistrationStatus } from "@prisma/client";

export default async function AdminAllRegistrationsPage() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const registrations = await db.workshopRegistration.findMany({
    include: {
      user: true,
      workshop: true,
    },
    orderBy: {
      registeredAt: "desc",
    },
  });

  const getStatusBadgeClass = (status: RegistrationStatus) => {
    switch (status) {
      case RegistrationStatus.REGISTERED:
        return "bg-blue-500/10 border border-blue-500/20 text-blue-400";
      case RegistrationStatus.ATTENDED:
        return "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400";
      case RegistrationStatus.CANCELLED:
        return "bg-red-500/10 border border-red-500/20 text-red-400";
      default:
        return "bg-gray-500/10 border border-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (status: RegistrationStatus) => {
    switch (status) {
      case RegistrationStatus.REGISTERED:
      case RegistrationStatus.ATTENDED:
        return CheckCircle2;
      case RegistrationStatus.CANCELLED:
        return XCircle;
      default:
        return CheckCircle2;
    }
  };

  const getStatusLabel = (status: RegistrationStatus) => {
    switch (status) {
      case RegistrationStatus.REGISTERED:
        return "مسجل";
      case RegistrationStatus.ATTENDED:
        return "حاضر";
      case RegistrationStatus.CANCELLED:
        return "ملغى";
      default:
        return "غير معروف";
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">تسجيلات الورشات</h1>
          <p className="text-sm text-gray-400 mt-1">
            عرض جميع التسجيلات في جميع الورشات
          </p>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-16 bg-gray-950/20 rounded-xl border border-white/5">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">لا توجد تسجيلات بعد</h3>
          <p className="text-gray-400 text-sm">سيتم عرض التسجيلات هنا عندما يقوم المستخدمون بالتسجيل في الورشات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const StatusIcon = getStatusIcon(reg.status);
            return (
              <div
                key={reg.id}
                className="glass p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">{reg.workshop.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{reg.user.name || reg.user.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          تاريخ التسجيل: {new Date(reg.registeredAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(reg.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        {getStatusLabel(reg.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/workshops/${reg.workshop.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        className: "border-white/10 hover:bg-white/10 text-gray-300 text-xs h-9",
                      })}
                    >
                      عرض الورشة
                    </Link>
                    <Link
                      href={`/admin/workshops/${reg.workshopId}/registrations`}
                      className={buttonVariants({
                        className: "bg-gradient-to-r from-neon-cyan to-neon-blue text-white text-xs h-9",
                      })}
                    >
                      إدارة التسجيلات
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
