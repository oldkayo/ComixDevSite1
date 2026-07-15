"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAboutUsSettings } from "@/actions/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface AboutSettingsFormProps {
  initialSettings: {
    title: string;
    description: string;
    mission: string | null;
    vision: string | null;
    values: string | null;
  };
}

export function AboutSettingsForm({ initialSettings }: AboutSettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [title, setTitle] = useState(initialSettings.title || "");
  const [description, setDescription] = useState(initialSettings.description || "");
  const [mission, setMission] = useState(initialSettings.mission || "");
  const [vision, setVision] = useState(initialSettings.vision || "");
  const [values, setValues] = useState(initialSettings.values || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload = {
      title,
      description,
      mission: mission || "",
      vision: vision || "",
      values: values || "",
    };

    try {
      const result = await updateAboutUsSettings(payload);

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "تم تحديث إعدادات من نحن بنجاح!" });
        router.refresh();
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء الحفظ." });
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

      {/* Title */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-400 block">عنوان الصفحة</label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={saving}
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-sm h-10 font-bold"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-400 block">الوصف التفصيلي</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          disabled={saving}
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-xs leading-relaxed"
        />
      </div>

      {/* Mission */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-400 block">المهمة (Mission)</label>
        <Textarea
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          rows={3}
          disabled={saving}
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-xs leading-relaxed"
        />
      </div>

      {/* Vision */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-400 block">الرؤية (Vision)</label>
        <Textarea
          value={vision}
          onChange={(e) => setVision(e.target.value)}
          rows={3}
          disabled={saving}
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-xs leading-relaxed"
        />
      </div>

      {/* Values */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-400 block">القيم (Values)</label>
        <Textarea
          value={values}
          onChange={(e) => setValues(e.target.value)}
          rows={3}
          disabled={saving}
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-xs leading-relaxed"
        />
      </div>

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
            "حفظ التعديلات"
          )}
        </Button>
      </div>
    </form>
  );
}
