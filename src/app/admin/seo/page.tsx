import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSEOSettings } from "@/lib/settings";
import { SEOForm } from "@/components/admin/seo-form";
import { buttonVariants } from "@/components/ui/button";
import { Search, Edit, Eye, Globe } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    editId?: string;
  }>;
}

export default async function AdminSEOPage({ searchParams }: PageProps) {
  const session = await auth();

  // Guard access
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const editId = resolvedParams.editId;

  // Pages array
  const pages = ["home", "workshops", "prompts", "events", "gallery", "partners", "contact", "about"];

  // Fetch SEO configs for all pages (will automatically insert defaults if missing!)
  const seoList = await Promise.all(pages.map((p) => getSEOSettings(p)));

  // Selected SEO config if editId is provided
  const initialSEO = seoList.find((s) => s.id === editId) || null;

  const pageNamesArabic: Record<string, string> = {
    home: "الصفحة الرئيسية",
    workshops: "صفحة الورشات",
    prompts: "مكتبة البرومبتات",
    events: "صفحة الفعاليات",
    gallery: "معرض التغطيات",
    partners: "شركاء النجاح",
    contact: "اتصل بنا",
    about: "من نحن",
  };

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* Header bar */}
        <div className="border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Search className="w-7 h-7 text-neon-cyan" />
              محرك البحث وتهيئة الأرشفة (SEO Settings)
            </h1>
            <p className="text-sm text-gray-400">
              قم بتهيئة العناوين والكلمات المفتاحية وأغلفة المشاركة لكل صفحة لتحسين ظهورها بمحركات البحث.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* List Section (Left-hand side 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-neon-cyan" />
              مسارات الصفحات القابلة للأرشفة ({seoList.length})
            </h2>

            <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold">
                    <th className="p-3">الصفحة</th>
                    <th className="p-3">عنوان البحث Meta Title</th>
                    <th className="p-3">وصف البحث Meta Description</th>
                    <th className="p-3 text-center">تعديل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                  {seoList.map((seo) => (
                    <tr key={seo.id} className="hover:bg-white/[0.01] transition-colors">
                      
                      {/* Page Name */}
                      <td className="p-3 font-bold text-white truncate max-w-[120px]">
                        <div>{pageNamesArabic[seo.page] || seo.page}</div>
                        <span className="text-[10px] text-gray-500 font-mono">/{seo.page === "home" ? "" : seo.page}</span>
                      </td>

                      {/* SEO Title */}
                      <td className="p-3 text-neon-cyan max-w-[180px] truncate">
                        {seo.title}
                      </td>

                      {/* SEO Desc */}
                      <td className="p-3 text-gray-400 max-w-[200px] truncate">
                        {seo.description}
                      </td>

                      {/* Edit Trigger */}
                      <td className="p-3 text-center">
                        <Link
                          href={`/admin/seo?editId=${seo.id}`}
                          className={buttonVariants({
                            variant: "outline",
                            className: "w-8 h-8 border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 p-0 mx-auto",
                          })}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Create/Edit Section (Right-hand side 1 col) */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-4.5 h-4.5 text-neon-cyan" />
              تعديل أرشفة الصفحة
            </h2>
            
            <div className="glass p-5 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
              <SEOForm initialSEO={initialSEO as any} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
