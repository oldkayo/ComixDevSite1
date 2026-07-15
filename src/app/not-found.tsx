import React from "react";
import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden bg-gray-950 text-right" dir="rtl">
      
      {/* Background blurs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-md mx-auto">
        {/* Glowing badge */}
        <div className="inline-flex p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full animate-bounce">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-bold text-neon-cyan uppercase font-mono tracking-widest">خطأ 404</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">الصفحة غير موجودة</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو حذفها نهائياً.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className={buttonVariants({
              className: "bg-gradient-to-r from-neon-cyan to-neon-blue text-white shadow-lg shadow-neon-cyan/15 hover:opacity-90 font-medium px-8 inline-flex items-center gap-2"
            })}
          >
            <Home className="w-4 h-4 ml-1" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
