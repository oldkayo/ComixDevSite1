import React from "react";
import { Loader2 } from "lucide-react";

export default function GlobalLoadingPage() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center bg-gray-950">
      <div className="space-y-4">
        <Loader2 className="w-12 h-12 text-neon-cyan animate-spin mx-auto" />
        <p className="text-sm text-gray-400 font-medium">جاري تحميل الصفحة...</p>
      </div>
    </div>
  );
}
