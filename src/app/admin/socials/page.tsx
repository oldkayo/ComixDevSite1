import React from "react";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { deleteSocialLink } from "@/actions/cms";
import { SocialForm } from "@/components/admin/social-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Trash2, Edit, Share2, ExternalLink, Globe, EyeOff, Eye } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    editId?: string;
  }>;
}

export default async function AdminSocialsPage({ searchParams }: PageProps) {
  const session = await auth();

  // Guard access
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const editId = resolvedParams.editId;

  // Query social links
  let socials: any[] = [];
  try {
    socials = await db.socialLink.findMany({
      orderBy: {
        platform: "asc",
      },
    });
  } catch (error) {
    console.error("Failed to query admin social links list:", error);
  }

  // Fetch initial social link if editId is provided
  let initialSocial = null;
  if (editId) {
    try {
      initialSocial = await db.socialLink.findUnique({
        where: { id: editId },
      });
    } catch (error) {
      console.error("Failed to query social link details for editing:", error);
    }
  }

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* Header bar */}
        <div className="border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Share2 className="w-6 h-6 text-neon-cyan" />
              إدارة حسابات التواصل الاجتماعي
            </h1>
            <p className="text-sm text-gray-400">
              قم بإعداد وتحديث قنوات التواصل الخاصة بمنصة ComixDev التي تظهر في تذييل الموقع.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* List Section (Left-hand side 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-neon-cyan" />
              قنوات التواصل الحالية ({socials.length})
            </h2>

            {socials.length > 0 ? (
              <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold">
                      <th className="p-3">المنصة</th>
                      <th className="p-3">رابط الحساب</th>
                      <th className="p-3">الحالة بالصفحة الرئيسية</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                    {socials.map((social) => {
                      const handleDelete = async () => {
                        "use server";
                        await deleteSocialLink(social.id);
                      };

                      return (
                        <tr key={social.id} className="hover:bg-white/[0.01] transition-colors">
                          
                          {/* Platform */}
                          <td className="p-3 font-bold text-white">
                            {social.platform}
                          </td>

                          {/* Link URL */}
                          <td className="p-3">
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-neon-cyan hover:underline font-mono"
                            >
                              {social.url}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>

                          {/* Visibility */}
                          <td className="p-3">
                            {social.isVisible ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400">
                                <Eye className="w-3.5 h-3.5" />
                                معروض
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
                              
                              {/* Edit trigger */}
                              <Link
                                href={`/admin/socials?editId=${social.id}`}
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
                                  message="هل أنت متأكد من رغبتك في حذف رابط هذه المنصة؟"
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
                <Share2 className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-gray-400 text-xs mt-2">لا توجد قنوات تواصل مضافة حالياً.</p>
              </div>
            )}
          </div>

          {/* Form Create/Edit Section (Right-hand side 1 col) */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-4.5 h-4.5 text-neon-cyan" />
              {editId ? "تعديل رابط القناة" : "إضافة قناة جديدة"}
            </h2>
            
            <div className="glass p-5 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
              <SocialForm initialSocial={initialSocial} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
