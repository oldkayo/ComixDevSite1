import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { deleteEvent } from "@/actions/media";
import { buttonVariants } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Plus, Edit, Trash2, Calendar, MapPin, Globe, EyeOff, Film, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminEventsPage() {
  const session = await auth();

  // Guard access: only admin
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch all events
  let events: any[] = [];
  try {
    events = await db.event.findMany({
      orderBy: {
        startDate: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to query admin events:", error);
  }

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Film className="w-6 h-6 text-neon-cyan" />
              إدارة الفعاليات والمؤتمرات
            </h1>
            <p className="text-sm text-gray-400">
              قم بإنشاء وتعديل ونشر وتغطية الفعاليات والمؤتمرات الكبرى والهاكاثونات.
            </p>
          </div>
          
          <Link
            href="/admin/events/create"
            className={buttonVariants({
              className: "bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 flex items-center gap-1 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl",
            })}
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة فعالية جديدة
          </Link>
        </div>

        {/* Datatable */}
        {events.length > 0 ? (
          <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold">
                  <th className="p-4">العنوان</th>
                  <th className="p-4">الجهة المنظمة</th>
                  <th className="p-4">الموقع</th>
                  <th className="p-4">تاريخ البدء</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-200">
                {events.map((event) => {
                  const handleDelete = async () => {
                    "use server";
                    await deleteEvent(event.id);
                  };

                  return (
                    <tr key={event.id} className="hover:bg-white/[0.01] transition-colors">
                      
                      {/* Title */}
                      <td className="p-4 font-bold text-white max-w-[200px] truncate">
                        {event.title}
                      </td>

                      {/* Organizer */}
                      <td className="p-4 text-gray-300">
                        {event.hostedBy}
                      </td>

                      {/* Location */}
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3.5 h-3.5 text-neon-cyan" />
                          <span className="truncate max-w-[150px]">{event.location}</span>
                        </span>
                      </td>

                      {/* Start Date */}
                      <td className="p-4 font-mono text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          {new Date(event.startDate).toLocaleDateString("ar-EG")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {event.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <Globe className="w-3.5 h-3.5" />
                            منشور
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 border border-gray-500/20 text-gray-400">
                            <EyeOff className="w-3.5 h-3.5" />
                            مسودة
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* Edit Link */}
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className={buttonVariants({
                              variant: "outline",
                              className: "border-white/10 hover:bg-white/10 text-gray-300 px-2.5 h-8 flex items-center justify-center",
                            })}
                          >
                            <Edit className="w-3.5 h-3.5 ml-1" />
                            تعديل
                          </Link>

                          {/* Delete Form */}
                          <form action={handleDelete}>
                            <DeleteConfirmButton
                              message="هل أنت متأكد من رغبتك في حذف هذه الفعالية نهائياً؟ سيتم حذف تغطياتها بالمعرض تلقائياً."
                              variant="outline"
                              className="border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 px-2.5 h-8 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
          <div className="text-center py-20 bg-gray-950/20 rounded-2xl border border-white/5 max-w-md mx-auto space-y-4">
            <Film className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-gray-400 text-sm">لا توجد فعاليات مسجلة حالياً في قاعدة البيانات.</p>
            <Link
              href="/admin/events/create"
              className={buttonVariants({
                className: "bg-gradient-to-r from-neon-cyan to-neon-blue text-white text-xs px-4 h-9",
              })}
            >
              أضف أول فعالية الآن
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
