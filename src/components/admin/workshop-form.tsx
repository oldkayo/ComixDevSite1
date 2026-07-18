"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkshop, updateWorkshop } from "@/actions/workshop";
import { WorkshopSchema } from "@/lib/schemas";
import { Button, buttonVariants } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface WorkshopFormProps {
  initialData?: {
    id: string;
    title: string;
    shortDescription: string;
    description: string;
    coverImage: string | null;
    date: Date;
    duration?: string | null;
    location: string;
    capacity: number;
    pointsReward: number;
    isPublished: boolean;
    status?: string;
    startTime?: string | null;
    endTime?: string | null;
    attendeeCount?: number;
    workshopNotes?: string | null;
    hostOrganization?: string | null;
    galleryLink?: string | null;
    workshopPhotos?: string[];
    workshopVideos?: string[];
  };
  mode: "create" | "edit";
}

// Convert Date object to YYYY-MM-DD string
const formatDateForInput = (dateObj?: Date) => {
  if (!dateObj) return "";
  const date = new Date(dateObj);
  return date.toISOString().split("T")[0];
};

export function WorkshopForm({ initialData, mode }: WorkshopFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState(
    initialData?.status || "UPCOMING",
  );

  const [title, setTitle] = useState(initialData?.title || "");
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || "",
  );
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [date, setDate] = useState(formatDateForInput(initialData?.date));
  const [startTime, setStartTime] = useState(initialData?.startTime || "");
  const [endTime, setEndTime] = useState(initialData?.endTime || "");
  const [location, setLocation] = useState(
    initialData?.location || "عن بعد عبر الإنترنت",
  );
  const [capacity, setCapacity] = useState(initialData?.capacity || 30);
  const [pointsReward, setPointsReward] = useState(
    initialData?.pointsReward || 0,
  );
  const [isPublished, setIsPublished] = useState(
    initialData?.isPublished ? "true" : "false",
  );
  const [attendeeCount, setAttendeeCount] = useState(
    initialData?.attendeeCount || 0,
  );
  const [hostOrganization, setHostOrganization] = useState(
    initialData?.hostOrganization || "",
  );
  const [galleryLink, setGalleryLink] = useState(
    initialData?.galleryLink || "",
  );
  const [workshopPhotosStr, setWorkshopPhotosStr] = useState(
    initialData?.workshopPhotos?.join(", ") || "",
  );
  const [workshopVideosStr, setWorkshopVideosStr] = useState(
    initialData?.workshopVideos?.join(", ") || "",
  );
  const [workshopNotes, setWorkshopNotes] = useState(
    initialData?.workshopNotes || "",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const payload = {
      title,
      shortDescription,
      description,
      image: coverImage,
      date,
      startTime,
      endTime,
      location,
      capacity,
      pointsReward,
      isPublished: isPublished === "true",
      status: selectedStatus as
        | "UPCOMING"
        | "ONGOING"
        | "COMPLETED"
        | "CANCELLED",
      attendeeCount: selectedStatus === "COMPLETED" ? attendeeCount : 0,
      workshopNotes: selectedStatus === "COMPLETED" ? workshopNotes : "",
      hostOrganization: selectedStatus === "COMPLETED" ? hostOrganization : "",
      galleryLink: selectedStatus === "COMPLETED" ? galleryLink : "",
      workshopPhotos:
        selectedStatus === "COMPLETED"
          ? workshopPhotosStr
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      workshopVideos:
        selectedStatus === "COMPLETED"
          ? workshopVideosStr
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
    };

    console.log("WorkshopForm payload:", payload);
    const validationResult = WorkshopSchema.safeParse(payload);
    console.log("WorkshopForm validationResult:", validationResult);
    if (!validationResult.success) {
      const errorMsgs = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(" | ");
      console.error(
        "WorkshopForm validation errors:",
        validationResult.error.issues,
      );
      setStatus({ type: "error", message: `خطأ في البيانات: ${errorMsgs}` });
      setLoading(false);
      return;
    }

    try {
      let result;
      if (mode === "create") {
        result = await createWorkshop(payload);
      } else {
        result = await updateWorkshop(initialData!.id, payload);
      }

      if (result.success) {
        setStatus({ type: "success", message: result.success });
        setTimeout(() => {
          router.push("/admin/workshops");
          router.refresh();
        }, 1200);
      } else {
        setStatus({ type: "error", message: result.error || "حدث خطأ ما." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "حدث خطأ في الاتصال بالخادم." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Alerts */}
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
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-gray-300 block text-right">
            عنوان الورشة
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="مثال: ورشة الذكاء الاصطناعي التوليدي ومستقبل البرمجة..."
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>

        {/* Short Description */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-gray-300 block text-right">
            وصف مختصر (يظهر في الكارد)
          </label>
          <Input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
            placeholder="اكتب وصفاً جذاباً من سطر واحد يظهر في قائمة الورشات..."
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>

        {/* Full Description */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-gray-300 block text-right">
            وصف الورشة بالتفصيل
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={6}
            placeholder="اكتب تفاصيل الورشة، المحاور الأساسية، المتطلبات، ومخرجات التعلم..."
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan resize-none"
          />
        </div>

        {/* Cover Image */}
        <div className="md:col-span-2">
          <ImageUpload
            value={coverImage}
            onChange={setCoverImage}
            disabled={loading}
            label="صورة غلاف الورشة"
            placeholder="اختر صورة أو اسحبها هنا"
          />
        </div>

        {/* Workshop Date */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-300 block text-right">
            تاريخ الورشة
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan text-right"
          />
        </div>

        {/* Start Time */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-300 block text-right">
            وقت البدء (اختياري)
          </label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan text-right"
          />
        </div>

        {/* End Time */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-300 block text-right">
            وقت الانتهاء (اختياري)
          </label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan text-right"
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-300 block text-right">
            موقع إقامة الورشة
          </label>
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="مثال: عن بعد عبر Zoom أو الرياض - مكتب الشركة..."
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>

        {/* Capacity */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-300 block text-right">
            السعة الاستيعابية (عدد المقاعد)
          </label>
          <Input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value) || 30)}
            required
            min={1}
            className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>

        {/* Points Reward */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-300 block text-right">
            نقاط الولاء المكتسبة عند التسجيل
          </label>
          <Input
            type="number"
            value={pointsReward}
            onChange={(e) => setPointsReward(parseInt(e.target.value) || 0)}
            required
            min={0}
            className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>

        {/* Workshop Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-300 block text-right">
            حالة الورشة
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
          >
            <option value="UPCOMING" className="bg-gray-950 text-white">
              قادمة
            </option>
            <option value="ONGOING" className="bg-gray-950 text-white">
              جارية
            </option>
            <option value="COMPLETED" className="bg-gray-950 text-white">
              مكتملة
            </option>
            <option value="CANCELLED" className="bg-gray-950 text-white">
              ملغية
            </option>
          </select>
        </div>

        {/* Publish Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-300 block text-right">
            حالة النشر
          </label>
          <select
            value={isPublished}
            onChange={(e) => setIsPublished(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
          >
            <option value="false" className="bg-gray-950 text-white">
              مسودة (حفظ فقط)
            </option>
            <option value="true" className="bg-gray-950 text-white">
              منشورة (تظهر للجميع)
            </option>
          </select>
        </div>
      </div>

      {/* Conditional Fields for COMPLETED Status */}
      {selectedStatus === "COMPLETED" && (
        <div className="space-y-6 border-t border-white/10 pt-6">
          <h3 className="text-lg font-semibold text-white text-right">
            تفاصيل الورشة المكتملة
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendee Count */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-300 block text-right">
                عدد الحضور
              </label>
              <Input
                type="number"
                value={attendeeCount}
                onChange={(e) =>
                  setAttendeeCount(parseInt(e.target.value) || 0)
                }
                min={0}
                className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
              />
            </div>

            {/* Host Organization */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-300 block text-right">
                الجهة المستضيفة أو الشركاء
              </label>
              <Input
                type="text"
                value={hostOrganization}
                onChange={(e) => setHostOrganization(e.target.value)}
                placeholder="مثال: شركاء ComixDev"
                className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
              />
            </div>

            {/* Gallery Link */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-gray-300 block text-right">
                رابط معرض الصور (اختياري)
              </label>
              <Input
                type="text"
                value={galleryLink}
                onChange={(e) => setGalleryLink(e.target.value)}
                placeholder="رابط معرض الصور على منصة خارجية"
                className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
              />
            </div>

            {/* Workshop Photos (comma-separated URLs) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-gray-300 block text-right">
                روابط صور الورشة (افصل بينهم بفاصلة)
              </label>
              <Textarea
                value={workshopPhotosStr}
                onChange={(e) => setWorkshopPhotosStr(e.target.value)}
                rows={2}
                placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan resize-none"
              />
            </div>

            {/* Workshop Videos (comma-separated URLs) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-gray-300 block text-right">
                روابط فيديوهات الورشة (افصل بينهم بفاصلة)
              </label>
              <Textarea
                value={workshopVideosStr}
                onChange={(e) => setWorkshopVideosStr(e.target.value)}
                rows={2}
                placeholder="https://example.com/video1.mp4, https://example.com/video2.mp4"
                className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan resize-none"
              />
            </div>

            {/* Workshop Notes */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-gray-300 block text-right">
                ملاحظات الورشة
              </label>
              <Textarea
                value={workshopNotes}
                onChange={(e) => setWorkshopNotes(e.target.value)}
                rows={3}
                placeholder="اكتب ملاحظات عن الورشة، ما تم تقديمه، التوصيات المستقبلية..."
                className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 font-medium py-5 text-sm flex items-center justify-center gap-2 flex-grow sm:flex-none sm:px-8"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              حفظ الورشة
            </>
          )}
        </Button>

        <Link
          href="/admin/workshops"
          className={buttonVariants({
            variant: "outline",
            className:
              "border-white/10 hover:bg-white/10 text-gray-300 flex items-center gap-1.5",
          })}
        >
          إلغاء العودة
        </Link>
      </div>
    </form>
  );
}
