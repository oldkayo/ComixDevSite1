import React from "react";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { deleteTestimonial } from "@/actions/cms";
import { TestimonialForm } from "@/components/admin/testimonial-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Trash2, Edit, MessageSquare, ExternalLink, User, MessageCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    editId?: string;
  }>;
}

export default async function AdminTestimonialsPage({ searchParams }: PageProps) {
  const session = await auth();

  // Guard access
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const editId = resolvedParams.editId;

  // Query testimonials (will automatically insert defaults if database is empty!)
  let testimonialsList: any[] = [];
  try {
    testimonialsList = await db.testimonial.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    
    if (testimonialsList.length === 0) {
      // Seed defaults
      const defaults = [
        { name: "أحمد الشمري", role: "مهندس برمجيات", content: "ورشة العمل حول الـ LLMs كانت مذهلة بحق! البناء العملي وفهم LangChain ساعدني في تحويل فكرتي إلى تطبيق حقيقي متكامل.", image: null },
        { name: "سارة العتيبي", role: "مطور واجهات أمامية", content: "ورشة Next.js 16 كانت نقطة تحول بالنسبة لي. التطبيق العملي ونظام النقاط والتشجيع ساعدني كثيراً في ترتيب أفكاري البرمجية وتطوير مهاراتي.", image: null },
        { name: "محمد الخالدي", role: "رائد أعمال تقني", content: "مكتبة البرومبتات الجاهزة وفرت عليّ ساعات طويلة من التفكير والتجربة في كتابة الأوامر للذكاء الاصطناعي لإنشاء محتوى لشركتي.", image: null },
      ];
      for (const d of defaults) {
        await db.testimonial.create({ data: d });
      }
      testimonialsList = await db.testimonial.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
    }
  } catch (error) {
    console.error("Failed to query admin testimonials list:", error);
  }

  // Fetch initial testimonial if editId is provided
  let initialTestimonial = null;
  if (editId) {
    try {
      initialTestimonial = await db.testimonial.findUnique({
        where: { id: editId },
      });
    } catch (error) {
      console.error("Failed to query testimonial details for editing:", error);
    }
  }

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* Header bar */}
        <div className="border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-neon-cyan" />
              إدارة آراء وتقييمات المشاركين
            </h1>
            <p className="text-sm text-gray-400">
              قم بإدارة وعرض وحذف التقييمات وآراء الطلاب التي تظهر في الصفحة الرئيسية للمنصة.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* List Section (Left-hand side 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-4.5 h-4.5 text-neon-cyan" />
              التقييمات الحالية ({testimonialsList.length})
            </h2>

            {testimonialsList.length > 0 ? (
              <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[550px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold">
                      <th className="p-3">المشارك / الوظيفة</th>
                      <th className="p-3">نص الرأي والتجربة</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                    {testimonialsList.map((testi) => {
                      const handleDelete = async () => {
                        "use server";
                        await deleteTestimonial(testi.id);
                      };

                      return (
                        <tr key={testi.id} className="hover:bg-white/[0.01] transition-colors">
                          
                          {/* Name + Avatar */}
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                                {testi.image ? (
                                  <img src={testi.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-4 h-4 text-neon-cyan" />
                                )}
                              </div>
                              <div className="truncate max-w-[130px]">
                                <span className="font-bold text-white block">{testi.name}</span>
                                <span className="text-[10px] text-gray-500 block">{testi.role}</span>
                              </div>
                            </div>
                          </td>

                          {/* Content text */}
                          <td className="p-3 text-gray-400 max-w-[300px] truncate leading-relaxed">
                            {testi.content}
                          </td>

                          {/* Actions */}
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              
                              {/* Edit trigger */}
                              <Link
                                href={`/admin/testimonials?editId=${testi.id}`}
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
                                  message="هل أنت متأكد من رغبتك في حذف رأي هذا المشترك؟"
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
                <MessageSquare className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-gray-400 text-xs mt-2">لا توجد تقييمات مضافة حالياً.</p>
              </div>
            )}
          </div>

          {/* Form Create/Edit Section (Right-hand side 1 col) */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-neon-cyan" />
              {editId ? "تعديل رأي المشترك" : "إضافة رأي جديد"}
            </h2>
            
            <div className="glass p-5 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
              <TestimonialForm initialTestimonial={initialTestimonial} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
