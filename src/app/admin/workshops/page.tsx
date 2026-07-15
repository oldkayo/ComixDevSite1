import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { deleteWorkshop } from "@/actions/workshop";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Edit, Trash2, Users, Calendar, Award, Eye, FileText, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";

export default async function AdminWorkshopsPage() {
  // Query all workshops from the database including registrations
  let workshops: any[] = [];
  try {
    workshops = await db.workshop.findMany({
      include: {
        registrations: true,
      },
      orderBy: {
        date: "asc",
      },
    });
  } catch (error) {
    console.error("Database connection failed inside admin workshops list:", error);
  }

  return (
    <div className="w-full py-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1 text-right">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-neon-cyan" />
              لوحة تحكم الورشات
            </h1>
            <p className="text-sm text-gray-400">
              إدارة ورشات العمل التقنية، متابعة التسجيلات، وتعديل الحالات والمقاعد.
            </p>
          </div>
          
          <Link
            href="/admin/workshops/create"
            className={buttonVariants({
              className: "bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 flex items-center gap-1.5",
            })}
          >
            <Plus className="w-4 h-4" />
            إنشاء ورشة جديدة
          </Link>
        </div>

        {/* Workshops Table */}
        {workshops.length > 0 ? (
          <div className="glass rounded-xl overflow-hidden border border-white/10 shadow-xl overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold">
                  <th className="p-4">اسم الورشة</th>
                  <th className="p-4">التاريخ والوقت</th>
                  <th className="p-4">عدد المسجلين</th>
                  <th className="p-4">نقاط الولاء</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-200">
                {workshops.map((workshop) => {
                  // Server action binding for deleting workshop
                  const deleteActionWithId = async () => {
                    "use server";
                    await deleteWorkshop(workshop.id);
                  };

                  const activeRegistrations = (workshop.registrations as any[]).filter((r: any) => r.status !== "CANCELLED").length;

                  return (
                    <tr key={workshop.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name */}
                      <td className="p-4 font-bold text-white max-w-[250px] truncate">
                        {workshop.title}
                      </td>
                      
                      {/* Date */}
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5 text-neon-cyan" />
                          {new Date(workshop.date).toLocaleDateString("ar-EG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      
                      {/* Registrations count */}
                      <td className="p-4 font-semibold">
                        <span className="flex items-center gap-1.5 text-xs">
                          <Users className="w-3.5 h-3.5 text-neon-cyan" />
                          {activeRegistrations} / {workshop.capacity} مسجل
                        </span>
                      </td>
                      
                      {/* Points */}
                      <td className="p-4 font-mono font-bold text-neon-purple text-xs">
                        +{workshop.pointsReward} نقطة
                      </td>
                      
                      {/* Status */}
                      <td className="p-4">
                        {workshop.isPublished ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            منشورة
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/10 border border-gray-500/20 text-gray-400">
                            مسودة
                          </span>
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* View Registrations */}
                          <Link
                            href={`/admin/workshops/${workshop.id}/registrations`}
                            className={buttonVariants({
                              variant: "outline",
                              size: "xs",
                              className: "border-white/10 hover:bg-white/10 text-gray-300 flex items-center gap-1",
                            })}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            المسجلين
                          </Link>
                          
                          {/* Edit */}
                          <Link
                            href={`/admin/workshops/${workshop.id}/edit`}
                            className={buttonVariants({
                              variant: "outline",
                              size: "xs",
                              className: "border-white/10 hover:bg-white/10 text-gray-300 flex items-center gap-1",
                            })}
                          >
                            <Edit className="w-3.5 h-3.5" />
                            تعديل
                          </Link>

                          {/* Delete Form Action */}
                          <form action={deleteActionWithId} className="inline">
                            <DeleteConfirmButton
                              message="هل أنت متأكد من رغبتك في حذف هذه الورشة نهائياً؟"
                              variant="destructive"
                              size="xs"
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              حذف
                            </DeleteConfirmButton>
                          </form>
                          
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-950/20 rounded-xl border border-white/5 max-w-md mx-auto space-y-4">
            <p className="text-gray-400">لا توجد ورشات عمل مضافة في قاعدة البيانات حالياً.</p>
            <Link
              href="/admin/workshops/create"
              className={buttonVariants({
                className: "bg-gradient-to-r from-neon-cyan to-neon-blue text-white",
              })}
            >
              أضف أول ورشة عمل الآن
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
