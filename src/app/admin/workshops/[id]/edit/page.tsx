import React from "react";
import Link from "next/link";
import { getWorkshopById } from "@/lib/data";
import { WorkshopForm } from "@/components/admin/workshop-form";
import { ChevronLeft, Edit3, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditWorkshopPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Retrieve existing workshop details
  const workshop = await getWorkshopById(id);

  if (!workshop) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">عذراً، الورشة غير موجودة</h2>
          <p className="text-gray-400 text-sm">الورشة التي تحاول تعديلها غير موجودة أو تم حذفها.</p>
        </div>
        <Link
          href="/admin/workshops"
          className={buttonVariants({
            variant: "outline",
            className: "border-white/10 hover:bg-white/10 inline-flex items-center justify-center gap-2"
          })}
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full py-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        
        {/* Breadcrumb Back Navigation */}
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
          <Link href="/admin/workshops" className="hover:text-neon-cyan transition-colors">
            لوحة تحكم الورشات
          </Link>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-gray-200">تعديل الورشة</span>
        </div>

        {/* Page Title Header */}
        <div className="space-y-1 text-right">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-neon-cyan" />
            تعديل ورشة العمل
          </h1>
          <p className="text-sm text-gray-400">
            قم بتحديث المواعيد أو الوصف أو السعة الاستيعابية الخاصة بالورشة.
          </p>
        </div>

        {/* Form Container */}
        <div className="glass p-6 md:p-8 rounded-xl border border-white/10 shadow-xl">
          <WorkshopForm mode="edit" initialData={workshop} />
        </div>

      </div>
    </div>
  );
}
