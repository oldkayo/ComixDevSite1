"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateHeroSettings } from "@/actions/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface HeroFormProps {
  initialHero: {
    title: string;
    description: string;
    backgroundImage: string | null;
    buttonText1: string | null;
    buttonLink1: string | null;
    buttonText2: string | null;
    buttonLink2: string | null;
  };
}

export function HeroForm({ initialHero }: HeroFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // States
  const [title, setTitle] = useState(initialHero.title || "");
  const [description, setDescription] = useState(initialHero.description || "");
  const [backgroundImage, setBackgroundImage] = useState(initialHero.backgroundImage || "");
  const [buttonText1, setButtonText1] = useState(initialHero.buttonText1 || "");
  const [buttonLink1, setButtonLink1] = useState(initialHero.buttonLink1 || "");
  const [buttonText2, setButtonText2] = useState(initialHero.buttonText2 || "");
  const [buttonLink2, setButtonLink2] = useState(initialHero.buttonLink2 || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload = {
      title,
      description,
      backgroundImage: backgroundImage || "",
      buttonText1: buttonText1 || "",
      buttonLink1: buttonLink1 || "",
      buttonText2: buttonText2 || "",
      buttonLink2: buttonLink2 || "",
    };

    try {
      const result = await updateHeroSettings(payload);

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "تم تحديث واجهة الهيرو بنجاح!" });
        router.refresh();
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حفظ الإعدادات." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
      
      {/* Alert Status Banners */}
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

      {/* Hero Title */}
      <div className="space-y-1">
        <label htmlFor="heroTitle" className="text-[10px] font-semibold text-gray-400 block">
          العنوان الرئيسي للهيرو (Hero Title)
        </label>
        <Input
          type="text"
          id="heroTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={saving}
          placeholder="مثال: Build. Learn. Innovate with AI..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-sm h-10 font-bold"
        />
      </div>

      {/* Hero Description */}
      <div className="space-y-1">
        <label htmlFor="heroDesc" className="text-[10px] font-semibold text-gray-400 block">
          الوصف التفصيلي المرفق (Hero Description)
        </label>
        <Textarea
          id="heroDesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          disabled={saving}
          placeholder="نساعدك على تطوير مهاراتك التقنية من خلال ورش عمل عملية..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-xs leading-relaxed"
        />
      </div>

      {/* Buttons Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-y border-white/5 py-4">
        
        {/* Button 1 */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-neon-cyan block">زر الإجراء الرئيسي (Button 1)</span>
          <div className="space-y-1">
            <label className="text-[9px] text-gray-500">نص الزر</label>
            <Input
              type="text"
              value={buttonText1}
              onChange={(e) => setButtonText1(e.target.value)}
              disabled={saving}
              placeholder="استكشف الورشات"
              className="bg-white/5 border-white/10 text-white text-xs h-8"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-gray-500">رابط التوجيه (URL)</label>
            <Input
              type="text"
              value={buttonLink1}
              onChange={(e) => setButtonLink1(e.target.value)}
              disabled={saving}
              placeholder="/workshops"
              className="bg-white/5 border-white/10 text-white text-xs h-8 font-mono"
            />
          </div>
        </div>

        {/* Button 2 */}
        <div className="space-y-3 md:border-r md:border-white/5 md:pr-4">
          <span className="text-[10px] font-bold text-neon-purple block">زر الإجراء الثانوي (Button 2)</span>
          <div className="space-y-1">
            <label className="text-[9px] text-gray-500">نص الزر</label>
            <Input
              type="text"
              value={buttonText2}
              onChange={(e) => setButtonText2(e.target.value)}
              disabled={saving}
              placeholder="أنشئ حسابك"
              className="bg-white/5 border-white/10 text-white text-xs h-8"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-gray-500">رابط التوجيه (URL)</label>
            <Input
              type="text"
              value={buttonLink2}
              onChange={(e) => setButtonLink2(e.target.value)}
              disabled={saving}
              placeholder="/register"
              className="bg-white/5 border-white/10 text-white text-xs h-8 font-mono"
            />
          </div>
        </div>

      </div>

      {/* Background Image Upload */}
      <ImageUpload
        value={backgroundImage}
        onChange={setBackgroundImage}
        disabled={saving}
        label="خلفية الهيرو المخصصة (اختياري)"
        placeholder="اختر صورة أو اسحبها هنا"
      />

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 text-xs px-6 h-9 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "تحديث قسم الهيرو"
          )}
        </Button>
      </div>

    </form>
  );
}
