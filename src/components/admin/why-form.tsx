"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createWhyItem, updateWhyItem } from "@/actions/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

interface WhyFormProps {
  initialWhy?: {
    id: string;
    title: string;
    description: string;
    icon: string | null;
    order: number;
  } | null;
}

export function WhyForm({ initialWhy }: WhyFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isEditMode = !!initialWhy;

  // States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Cpu");
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (initialWhy) {
      setTitle(initialWhy.title);
      setDescription(initialWhy.description);
      setIcon(initialWhy.icon || "Cpu");
      setOrder(initialWhy.order);
    } else {
      setTitle("");
      setDescription("");
      setIcon("Cpu");
      setOrder(0);
    }
  }, [initialWhy]);

  const iconsList = ["Cpu", "Zap", "Layers", "Award", "Sparkles", "Users", "Terminal", "BookOpen"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload = {
      title,
      description,
      icon,
      order: Number(order),
    };

    try {
      let result;
      if (isEditMode && initialWhy) {
        result = await updateWhyItem(initialWhy.id, payload);
      } else {
        result = await createWhyItem(payload);
      }

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: isEditMode ? "تم تحديث العنصر بنجاح!" : "تم إضافة العنصر بنجاح!" });
        if (!isEditMode) {
          setTitle("");
          setDescription("");
          setOrder(order + 1);
        }
        setTimeout(() => {
          router.push("/admin/homepage");
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حفظ العنصر." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
      
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
        <label htmlFor="whyTitle" className="text-[10px] font-semibold text-gray-400 block">
          العنوان الفرعي للميزة
        </label>
        <Input
          type="text"
          id="whyTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={saving}
          placeholder="مثال: مشاريع تخرج حقيقية..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label htmlFor="whyDesc" className="text-[10px] font-semibold text-gray-400 block">
          الوصف الوصفي للميزة
        </label>
        <Textarea
          id="whyDesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          disabled={saving}
          placeholder="شرح بسيط وواضح لكيفية مساعدة الميزة للمشتركين..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs leading-relaxed"
        />
      </div>

      {/* Icon Dropdown */}
      <div className="space-y-1">
        <label htmlFor="whyIcon" className="text-[10px] font-semibold text-gray-400 block">
          أيقونة العرض (Lucide Icon)
        </label>
        <select
          id="whyIcon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          disabled={saving}
          className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:border-neon-cyan focus:ring-neon-cyan focus:outline-none cursor-pointer"
        >
          {iconsList.map((ico) => (
            <option key={ico} value={ico} className="bg-gray-950 text-gray-300">
              {ico}
            </option>
          ))}
        </select>
      </div>

      {/* Order */}
      <div className="space-y-1">
        <label htmlFor="whyOrder" className="text-[10px] font-semibold text-gray-400 block">
          الترتيب (الوزن الرقمي التصاعدي)
        </label>
        <Input
          type="number"
          id="whyOrder"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          required
          disabled={saving}
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9 font-mono"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
        {isEditMode && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              router.push("/admin/homepage");
            }}
            disabled={saving}
            className="border-white/10 hover:bg-white/10 text-gray-400 text-[10px] h-9 cursor-pointer"
          >
            إلغاء التعديل
          </Button>
        )}
        <Button
          type="submit"
          disabled={saving || !title || !description}
          className="bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 text-xs h-9 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer flex-1"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            isEditMode ? "تحديث العنصر" : "إضافة العنصر"
          )}
        </Button>
      </div>

    </form>
  );
}
