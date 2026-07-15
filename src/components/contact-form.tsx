"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/actions/contact";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    try {
      const result = await submitContact({ name, email, message });
      if (result.success) {
        setStatus({ type: "success", message: result.success });
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus({ type: "error", message: result.error || "حدث خطأ ما." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ في الاتصال بالخادم." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Status Messages */}
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
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-semibold text-gray-300 block text-right">
          الاسم الكريم
        </label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          placeholder="أدخل اسمك الكامل..."
          className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
        />
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-gray-300 block text-right">
          البريد الإلكتروني
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          required
          placeholder="example@mail.com"
          className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
        />
      </div>

      {/* Message Input */}
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-semibold text-gray-300 block text-right">
          نص الرسالة
        </label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="اكتب استفسارك أو رسالتك هنا بالتفصيل..."
          className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 transition-all font-medium py-6 text-base shadow-lg shadow-neon-cyan/15 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري إرسال الرسالة...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            إرسال الرسالة الآن
          </>
        )}
      </Button>

    </form>
  );
}
