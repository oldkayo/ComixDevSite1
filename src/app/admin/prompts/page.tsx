import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { deletePrompt, togglePromptPublish } from "@/actions/prompt";
import { buttonVariants } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Terminal, 
  Calendar, 
  Copy, 
  Eye, 
  LayoutDashboard, 
  Globe, 
  EyeOff 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminPromptsPage() {
  const session = await auth();

  // Route guard: verify admin session
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch prompts directly from database
  let prompts: any[] = [];
  try {
    prompts = await db.prompt.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to query admin prompts:", error);
  }

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Terminal className="w-6 h-6 text-neon-cyan" />
              لوحة تحكم البرومبتات
            </h1>
            <p className="text-sm text-gray-400">
              قم بإنشاء وتعديل ونشر الأوامر والبرومبتات الخاصة بالذكاء الاصطناعي.
            </p>
          </div>
          
          <Link
            href="/admin/prompts/create"
            className={buttonVariants({
              className: "bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 flex items-center gap-1 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl",
            })}
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة برومبت جديد
          </Link>
        </div>

        {/* Table of Prompts */}
        {prompts.length > 0 ? (
          <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold">
                  <th className="p-4">العنوان</th>
                  <th className="p-4">التصنيف</th>
                  <th className="p-4 text-center">النسخ / المشاهدة</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">تاريخ الإنشاء</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-200">
                {prompts.map((prompt) => {
                  // Bind Server Actions for deleting and toggling
                  const handleDelete = async () => {
                    "use server";
                    await deletePrompt(prompt.id);
                  };

                  const handleTogglePublish = async () => {
                    "use server";
                    await togglePromptPublish(prompt.id);
                  };

                  return (
                    <tr key={prompt.id} className="hover:bg-white/[0.01] transition-colors">
                      
                      {/* Title */}
                      <td className="p-4 font-bold text-white max-w-[200px] truncate">
                        {prompt.title}
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-400 text-xs border border-white/10">
                          {prompt.category.name}
                        </span>
                      </td>

                      {/* Stats */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3 text-xs text-gray-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Copy className="w-3.5 h-3.5 text-neon-cyan" />
                            {prompt.copyCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-neon-purple" />
                            {prompt.viewCount}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {prompt.isPublished ? (
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

                      {/* Created Date */}
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-xs text-gray-400 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          {new Date(prompt.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* Toggle publish button */}
                          <form action={handleTogglePublish}>
                            <Button
                              type="submit"
                              variant="outline"
                              className="border-white/10 hover:bg-white/10 text-gray-300 text-xs px-2.5 h-8 cursor-pointer"
                            >
                              {prompt.isPublished ? "إلغاء النشر" : "نشر"}
                            </Button>
                          </form>

                          {/* Edit button */}
                          <Link
                            href={`/admin/prompts/${prompt.id}/edit`}
                            className={buttonVariants({
                              variant: "outline",
                              className: "border-white/10 hover:bg-white/10 text-gray-300 px-2.5 h-8 flex items-center justify-center",
                            })}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Form button */}
                          <form action={handleDelete}>
                            <DeleteConfirmButton
                              message="هل أنت متأكد من رغبتك في حذف هذا البرومبت نهائياً؟"
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
            <Terminal className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-gray-400 text-sm">لا توجد برومبتات مضافة في قاعدة البيانات حتى الآن.</p>
            <Link
              href="/admin/prompts/create"
              className={buttonVariants({
                className: "bg-gradient-to-r from-neon-cyan to-neon-blue text-white text-xs px-4 h-9",
              })}
            >
              أضف أول برومبت الآن
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
