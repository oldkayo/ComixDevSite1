import React from "react";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { deletePartner } from "@/actions/media";
import { PartnerForm } from "@/components/admin/partner-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Trash2, Edit, Award, ExternalLink, Globe, Building2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    editId?: string;
  }>;
}

export default async function AdminPartnersPage({ searchParams }: PageProps) {
  const session = await auth();

  // Guard access
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const editId = resolvedParams.editId;
  const isEditMode = !!editId;

  // Query partners list
  let partners: any[] = [];
  try {
    partners = await db.partner.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to query admin partners list:", error);
  }

  // Fetch initial partner details if editId is provided
  let initialPartner = null;
  if (editId) {
    try {
      initialPartner = await db.partner.findUnique({
        where: { id: editId },
      });
    } catch (error) {
      console.error("Failed to query partner details for editing:", error);
    }
  }

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* Header bar */}
        <div className="border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-neon-cyan" />
              إدارة شركاء النجاح
            </h1>
            <p className="text-sm text-gray-400">
              قم بإدارة وتعديل شعارات وروابط الشركات والجهات المستضيفة للفعاليات.
            </p>
          </div>
        </div>

        {/* Unified Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* List Section (Left-hand side 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-neon-cyan" />
              شركاء النجاح الحاليين ({partners.length})
            </h2>

            {partners.length > 0 ? (
              <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[550px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold">
                      <th className="p-3">الشعار / الاسم</th>
                      <th className="p-3">الموقع الإلكتروني</th>
                      <th className="p-3">الوصف</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                    {partners.map((partner) => {
                      const handleDelete = async () => {
                        "use server";
                        await deletePartner(partner.id);
                      };

                      return (
                        <tr key={partner.id} className="hover:bg-white/[0.01] transition-colors">
                          
                          {/* Logo + Name */}
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center p-1 overflow-hidden shrink-0">
                                <img src={partner.logo} alt="" className="max-h-full max-w-full object-contain" />
                              </div>
                              <span className="font-bold text-white truncate max-w-[150px]">{partner.name}</span>
                            </div>
                          </td>

                          {/* Website */}
                          <td className="p-3">
                            {partner.website ? (
                              <a
                                href={partner.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-neon-cyan hover:underline font-mono"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                زيارة الموقع
                              </a>
                            ) : (
                              <span className="text-gray-600">-</span>
                            )}
                          </td>

                          {/* Description */}
                          <td className="p-3 text-gray-400 truncate max-w-[200px]">
                            {partner.description || "-"}
                          </td>

                          {/* Actions */}
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              
                              {/* Edit trigger */}
                              <Link
                                href={`/admin/partners?editId=${partner.id}`}
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
                                  message="هل أنت متأكد من رغبتك في حذف هذا الشريك نهائياً؟"
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
                <Building2 className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-gray-400 text-xs mt-2">لا يوجد شركاء مسجلين حالياً.</p>
              </div>
            )}
          </div>

          {/* Form Create/Edit Section (Right-hand side 1 col) */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-neon-cyan" />
              {isEditMode ? "تعديل بيانات الشريك" : "إضافة شريك جديد"}
            </h2>
            
            <div className="glass p-5 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
              <PartnerForm initialPartner={initialPartner} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
