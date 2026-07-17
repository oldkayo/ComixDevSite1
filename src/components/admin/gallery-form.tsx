"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createGalleryItem } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { VideoUpload } from "@/components/ui/video-upload";
import { Loader2, Film, CheckCircle2, AlertCircle } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
}

interface GalleryFormProps {
  events: EventItem[];
}

export function GalleryForm({ events }: GalleryFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [title, setTitle] = useState("");
  const [eventId, setEventId] = useState(events[0]?.id || "");
  const [type, setType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [fileUrl, setFileUrl] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!eventId) {
      setStatus({ type: "error", message: "يرجى تحديد الفعالية المرتبطة أولاً (يجب إضافة فعالية أولاً)." });
      return;
    }
    setSaving(true);
    setStatus(null);

    const payload = {
      title,
      eventId,
      type,
      fileUrl,
      thumbnail: thumbnail || undefined,
    };

    try {
      const result = await createGalleryItem(payload);

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "تم إضافة ملف التغطية بنجاح المعرض!" });
        // Reset form inputs
        setTitle("");
        setFileUrl("");
        setThumbnail("");
        router.refresh();
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حفظ ملف التغطية." });
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
        <label htmlFor="galleryTitle" className="text-[10px] font-semibold text-gray-400 block">
          العنوان الوصفي للصورة/الفيديو
        </label>
        <Input
          type="text"
          id="galleryTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={saving}
          placeholder="مثال: لقطة من الجلسة الحوارية..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9"
        />
      </div>

      {/* Associated Event */}
      <div className="space-y-1">
        <label htmlFor="galleryEvent" className="text-[10px] font-semibold text-gray-400 block">
          الفعالية المرتبطة
        </label>
        <select
          id="galleryEvent"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          disabled={saving || events.length === 0}
          className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:border-neon-cyan focus:ring-neon-cyan focus:outline-none cursor-pointer"
        >
          {events.length === 0 ? (
            <option>يرجى إنشاء فعالية أولاً...</option>
          ) : (
            events.map((ev) => (
              <option key={ev.id} value={ev.id} className="bg-gray-950 text-gray-300">
                {ev.title}
              </option>
            ))
          )}
        </select>
      </div>

      {/* File Type */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-400 block">نوع الملف</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setType("IMAGE");
              setFileUrl("");
              setThumbnail("");
            }}
            disabled={saving}
            className={`py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              type === "IMAGE"
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            صورة (IMAGE)
          </button>
          <button
            type="button"
            onClick={() => {
              setType("VIDEO");
              setFileUrl("");
              setThumbnail("");
            }}
            disabled={saving}
            className={`py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              type === "VIDEO"
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            فيديو (VIDEO)
          </button>
        </div>
      </div>

      {/* Upload File */}
      {type === "IMAGE" ? (
        <ImageUpload
          value={fileUrl}
          onChange={setFileUrl}
          disabled={saving}
          label="الصورة المرفوعة"
          placeholder="اختر صورة أو اسحبها هنا"
        />
      ) : (
        <VideoUpload
          value={fileUrl}
          onChange={setFileUrl}
          disabled={saving}
          label="الفيديو المرفوع"
          placeholder="اختر فيديو أو اسحبه هنا"
        />
      )}

      {/* Thumbnail URL for video (optional) */}
      {type === "VIDEO" && (
        <ImageUpload
          value={thumbnail}
          onChange={setThumbnail}
          disabled={saving}
          label="صورة مصغرة للفيديو (اختياري)"
          placeholder="اختر صورة أو اسحبها هنا"
        />
      )}

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={saving || !fileUrl}
          className="w-full bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 text-xs h-9 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "إضافة ملف التغطية المعرض"
          )}
        </Button>
      </div>

    </form>
  );
}
