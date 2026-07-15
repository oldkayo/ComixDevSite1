import React from "react";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { deleteWhyItem } from "@/actions/cms";
import { getHeroSettings, getWhyItems } from "@/lib/settings";
import { HeroForm } from "@/components/admin/hero-form";
import { WhyForm } from "@/components/admin/why-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Trash2, Edit, Home, HelpCircle, Layers, Star, Plus } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    editWhyId?: string;
  }>;
}

export default async function AdminHomepagePage({ searchParams }: PageProps) {
  const session = await auth();

  // Guard access
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const editWhyId = resolvedParams.editWhyId;

  // Fetch Hero settings (auto-seeded if empty)
  const hero = await getHeroSettings();

  // Fetch Why items (auto-seeded if empty)
  const whyItems = await getWhyItems();

  // Fetch initial why item if editWhyId is provided
  let initialWhy = null;
  if (editWhyId) {
    try {
      initialWhy = await db.whyComixDevItem.findUnique({
        where: { id: editWhyId },
      });
    } catch (error) {
      console.error("Failed to query why item details for editing:", error);
    }
  }

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        
        {/* Header bar */}
        <div className="border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Home className="w-7 h-7 text-neon-cyan" />
              إدارة محتوى الصفحة الرئيسية
            </h1>
            <p className="text-sm text-gray-400">
              تحكم بجميع نصوص وصور الواجهة الافتتاحية للهيرو وقسم مزايا ومميزات الأكاديمية.
            </p>
          </div>
        </div>

        {/* 1. Hero Section Management */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-neon-cyan" />
            إدارة الهيرو (Hero Section)
          </h2>
          <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
            <HeroForm initialHero={hero as any} />
          </div>
        </div>

        {/* 2. Why ComixDev items Management */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-neon-cyan" />
            إدارة مميزات ومزايا المنصة (Why ComixDev Section)
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* List Table (Left-hand side 2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-neon-cyan" />
                المميزات الحالية المضافة ({whyItems.length})
              </h3>

              {whyItems.length > 0 ? (
                <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl overflow-x-auto">
                  <table className="w-full text-right border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold">
                        <th className="p-3">الميزة / العنوان</th>
                        <th className="p-3">الوصف</th>
                        <th className="p-3 font-mono">الترتيب</th>
                        <th className="p-3 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                      {whyItems.map((item) => {
                        const handleDelete = async () => {
                          "use server";
                          await deleteWhyItem(item.id);
                        };

                        return (
                          <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                            
                            {/* Title + Icon */}
                            <td className="p-3">
                              <span className="font-bold text-white block">{item.title}</span>
                              <span className="text-[10px] text-neon-cyan font-mono">{item.icon || "Cpu"}</span>
                            </td>

                            {/* Description */}
                            <td className="p-3 text-gray-400 max-w-[200px] truncate leading-relaxed">
                              {item.description}
                            </td>

                            {/* Order weight */}
                            <td className="p-3 font-mono font-bold text-white">
                              {item.order}
                            </td>

                            {/* Actions */}
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-2">
                                
                                {/* Edit trigger */}
                                <Link
                                  href={`/admin/homepage?editWhyId=${item.id}`}
                                  className={buttonVariants({
                                    variant: "outline",
                                    className: "w-8 h-8 border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 p-0",
                                  })}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Link>

                                {/* Delete Form */}
                                <form action={handleDelete}>
                                  <DeleteConfirmButton
                                    message="هل أنت متأكد من رغبتك في حذف ميزة المنصة هذه؟"
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
                <div className="text-center py-12 bg-gray-950/20 rounded-2xl border border-white/5">
                  <p className="text-gray-400 text-xs">لا توجد مزايا مضافة حالياً.</p>
                </div>
              )}
            </div>

            {/* Why Form (Right-hand side 1 col) */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-neon-cyan" />
                {editWhyId ? "تعديل الميزة المحددة" : "إضافة ميزة جديدة للتعريف"}
              </h3>
              
              <div className="glass p-5 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
                <WhyForm initialWhy={initialWhy} />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
