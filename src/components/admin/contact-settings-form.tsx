"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateContactFormSettings } from "@/actions/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ContactSettingsFormProps {
  initialSettings: {
    isFormEnabled: boolean;
    receiveEmails: boolean;
    successMessage: string;
    autoReplyMessage: string | null;
  };
}

export function ContactSettingsForm({ initialSettings }: ContactSettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [isFormEnabled, setIsFormEnabled] = useState(initialSettings.isFormEnabled);
  const [receiveEmails, setReceiveEmails] = useState(initialSettings.receiveEmails);
  const [successMessage, setSuccessMessage] = useState(initialSettings.successMessage);
  const [autoReplyMessage, setAutoReplyMessage] = useState(initialSettings.autoReplyMessage || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload = {
      isFormEnabled,
      receiveEmails,
      successMessage,
      autoReplyMessage: autoReplyMessage || "",
    };

    try {
      const result = await updateContactFormSettings(payload);

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "تم حفظ إعدادات الاتصال بنجاح!" });
        router.refresh();
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
      {/* Status Banners */}
      {status?.type === "success" && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}
      {status?.type === "error" && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      {/* Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
          <span className="text-sm text-gray-300">تفعيل نموذج الاتصال</span>
          <Switch checked={isFormEnabled} onCheckedChange={setIsFormEnabled} disabled={saving} />
        </div>
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
          <span className="text-sm text-gray-300">استقبال رسائل البريد الإلكتروني</span>
          <Switch checked={receiveEmails} onCheckedChange={setReceiveEmails} disabled={saving} />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-400 block">رسالة النجاح بعد الإرسال</label>
        <Input
          value={successMessage}
          onChange={(e) => setSuccessMessage(e.target.value)}
          required
          disabled={saving}
          className="bg-white/5 border-white/10 text-white text-xs h-9"
        />
      </div>

      {/* Auto Reply */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-400 block">رسالة الرد التلقائي (اختياري)</label>
        <Textarea
          value={autoReplyMessage}
          onChange={(e) => setAutoReplyMessage(e.target.value)}
          rows={4}
          disabled={saving}
          className="bg-white/5 border-white/10 text-white text-xs"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-neon-cyan to-neon-blue text-white text-xs px-6 h-9"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "حفظ الإعدادات"
          )}
        </Button>
      </div>
    </form>
  );
}
