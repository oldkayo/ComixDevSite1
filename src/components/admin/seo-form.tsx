"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSEOSettings } from "@/actions/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface SEOFormProps {
  initialSEO: {
    id: string;
    page: string;
    title: string;
    description: string;
    keywords: string;
    ogImage: string | null;
  } | null;
}

export function SEOForm({ initialSEO }: SEOFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // States
  const [page, setPage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");

  useEffect(() => {
    if (initialSEO) {
      setPage(initialSEO.page);
      setTitle(initialSEO.title);
      setDescription(initialSEO.description);
      setKeywords(initialSEO.keywords);
      setOgImage(initialSEO.ogImage || "");
    }
  }, [initialSEO]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!initialSEO) return;

    setSaving(true);
    setStatus(null);

    const payload = {
      page,
      title,
      description,
      keywords,
      ogImage: ogImage || "",
    };

    try {
      const result = await updateSEOSettings(initialSEO.id, payload);

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "تم تحديث إعدادات SEO للصفحة بنجاح!" });
        setTimeout(() => {
          router.push("/admin/seo");
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حفظ إعدادات الـ SEO." });
    } finally {
      setSaving(false);
    }
  };

  if (!initialSEO) {
    return (
      <div className="text-center py-8 text-gray-400 text-xs">
        يرجى اختيار صفحة من الجدول لتعديل إعدادات الـ SEO الخاصة بها.
      </div>
    );
  }

  const pageNamesArabic: Record<string, string> = {
    home: "الصفحة الرئيسية",
    workshops: "صفحة الورشات",
    prompts: "مكتبة البرومبتات",
    events: "صفحة الفعاليات",
    gallery: "معرض التغطيات",
    partners: "شركاء النجاح",
    contact: "اتصل بنا",
    about: "من نحن",
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

      {/* Page Display (Read Only) */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-neon-cyan block">المسار المستهدف</label>
        <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white font-mono">
          {pageNamesArabic[page] || page} ({page})
        </div>
      </div>

      {/* Meta Title */}
      <div className="space-y-1">
        <label htmlFor="seoTitle" className="text-[10px] font-semibold text-gray-400 block">
          عنوان الصفحة (Meta Title)
        </label>
        <Input
          type="text"
          id="seoTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={saving}
          placeholder="عنوان الصفحة بتبويب المتصفح..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9"
        />
      </div>

      {/* Meta Description */}
      <div className="space-y-1">
        <label htmlFor="seoDesc" className="text-[10px] font-semibold text-gray-400 block">
          وصف الصفحة للبحث (Meta Description)
        </label>
        <Textarea
          id="seoDesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          disabled={saving}
          placeholder="وصف مختصر ومحفز للبحث..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs leading-relaxed"
        />
      </div>

      {/* Keywords */}
      <div className="space-y-1">
        <label htmlFor="seoKeywords" className="text-[10px] font-semibold text-gray-400 block">
          الكلمات المفتاحية (Keywords - مفصولة بفاصلة)
        </label>
        <Input
          type="text"
          id="seoKeywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          disabled={saving}
          placeholder="مثال: ذكاء اصطناعي, برمجة, Next.js..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9"
        />
      </div>

      {/* OpenGraph Image */}
      <ImageUpload
        value={ogImage}
        onChange={setOgImage}
        disabled={saving}
        label="صورة المشاركة بمواقع التواصل (OG Image)"
        placeholder="اختر صورة أو اسحبها هنا"
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            router.push("/admin/seo");
          }}
          disabled={saving}
          className="border-white/10 hover:bg-white/10 text-gray-400 text-[10px] h-9 cursor-pointer"
        >
          إلغاء التعديل
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 text-xs h-9 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer flex-1"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "تحديث SEO الصفحة"
          )}
        </Button>
      </div>

    </form>
  );
}
