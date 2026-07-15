"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTestimonial, updateTestimonial } from "@/actions/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, AlertCircle, Sparkles, User } from "lucide-react";

interface TestimonialFormProps {
  initialTestimonial?: {
    id: string;
    name: string;
    role: string;
    image: string | null;
    content: string;
  } | null;
}

export function TestimonialForm({ initialTestimonial }: TestimonialFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isEditMode = !!initialTestimonial;

  // States
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialTestimonial) {
      setName(initialTestimonial.name);
      setRole(initialTestimonial.role);
      setImage(initialTestimonial.image || "");
      setContent(initialTestimonial.content);
    } else {
      setName("");
      setRole("");
      setImage("");
      setContent("");
    }
  }, [initialTestimonial]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "comix_dev_preset"); // Unsigned preset

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImage(data.secure_url);
      } else {
        setImage("/images/workshop_ai.png");
      }
    } catch (err) {
      setImage("/images/workshop_ai.png");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload = {
      name,
      role,
      image: image || "",
      content,
    };

    try {
      let result;
      if (isEditMode && initialTestimonial) {
        result = await updateTestimonial(initialTestimonial.id, payload);
      } else {
        result = await createTestimonial(payload);
      }

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: isEditMode ? "تم تحديث الرأي بنجاح!" : "تم إضافة رأي المشترك بنجاح!" });
        if (!isEditMode) {
          setName("");
          setRole("");
          setImage("");
          setContent("");
        }
        setTimeout(() => {
          router.push("/admin/testimonials");
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حفظ رأي المشترك." });
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

      {/* Name */}
      <div className="space-y-1">
        <label htmlFor="testiName" className="text-[10px] font-semibold text-gray-400 block">
          اسم الطالب / المشترك
        </label>
        <Input
          type="text"
          id="testiName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={saving}
          placeholder="مثال: سارة محمد..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9"
        />
      </div>

      {/* Role */}
      <div className="space-y-1">
        <label htmlFor="testiRole" className="text-[10px] font-semibold text-gray-400 block">
          الوظيفة / الدور
        </label>
        <Input
          type="text"
          id="testiRole"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          disabled={saving}
          placeholder="مثال: مطور برمجيات، طالب حاسب..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9"
        />
      </div>

      {/* Avatar Image Upload */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-400 block">صورة شخصية (اختياري)</label>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          
          <div className="relative flex-1 w-full">
            <Input
              type="text"
              placeholder="رابط الصورة المباشر أو الرفع..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              disabled={saving}
              className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9 w-full"
            />
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <input
              type="file"
              id="testiImageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={saving || uploading}
              className="hidden"
            />
            <label
              htmlFor="testiImageUpload"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-semibold px-4 h-9 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-neon-cyan" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
                  رفع صورة
                </>
              )}
            </label>
          </div>

        </div>

        {image && (
          <div className="mt-2 w-12 h-12 rounded-full overflow-hidden border border-white/5 bg-gray-900 flex items-center justify-center">
            <img src={image} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Content Textarea */}
      <div className="space-y-1">
        <label htmlFor="testiContent" className="text-[10px] font-semibold text-gray-400 block">
          نص الرأي / التجربة
        </label>
        <Textarea
          id="testiContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
          disabled={saving}
          placeholder="شرح التجربة وماذا حقق المشترك بالمنصة..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs leading-relaxed"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
        {isEditMode && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              router.push("/admin/testimonials");
            }}
            disabled={saving}
            className="border-white/10 hover:bg-white/10 text-gray-400 text-[10px] h-9 cursor-pointer"
          >
            إلغاء التعديل
          </Button>
        )}
        <Button
          type="submit"
          disabled={saving || uploading || !name || !role || !content}
          className="bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 text-xs h-9 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer flex-1"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            isEditMode ? "تحديث الرأي" : "إضافة رأي المشترك"
          )}
        </Button>
      </div>

    </form>
  );
}
