"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to server/service trackers
    console.error("Unhandled runtime error captured:", error);
  }, [error]);

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden bg-gray-950 text-right" dir="rtl">
      
      {/* Background blurs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-md mx-auto">
        {/* Glowing badge */}
        <div className="inline-flex p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
          <AlertCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-bold text-neon-purple uppercase font-mono tracking-widest">خطأ 500</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">حدث خطأ غير متوقع</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            عذراً، واجه النظام مشكلة مؤقتة في معالجة طلبك. لقد تم تسجيل تفاصيل الخطأ برمجياً وسيتم إصلاحه فوراً.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-gradient-to-r from-neon-cyan to-neon-blue text-white shadow-lg shadow-neon-cyan/15 hover:opacity-90 font-medium px-6 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 ml-1" />
            إعادة المحاولة
          </Button>

          <Link
            href="/"
            className={buttonVariants({
              variant: "outline",
              className: "w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white font-medium px-6 inline-flex items-center justify-center gap-2"
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
