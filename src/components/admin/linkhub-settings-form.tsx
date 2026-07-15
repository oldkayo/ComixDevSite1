"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateLinkHubSettings } from "@/actions/linkhub";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Image as ImageIcon, Loader2 } from "lucide-react";

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

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isCover) setUploadingCover(true);
    else setUploadingLogo(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "comix_dev_preset");

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (isCover) setCoverImage(data.secure_url);
        else setLogo(data.secure_url);
      } else {
        const mockUrl = `/images/workshop_ai.png`;
        if (isCover) setCoverImage(mockUrl);
        else setLogo(mockUrl);
      }
    } catch (err) {
      const mockUrl = `/images/workshop_ai.png`;
      if (isCover) setCoverImage(mockUrl);
      else setLogo(mockUrl);
    } finally {
      if (isCover) setUploadingCover(false);
      else setUploadingLogo(false);
    }
  };

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
          <div className="space-y-3">
            <Label className="text-gray-200">شعار الصفحة (Logo)</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {logo ? (
                  <img src={logo} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                )}
              </div>
              <div className="space-y-2 flex-1">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, false)}
                  className="bg-gray-900 border-white/10 text-white text-xs cursor-pointer file:text-white file:bg-white/10 file:border-0"
                />
                <p className="text-[10px] text-gray-500">حجم مربع موصى به (مثل: 200×200 بكسل).</p>
              </div>
            </div>
          </div>

          {/* Cover/Banner Image Field */}
          <div className="space-y-3">
            <Label className="text-gray-200">صورة الغلاف (Cover/Banner Image) - اختياري</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {coverImage ? (
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                )}
              </div>
              <div className="space-y-2 flex-1">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, true)}
                  className="bg-gray-900 border-white/10 text-white text-xs cursor-pointer file:text-white file:bg-white/10 file:border-0"
                />
                <p className="text-[10px] text-gray-500">تظهر كخلفية علوية جذابة (مثل: 1200×400 بكسل).</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Submission Button */}
      <div className="flex justify-start">
        <Button 
          type="submit" 
          disabled={saving || uploadingLogo || uploadingCover}
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
