import React from "react";
import Link from "next/link";
import { WorkshopForm } from "@/components/admin/workshop-form";
import { ChevronLeft, PlusCircle } from "lucide-react";

export default function AdminCreateWorkshopPage() {
  return (
    <div className="w-full py-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        
        {/* Breadcrumb Back Navigation */}
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
          <Link href="/admin/workshops" className="hover:text-neon-cyan transition-colors">
            لوحة تحكم الورشات
          </Link>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-gray-200">إنشاء ورشة جديدة</span>
        </div>

        {/* Page Title Header */}
        <div className="space-y-1 text-right">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-neon-cyan" />
            إنشاء ورشة عمل جديدة
          </h1>
          <p className="text-sm text-gray-400">
            أدخل تفاصيل ومواعيد الورشة لحفظها وإطلاقها للمستخدمين بشكل فوري.
          </p>
        </div>

        {/* Form Container */}
        <div className="glass p-6 md:p-8 rounded-xl border border-white/10 shadow-xl">
          <WorkshopForm mode="create" />
        </div>

      </div>
    </div>
  );
}
