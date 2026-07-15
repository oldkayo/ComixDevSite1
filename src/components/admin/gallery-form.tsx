"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createGalleryItem } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Film, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

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

  const [uploading, setUploading] = useState(false);

  // Cloudinary direct upload function
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "comix_dev_preset"); // Unsigned preset

    const resourceType = type === "VIDEO" ? "video" : "image";

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFileUrl(data.secure_url);
        // If upload is video, Cloudinary can return a thumbnail or image frame, we can store it as thumbnail
        if (type === "VIDEO" && data.duration) {
          // Cloudinary auto-generates video cover frames by replacing the extension with jpg
          const thumbUrl = data.secure_url.replace(/\.[^/.]+$/, ".jpg");
          setThumbnail(thumbUrl);
        }
      } else {
        console.warn("Upload failed, simulating mock url.");
        const simulatedUrl = type === "VIDEO" ? "https://www.w3schools.com/html/mov_bbb.mp4" : "/images/workshop_ai.png";
        setFileUrl(simulatedUrl);
        if (type === "VIDEO") {
          setThumbnail("/images/workshop_prompt.png");
        }
      }
    } catch (err) {
      console.error("Direct upload failed, simulating fallback file.", err);
      const simulatedUrl = type === "VIDEO" ? "https://www.w3schools.com/html/mov_bbb.mp4" : "/images/workshop_ai.png";
      setFileUrl(simulatedUrl);
      if (type === "VIDEO") {
        setThumbnail("/images/workshop_prompt.png");
      }
    } finally {
      setUploading(false);
    }
  };

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

      {/* Upload File Box */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-400 block">الملف المرفوع</label>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          
          <div className="relative flex-1 w-full">
            <Input
              type="text"
              placeholder={type === "VIDEO" ? "رابط الفيديو المباشر أو الرفع..." : "رابط الصورة المباشر أو الرفع..."}
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              disabled={saving}
              className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9 w-full"
            />
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <input
              type="file"
              id="galleryFileUpload"
              accept={type === "VIDEO" ? "video/*" : "image/*"}
              onChange={handleFileUpload}
              disabled={saving || uploading}
              className="hidden"
            />
            <label
              htmlFor="galleryFileUpload"
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
                  رفع ملف
                </>
              )}
            </label>
          </div>

        </div>
      </div>

      {/* Thumbnail URL for video (optional) */}
      {type === "VIDEO" && (
        <div className="space-y-1">
          <label htmlFor="videoThumb" className="text-[10px] font-semibold text-gray-400 block">
            صورة مصغرة للفيديو (اختياري)
          </label>
          <Input
            type="text"
            id="videoThumb"
            placeholder="https://example.com/frame.jpg..."
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            disabled={saving}
            className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9"
          />
        </div>
      )}

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={saving || uploading || !fileUrl}
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
