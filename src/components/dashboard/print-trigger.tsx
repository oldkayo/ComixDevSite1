"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

function PrintTriggerComponent() {
  const searchParams = useSearchParams();
  const shouldPrint = searchParams.get("print") === "true";

  useEffect(() => {
    if (shouldPrint) {
      // Delay slightly to ensure fonts and QR images load completely
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldPrint]);

  return (
    <div className="no-print w-full max-w-4xl mx-auto flex items-center justify-between gap-4 mb-6 px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 relative z-10" dir="rtl">
      <Link href="/dashboard/certificates" className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 ml-1" />
        العودة لشهاداتي
      </Link>
      <Button
        onClick={() => window.print()}
        className="bg-gradient-to-r from-neon-purple to-neon-pink text-white hover:opacity-90 text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
      >
        <Printer className="w-4 h-4" />
        طباعة الشهادة / حفظ PDF
      </Button>
    </div>
  );
}

export function PrintTrigger() {
  return (
    <Suspense fallback={
      <div className="no-print w-full max-w-4xl mx-auto h-12 bg-white/5 animate-pulse rounded-xl" />
    }>
      <PrintTriggerComponent />
    </Suspense>
  );
}
