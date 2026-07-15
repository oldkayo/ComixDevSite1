import React from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PromptForm } from "@/components/admin/prompt-form";
import { Terminal, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminPromptCreatePage() {
  const session = await auth();

  // Route guard: only allow ADMIN role
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch prompt categories dynamically
  let categories: any[] = [];
  try {
    categories = await db.promptCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch categories for prompt create page:", error);
  }

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-2xl space-y-8">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center justify-start gap-2">
              <Terminal className="w-7 h-7 text-neon-cyan" />
              إضافة برومبت جديد
            </h1>
            <p className="text-sm text-gray-400">
              قم بتهيئة رمز أوامر وتفاصيل برومبت جديد ونشره لمكتبة الذكاء الاصطناعي.
            </p>
          </div>
          
          <Link
            href="/admin/prompts"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 ml-1" />
            العودة للوحة التحكم
          </Link>
        </div>

        {/* Form Container Card */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
          <PromptForm categories={categories} />
        </div>

      </div>
    </div>
  );
}
