import React from "react";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { deleteNavigationLink } from "@/actions/cms";
import { NavigationForm } from "@/components/admin/navigation-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Trash2, Edit, ListFilter, LayoutGrid, EyeOff, Eye, Globe } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    editId?: string;
  }>;
}

export default async function AdminNavigationPage({ searchParams }: PageProps) {
  const session = await auth();

  // Guard access
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const editId = resolvedParams.editId;

  // Query links
  let links: any[] = [];
  try {
    links = await db.navigationLink.findMany({
      orderBy: [
        { type: "asc" },
        { order: "asc" },
      ],
    });
  } catch (error) {
    console.error("Failed to query admin navigation links list:", error);
  }

  const navbarLinks = links.filter((l) => l.type === "NAVBAR");
  const footerLinks = links.filter((l) => l.type === "FOOTER");

  // Fetch initial link if editId is provided
  let initialLink = null;
  if (editId) {
    try {
      initialLink = await db.navigationLink.findUnique({
        where: { id: editId },
      });
    } catch (error) {
      console.error("Failed to query link details for editing:", error);
    }
  }

  const renderTable = (items: any[], title: string) => (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
        <LayoutGrid className="w-4 h-4 text-neon-cyan" />
        {title} ({items.length})
      </h3>
      {items.length > 0 ? (
        <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-[10px] font-semibold">
                <th className="p-3">اسم الرابط</th>
                <th className="p-3">المسار (URL)</th>
                <th className="p-3">ترتيب العرض</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
              {items.map((item) => {
                const handleDelete = async () => {
                  "use server";
                  await deleteNavigationLink(item.id);
                };

                return (
                  <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                    
                    {/* Name */}
                    <td className="p-3 font-bold text-white">
                      {item.name}
                    </td>

                    {/* URL */}
                    <td className="p-3 font-mono text-gray-400">
                      {item.url}
                    </td>

                    {/* Order */}
                    <td className="p-3 font-mono text-neon-cyan font-bold">
                      {item.order}
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      {item.isVisible ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <Eye className="w-3.5 h-3.5" />
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500">
                          <EyeOff className="w-3.5 h-3.5" />
                          مخفي
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* Edit link trigger */}
                        <Link
                          href={`/admin/navigation?editId=${item.id}`}
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
                            message="هل أنت متأكد من رغبتك في حذف هذا الرابط؟"
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
        <div className="text-center py-6 bg-gray-950/20 rounded-2xl border border-white/5">
          <p className="text-gray-500 text-xs">لا توجد روابط مضافة حالياً.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* Header bar */}
        <div className="border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <ListFilter className="w-7 h-7 text-neon-cyan" />
              إدارة القوائم والروابط بالموقع
            </h1>
            <p className="text-sm text-gray-400">
              تحكم بروابط القائمة العلوية (Navbar) والروابط بتذييل الموقع (Footer).
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Lists Section (Left-hand side 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {renderTable(navbarLinks, "روابط القائمة العلوية Navbar")}
            {renderTable(footerLinks, "روابط القائمة السفلية Footer")}
          </div>

          {/* Form Section (Right-hand side 1 col) */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-neon-cyan" />
              {editId ? "تعديل رابط القائمة" : "إضافة رابط قائمة جديد"}
            </h2>
            
            <div className="glass p-5 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
              <NavigationForm initialLink={initialLink} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
