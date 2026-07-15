"use client";

import React, { useState } from "react";
import { register } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock, User, CheckCircle2, AlertCircle } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "كلمتا المرور غير متطابقتين." });
      setLoading(false);
      return;
    }

    try {
      const res = await register({ name, email, password, confirmPassword });
      if (res.error) {
        setStatus({ type: "error", message: res.error });
      } else {
        setStatus({ type: "success", message: res.success || "تم إنشاء الحساب بنجاح! جاري تسجيل الدخول..." });
        (e.target as HTMLFormElement).reset();
        
        // Sign in the user and redirect to dashboard
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (!signInRes?.error) {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء التسجيل." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Alert Status Box */}
      {status?.type === "success" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      {status?.type === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      {/* Name Input */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-semibold text-gray-400 block text-right">
          الاسم الكامل
        </label>
        <div className="relative">
          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <Input
            type="text"
            id="name"
            name="name"
            required
            placeholder="أدخل اسمك الكامل..."
            className="bg-white/5 border-white/10 text-white placeholder-gray-700 pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-semibold text-gray-400 block text-right">
          البريد الإلكتروني
        </label>
        <div className="relative">
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <Input
            type="email"
            id="email"
            name="email"
            required
            placeholder="example@mail.com"
            className="bg-white/5 border-white/10 text-white placeholder-gray-700 pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-semibold text-gray-400 block text-right">
          كلمة المرور
        </label>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <Input
            type="password"
            id="password"
            name="password"
            required
            placeholder="••••••••"
            className="bg-white/5 border-white/10 text-white placeholder-gray-700 pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-400 block text-right">
          تأكيد كلمة المرور
        </label>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            placeholder="••••••••"
            className="bg-white/5 border-white/10 text-white placeholder-gray-700 pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 font-medium py-5 text-sm flex items-center justify-center gap-2 pt-3 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري إنشاء الحساب...
          </>
        ) : (
          "إنشاء حساب"
        )}
      </Button>

    </form>
  );
}
