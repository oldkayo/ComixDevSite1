import React from "react";
import { LoginForm } from "@/components/login-form";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Neon Blurs */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Login Card Container */}
      <div className="max-w-md w-full glass p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-cyan to-neon-purple flex items-center justify-center mx-auto shadow-lg shadow-neon-cyan/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white">تسجيل الدخول</h1>
          <p className="text-xs md:text-sm text-gray-400">سجل الدخول إلى حسابك لمتابعة التعلم وإدارة الورشات.</p>
        </div>

        {/* Form */}
        <LoginForm />

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-400 pt-2">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="text-neon-cyan font-semibold hover:underline">
            أنشئ حساباً جديداً
          </Link>
        </p>

      </div>
    </div>
  );
}
