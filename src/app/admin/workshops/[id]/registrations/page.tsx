import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { updateRegistrationStatus } from "@/actions/workshop";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft, Users, Calendar, Mail, FileCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegistrationStatus } from "@prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminWorkshopRegistrantsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Retrieve workshop details with all user registrations
  let workshopWithRegistrations: any = null;
  try {
    workshopWithRegistrations = await db.workshop.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            user: true,
          },
          orderBy: {
            registeredAt: "desc",
          },
        },
      },
    });
  } catch (error) {
    console.error("Database connection failed inside admin registrations page:", error);
  }

  if (!workshopWithRegistrations) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">عذراً، الورشة غير موجودة</h2>
          <p className="text-gray-400 text-sm">الورشة المطلوبة غير موجودة أو تم حذفها.</p>
        </div>
        <Link
          href="/admin/workshops"
          className={buttonVariants({
            variant: "outline",
            className: "border-white/10 hover:bg-white/10 inline-flex items-center justify-center gap-2"
          })}
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  const registrations = workshopWithRegistrations.registrations;

  return (
    <div className="w-full py-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
          <Link href="/admin/workshops" className="hover:text-neon-cyan transition-colors">
            لوحة تحكم الورشات
          </Link>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-gray-200">عرض المسجلين</span>
        </div>

        {/* Title Header */}
        <div className="space-y-1 text-right">
          <h1 className="text-xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-neon-cyan" />
            المسجلون في: {workshopWithRegistrations.title}
          </h1>
          <p className="text-sm text-gray-400">
            متابعة حضور وتأجيل أو إلغاء تسجيلات الأعضاء والمشاركين.
          </p>
        </div>

        {/* Registrants Table */}
        {registrations.length > 0 ? (
          <div className="glass rounded-xl overflow-hidden border border-white/10 shadow-xl overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold">
                  <th className="p-4">اسم المشارك</th>
                  <th className="p-4">البريد الإلكتروني</th>
                  <th className="p-4">تاريخ التسجيل</th>
                  <th className="p-4">حالة الحضور</th>
                  <th className="p-4 text-center">تعديل الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-200">
                {registrations.map((reg: any) => {
                  // Bind Server Action with registration ID
                  const updateAction = async (formData: FormData) => {
                    "use server";
                    const newStatus = formData.get("status") as RegistrationStatus;
                    await updateRegistrationStatus(reg.id, newStatus);
                  };

                  return (
                    <tr key={reg.id} className="hover:bg-white/[0.01] transition-colors">
                      
                      {/* Name */}
                      <td className="p-4 font-bold text-white">
                        {reg.user.name || "عضو غير مسمى"}
                      </td>
                      
                      {/* Email */}
                      <td className="p-4 font-mono text-xs">
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <Mail className="w-3.5 h-3.5 text-neon-cyan" />
                          {reg.user.email}
                        </span>
                      </td>
                      
                      {/* Registration Date */}
                      <td className="p-4 text-xs text-gray-400">
                        {new Date(reg.registeredAt).toLocaleDateString("ar-EG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      
                      {/* Current Status Badge */}
                      <td className="p-4">
                        {reg.status === RegistrationStatus.REGISTERED ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            مسجل
                          </span>
                        ) : reg.status === RegistrationStatus.ATTENDED ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            حضر
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 border border-red-500/20 text-red-400">
                            ملغى
                          </span>
                        )}
                      </td>
                      
                      {/* Change Status Inline Form */}
                      <td className="p-4">
                        <form action={updateAction} className="flex items-center justify-center gap-2 max-w-[200px] mx-auto">
                          <select
                            name="status"
                            defaultValue={reg.status}
                            className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:border-neon-cyan focus:outline-none"
                          >
                            <option value="REGISTERED" className="bg-gray-950 text-white">مسجل</option>
                            <option value="ATTENDED" className="bg-gray-950 text-white">حضر</option>
                            <option value="CANCELLED" className="bg-gray-950 text-white">ملغى</option>
                          </select>
                          <Button type="submit" size="xs" className="bg-white/5 border border-white/10 text-xs hover:bg-neon-cyan hover:text-gray-950 text-white">
                            تحديث
                          </Button>
                        </form>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-950/20 rounded-xl border border-white/5 max-w-md mx-auto space-y-2">
            <Users className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-gray-400 text-sm">لا يوجد مشاركون مسجلون في هذه الورشة حالياً.</p>
          </div>
        )}

      </div>
    </div>
  );
}
