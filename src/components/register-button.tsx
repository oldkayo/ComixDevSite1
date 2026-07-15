"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { registerForWorkshop } from "@/actions/registration";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface RegisterButtonProps {
  workshopId: string;
  workshopSlug: string;
  isLoggedIn: boolean;
  isAlreadyRegistered?: boolean;
  isFull?: boolean;
}

export function RegisterButton({
  workshopId,
  workshopSlug,
  isLoggedIn,
  isAlreadyRegistered = false,
  isFull = false,
}: RegisterButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleRegister = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/workshops/${workshopSlug}`);
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const result = await registerForWorkshop(workshopId);
      if (result.success) {
        setStatus({ type: "success", message: result.message });
        router.refresh();
      } else {
        setStatus({ type: "error", message: result.message || "حدث خطأ ما." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ في الاتصال بالخادم." });
    } finally {
      setLoading(false);
    }
  };

  // If already registered from initial page loading
  if (isAlreadyRegistered) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>أنت مسجل بالفعل في هذه الورشة التقنية.</span>
        </div>
        <Button disabled className="w-full bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 cursor-not-allowed font-medium py-6 text-base">
          أنت مسجل بالورشة
        </Button>
      </div>
    );
  }

  // If workshop is fully booked
  if (isFull && status?.type !== "success") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>عذراً، المقاعد لهذه الورشة مكتملة بالكامل.</span>
        </div>
        <Button disabled className="w-full bg-gray-900 border border-white/5 text-gray-500 cursor-not-allowed font-medium py-6 text-base">
          المقاعد مكتملة العدد
        </Button>
      </div>
    );
  }

  if (status?.type === "success") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{status.message}</span>
        </div>
        <Button disabled className="w-full bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 font-medium py-6 text-base">
          تم التسجيل بنجاح
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {status?.type === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}
      
      <Button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 transition-all font-medium py-6 text-base shadow-lg shadow-neon-cyan/15 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin ml-2" />
            جاري إرسال الطلب...
          </>
        ) : isLoggedIn ? (
          "احجز مقعدك في الورشة"
        ) : (
          "سجل دخولك للتسجيل"
        )}
      </Button>
    </div>
  );
}
