"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع أثناء تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert Box */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Credentials login form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
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

        {/* Password field */}
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

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 font-medium py-5 text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري تسجيل الدخول...
            </>
          ) : (
            "تسجيل الدخول"
          )}
        </Button>
      </form>
    </div>
  );
}
