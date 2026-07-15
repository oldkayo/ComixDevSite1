import React from "react";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAboutUsSettings, getTeamMembers } from "@/lib/settings";
import { deleteTeamMember } from "@/actions/cms";
import { AboutSettingsForm } from "@/components/admin/about-settings-form";
import { TeamMemberForm } from "@/components/admin/team-member-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Users, Edit, Trash2, Plus } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    editTeamId?: string;
  }>;
}

export default async function AdminAboutPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const editTeamId = resolvedParams.editTeamId;

  const aboutSettings = await getAboutUsSettings();
  const teamMembers = await getTeamMembers();

  let initialTeamMember = null;
  if (editTeamId) {
    try {
      initialTeamMember = await db.teamMember.findUnique({
        where: { id: editTeamId },
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-neon-cyan" />
            إدارة من نحن
          </h1>
        </div>

        {/* About Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">إعدادات الصفحة</h2>
          <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl">
            <AboutSettingsForm initialSettings={aboutSettings} />
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-white">أعضاء الفريق</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              {teamMembers.length > 0 ? (
                <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl overflow-x-auto">
                  <table className="w-full text-right border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold">
                        <th className="p-3">الاسم</th>
                        <th className="p-3">الوظيفة</th>
                        <th className="p-3">الترتيب</th>
                        <th className="p-3 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                      {teamMembers.map((member) => {
                        const handleDelete = async () => {
                          "use server";
                          await deleteTeamMember(member.id);
                        };

                        return (
                          <tr key={member.id} className="hover:bg-white/[0.01]">
                            <td className="p-3">
                              <span className="font-bold text-white block">{member.name}</span>
                            </td>
                            <td className="p-3 text-gray-400">{member.position}</td>
                            <td className="p-3 font-mono text-white">{member.order}</td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-2">
                                <Link
                                  href={`/admin/about?editTeamId=${member.id}`}
                                  className={buttonVariants({
                                    variant: "outline",
                                    className: "w-8 h-8 border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 p-0",
                                  })}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Link>
                                <form action={handleDelete}>
                                  <DeleteConfirmButton
                                    message="هل أنت متأكد من حذف هذا العضو؟"
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
                  <p className="text-gray-400 text-xs">لا يوجد أعضاء فريق بعد.</p>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-neon-cyan" />
                {editTeamId ? "تعديل عضو الفريق" : "إضافة عضو جديد"}
              </h3>
              <div className="glass p-5 rounded-2xl border border-white/5 shadow-xl">
                <TeamMemberForm initialTeamMember={initialTeamMember} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
