"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateLinkHubSettings } from "@/actions/linkhub";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface LinkHubSettingsFormProps {
  initialSettings: {
    title: string;
    description: string;
    logo: string | null;
    coverImage: string | null;
    isEnabled: boolean;
  };
}

export function LinkHubSettingsForm({ initialSettings }: LinkHubSettingsFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialSettings.title);
  const [description, setDescription] = useState(initialSettings.description);
  const [logo, setLogo] = useState<string>(initialSettings.logo || "");
  const [coverImage, setCoverImage] = useState<string>(initialSettings.coverImage || "");
  const [isEnabled, setIsEnabled] = useState(initialSettings.isEnabled);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload = {
      title,
      description,
      logo: logo || "",
      coverImage: coverImage || "",
      isEnabled,
    };

    try {
      const result = await updateLinkHubSettings(payload);
      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "تم حفظ إعدادات LinkHub بنجاح!" });
        router.refresh();
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حفظ البيانات." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
      {status && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
          status.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {status.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Enable Toggle Switch */}
      <div className="glass p-5 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base font-bold text-white">تفعيل صفحة الاتصال الموحدة (LinkHub)</Label>
          <p className="text-xs text-gray-400">عند تعطيلها سيتم تحويل الزوار تلقائياً إلى الصفحة الرئيسية للموقع.</p>
        </div>
        <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
      </div>

      <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
        <h3 className="text-lg font-bold text-neon-cyan border-b border-white/5 pb-3">الإعدادات العامة للرابط الموحد Connect</h3>

        {/* Page Title */}
        <div className="space-y-2">
          <Label className="text-gray-200">عنوان الصفحة الرئيسي (Title)</Label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="مثال: روابط ComixDev السريعة"
            required
            className="bg-gray-900 border-white/10 text-white"
          />
        </div>

        {/* Page Description */}
        <div className="space-y-2">
          <Label className="text-gray-200">الوصف القصير (Description)</Label>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="اكتب وصفاً جذاباً ومختصراً يظهر للمستخدمين عند الدخول..."
            required
            rows={4}
            className="bg-gray-900 border-white/10 text-white resize-none"
          />
        </div>

        {/* Logo and Banner Assets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Field */}
          <ImageUpload
            value={logo}
            onChange={setLogo}
            disabled={saving}
            label="شعار الصفحة (Logo)"
            placeholder="اختر صورة أو اسحبها هنا"
          />

          {/* Cover/Banner Image Field */}
          <ImageUpload
            value={coverImage}
            onChange={setCoverImage}
            disabled={saving}
            label="صورة الغلاف (Cover/Banner Image) - اختياري"
            placeholder="اختر صورة أو اسحبها هنا"
          />
        </div>
      </div>

      {/* Form Submission Button */}
      <div className="flex justify-start">
        <Button 
          type="submit" 
          disabled={saving}
          className="bg-gradient-to-r from-neon-cyan to-neon-blue text-white shadow-lg shadow-neon-cyan/15 hover:opacity-90 font-medium px-8"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              جاري الحفظ...
            </>
          ) : "حفظ الإعدادات"}
        </Button>
      </div>
    </form>
  );
}
