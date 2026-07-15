"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createPrompt, updatePrompt } from "@/actions/prompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Terminal, AlertCircle, CheckCircle2, FileText, Tag, Folder } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface PromptFormProps {
  categories: Category[];
  initialPrompt?: {
    id: string;
    title: string;
    description: string;
    content: string;
    categoryId: string;
    tags: string[];
    thumbnail: string | null;
    isPublished: boolean;
  };
}

export function PromptForm({ categories, initialPrompt }: PromptFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isEditMode = !!initialPrompt;

  // Form states pre-filled if editing
  const [title, setTitle] = useState(initialPrompt?.title || "");
  const [description, setDescription] = useState(initialPrompt?.description || "");
  const [content, setContent] = useState(initialPrompt?.content || "");
  const [categoryId, setCategoryId] = useState(initialPrompt?.categoryId || (categories[0]?.id || ""));
  const [tags, setTags] = useState(initialPrompt?.tags ? initialPrompt.tags.join(", ") : "");
  const [thumbnail, setThumbnail] = useState(initialPrompt?.thumbnail || "");
  const [isPublished, setIsPublished] = useState(initialPrompt?.isPublished || false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    // Prepare payload
    const payload = {
      title,
      description,
      content,
      categoryId,
      tags,
      thumbnail,
      isPublished,
    };

    try {
      let result;
      if (isEditMode && initialPrompt) {
        result = await updatePrompt(initialPrompt.id, payload);
      } else {
        result = await createPrompt(payload);
      }

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: result.success || "تم حفظ البيانات بنجاح!" });
        setTimeout(() => {
          router.push("/admin/prompts");
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حفظ البيانات." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
      
      {/* Alert Status Banners */}
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

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-xs font-semibold text-gray-400 block">
            عنوان البرومبت
          </label>
          <div className="relative">
            <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={saving}
              placeholder="مثال: مولد الـ custom react hooks..."
              className="bg-white/5 border-white/10 text-white pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan text-right text-sm"
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="space-y-1.5">
          <label htmlFor="category" className="text-xs font-semibold text-gray-400 block">
            تصنيف البرومبت
          </label>
          <div className="relative">
            <Folder className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={saving || categories.length === 0}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg pr-10 pl-4 py-2.5 text-sm focus:border-neon-cyan focus:ring-neon-cyan focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-gray-950 text-gray-300">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label htmlFor="tags" className="text-xs font-semibold text-gray-400 block">
            الوسوم (مفصولة بفاصلة)
          </label>
          <div className="relative">
            <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <Input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              required
              disabled={saving}
              placeholder="TypeScript, React, Hooks..."
              className="bg-white/5 border-white/10 text-white pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan text-right text-sm"
            />
          </div>
        </div>

        {/* Thumbnail Image URL */}
        <div className="space-y-1.5">
          <label htmlFor="thumbnail" className="text-xs font-semibold text-gray-400 block">
            رابط الصورة المصغرة (اختياري)
          </label>
          <div className="relative">
            <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <Input
              type="text"
              id="thumbnail"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              disabled={saving}
              placeholder="https://example.com/image.png..."
              className="bg-white/5 border-white/10 text-white pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan text-right text-sm"
            />
          </div>
        </div>

      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="text-xs font-semibold text-gray-400 block">
          وصف مختصر للبرومبت
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          disabled={saving}
          placeholder="شرح لوظيفة البرومبت وكيف يستفيد منه المستخدمون..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-sm leading-relaxed"
        />
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <label htmlFor="content" className="text-xs font-semibold text-gray-400 block">
          البرومبت الكامل (Prompt Content)
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={8}
          disabled={saving}
          placeholder="أدخل نص الأمر الموجه للذكاء الاصطناعي..."
          className="bg-white/5 border-white/10 text-white font-mono text-left focus:border-neon-cyan focus:ring-neon-cyan text-sm leading-relaxed"
          dir="ltr"
        />
      </div>

      {/* Publish Status Toggle */}
      <div className="flex items-center gap-2 justify-end py-2">
        <label htmlFor="isPublished" className="text-sm font-semibold text-gray-300 cursor-pointer">
          نشر البرومبت مباشرة للجمهور
        </label>
        <input
          type="checkbox"
          id="isPublished"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          disabled={saving}
          className="w-4 h-4 rounded border-white/10 bg-white/5 text-neon-cyan focus:ring-neon-cyan cursor-pointer"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-white/5 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/prompts")}
          className="border-white/10 hover:bg-white/10 text-gray-400 text-xs px-5 h-10 rounded-xl cursor-pointer"
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 text-xs px-6 h-10 rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            isEditMode ? "تحديث البرومبت" : "إنشاء البرومبت"
          )}
        </Button>
      </div>

    </form>
  );
}
