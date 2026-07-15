import React from "react";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { deleteGalleryItem } from "@/actions/media";
import { GalleryForm } from "@/components/admin/gallery-form";
import { Button } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Trash2, Film, Image as ImageIcon, Camera, Globe, ExternalLink, Calendar } from "lucide-react";

export default async function AdminGalleryPage() {
  const session = await auth();

  // Guard access
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch events list for dropdown
  let events: any[] = [];
  try {
    events = await db.event.findMany({
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        title: true,
      },
    });
  } catch (error) {
    console.error("Failed to query events for gallery dropdown:", error);
  }

  // Fetch all gallery items
  let galleryItems: any[] = [];
  try {
    galleryItems = await db.galleryItem.findMany({
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to query gallery items:", error);
  }

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* Header bar */}
        <div className="border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Camera className="w-6 h-6 text-neon-cyan" />
              إدارة معرض التغطيات والوسائط
            </h1>
            <p className="text-sm text-gray-400">
              ارفع لقطات الصور ومقاطع الفيديو التوثيقية للفعاليات والمؤتمرات.
            </p>
          </div>
        </div>

        {/* Unified Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* List Section (Left-hand side 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4.5 h-4.5 text-neon-cyan" />
              ملفات المعرض المضافة ({galleryItems.length})
            </h2>

            {galleryItems.length > 0 ? (
              <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[550px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold">
                      <th className="p-3">الملف / العنوان</th>
                      <th className="p-3">الفعالية المرتبطة</th>
                      <th className="p-3">النوع</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                    {galleryItems.map((item) => {
                      const handleDelete = async () => {
                        "use server";
                        await deleteGalleryItem(item.id);
                      };

                      return (
                        <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                          
                          {/* File Preview + Title */}
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-12 h-8 rounded bg-gray-900 border border-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                                {item.type === "VIDEO" ? (
                                  <Film className="w-4 h-4 text-neon-cyan" />
                                ) : (
                                  <img src={item.fileUrl} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                              <span className="font-bold text-white truncate max-w-[150px]">{item.title}</span>
                            </div>
                          </td>

                          {/* Associated Event */}
                          <td className="p-3 text-gray-400 truncate max-w-[150px]">
                            {item.event.title}
                          </td>

                          {/* Type */}
                          <td className="p-3">
                            {item.type === "VIDEO" ? (
                              <span className="px-2 py-0.5 rounded bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/20 font-semibold font-mono text-[9px]">
                                VIDEO
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10 font-semibold font-mono text-[9px]">
                                IMAGE
                              </span>
                            )}
                          </td>

                          {/* Delete Action */}
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              
                              <a
                                href={item.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              <form action={handleDelete}>
                                <DeleteConfirmButton
                                  message="هل أنت متأكد من رغبتك في حذف هذا الملف نهائياً من المعرض؟"
                                  variant="outline"
                                  className="w-8 h-8 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 p-0 flex items-center justify-center cursor-pointer"
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
              <div className="text-center py-12 bg-gray-950/20 rounded-2xl border border-white/5 max-w-sm mx-auto">
                <ImageIcon className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-gray-400 text-xs mt-2">لا توجد تغطيات مضافة حالياً بالمعرض.</p>
              </div>
            )}
          </div>

          {/* Form Upload Section (Right-hand side 1 col) */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-4.5 h-4.5 text-neon-cyan" />
              إضافة تغطية جديدة
            </h2>
            
            <div className="glass p-5 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
              <GalleryForm events={events} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
