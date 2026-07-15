import React from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { EventForm } from "@/components/admin/event-form";
import { Film, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminEventCreatePage() {
  const session = await auth();

  // Guard access
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch partners list
  let partners: any[] = [];
  try {
    partners = await db.partner.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    });
  } catch (error) {
    console.error("Failed to query partners list for events form:", error);
  }

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-2xl space-y-8">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center justify-start gap-2">
              <Film className="w-7 h-7 text-neon-cyan" />
              إضافة فعالية جديدة
            </h1>
            <p className="text-sm text-gray-400">
              قم بتهيئة مؤتمر تقني أو هاكاثون برمجي جديد واربط شركاء النجاح.
            </p>
          </div>
          
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 ml-1" />
            العودة للقائمة
          </Link>
        </div>

        {/* Form box */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
          <EventForm partners={partners} />
        </div>

      </div>
    </div>
  );
}
