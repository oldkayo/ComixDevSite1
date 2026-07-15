"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkshop, updateWorkshop } from "@/actions/workshop";
import { WorkshopSchema } from "@/lib/schemas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, AlertCircle, Save, ArrowRight } from "lucide-react";
import Link from "next/link";

interface WorkshopFormProps {
  initialData?: {
    id: string;
    title: string;
    shortDescription: string;
    description: string;
    image: string | null;
    date: Date;
    duration: number;
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

export function WorkshopForm({ initialData, mode }: WorkshopFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState(initialData?.status || "UPCOMING");

  // Convert Date object to datetime-local string YYYY-MM-DDTHH:MM
  const formatDateForInput = (dateObj?: Date) => {
    if (!dateObj) return "";
    const date = new Date(dateObj);
    // Adjust timezone offsets manually to output local time correctly
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const shortDescription = formData.get("shortDescription") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as string;
    const date = formData.get("date") as string;
    const duration = parseInt(formData.get("duration") as string) || 120;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const location = formData.get("location") as string;
    const capacity = parseInt(formData.get("capacity") as string);
    const pointsReward = parseInt(formData.get("pointsReward") as string);
    const isPublished = formData.get("isPublished") === "true";
    const statusVal = formData.get("status") as string;
    
    const attendeeCount = parseInt(formData.get("attendeeCount") as string) || 0;
    const workshopNotes = formData.get("workshopNotes") as string;
    const hostOrganization = formData.get("hostOrganization") as string;
    const galleryLink = formData.get("galleryLink") as string;
    const workshopPhotosStr = formData.get("workshopPhotos") as string;
    const workshopVideosStr = formData.get("workshopVideos") as string;

    const payload = {
      title,
      shortDescription,
      description,
      image,
      date,
      duration,
      startTime,
      endTime,
      location,
      capacity,
      pointsReward,
      isPublished,
      status: statusVal,
      attendeeCount,
      workshopNotes,
      hostOrganization,
      galleryLink,
      workshopPhotos: workshopPhotosStr.split(",").map(s => s.trim()).filter(Boolean),
      workshopVideos: workshopVideosStr.split(",").map(s => s.trim()).filter(Boolean),
    };

    // Client-side schema validation using Zod schema
    const validationResult = WorkshopSchema.safeParse(payload);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues[0]?.message || "بيانات الإدخال غير صالحة.";
      setStatus({ type: "error", message: errorMsg });
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
          <label htmlFor="title" className="text-sm font-semibold text-gray-300 block text-right">
            عنوان الورشة
          </label>
          <Input
            type="text"
            id="title"
            name="title"
            defaultValue={initialData?.title || ""}
            required
            placeholder="مثال: ورشة الذكاء الاصطناعي التوليدي ومستقبل البرمجة..."
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>

        {/* Short Description */}
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="shortDescription" className="text-sm font-semibold text-gray-300 block text-right">
            وصف مختصر (يظهر في الكارد)
          </label>
          <Input
            type="text"
            id="shortDescription"
            name="shortDescription"
            defaultValue={initialData?.shortDescription || ""}
            required
            placeholder="اكتب وصفاً جذاباً من سطر واحد يظهر في قائمة الورشات..."
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>

        {/* Full Description */}
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="description" className="text-sm font-semibold text-gray-300 block text-right">
            وصف الورشة بالتفصيل
          </label>
          <Textarea
            id="description"
            name="description"
            defaultValue={initialData?.description || ""}
            required
            rows={6}
            placeholder="اكتب تفاصيل الورشة، المحاور الأساسية، المتطلبات، ومخرجات التعلم..."
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan resize-none"
          />
        </div>

        {/* Image URL */}
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="image" className="text-sm font-semibold text-gray-300 block text-right">
            رابط صورة الغلاف (اختياري)
          </label>
          <Input
            type="text"
            id="image"
            name="image"
            defaultValue={initialData?.image || ""}
            placeholder="يمكنك تركها فارغة لاستخدام الصورة الافتراضية للورشات..."
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>

        {/* Date Time */}
        <div className="space-y-1.5">
          <label htmlFor="date" className="text-sm font-semibold text-gray-300 block text-right">
            تاريخ ووقت البدء
          </label>
          <Input
            type="datetime-local"
            id="date"
            name="date"
            defaultValue={formatDateForInput(initialData?.date)}
            required
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan text-right"
          />
        </div>

        {/* Start Time */}
        <div className="space-y-1.5">
          <label htmlFor="startTime" className="text-sm font-semibold text-gray-300 block text-right">
            وقت البدء (اختياري)
          </label>
          <Input
            type="time"
            id="startTime"
            name="startTime"
            defaultValue={initialData?.startTime || ""}
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan text-right"
          />
        </div>

        {/* End Time */}
        <div className="space-y-1.5">
          <label htmlFor="endTime" className="text-sm font-semibold text-gray-300 block text-right">
            وقت الانتهاء (اختياري)
          </label>
          <Input
            type="time"
            id="endTime"
            name="endTime"
            defaultValue={initialData?.endTime || ""}
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan text-right"
          />
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <label htmlFor="duration" className="text-sm font-semibold text-gray-300 block text-right">
            مدة الورشة (بالدقائق)
          </label>
          <Input
            type="number"
            id="duration"
            name="duration"
            defaultValue={initialData?.duration || 120}
            required
            min={1}
            className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label htmlFor="location" className="text-sm font-semibold text-gray-300 block text-right">
            موقع إقامة الورشة
          </label>
          <Input
            type="text"
            id="location"
            name="location"
            defaultValue={initialData?.location || "عن بعد عبر الإنترنت"}
            required
            placeholder="مثال: عن بعد عبر Zoom أو الرياض - مكتب الشركة..."
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>

        {/* Capacity */}
        <div className="space-y-1.5">
          <label htmlFor="capacity" className="text-sm font-semibold text-gray-300 block text-right">
            السعة الاستيعابية (عدد المقاعد)
          </label>
          <Input
            type="number"
            id="capacity"
            name="capacity"
            defaultValue={initialData?.capacity || 30}
            required
            min={1}
            className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>

        {/* Points Reward */}
        <div className="space-y-1.5">
          <label htmlFor="pointsReward" className="text-sm font-semibold text-gray-300 block text-right">
            نقاط الولاء المكتسبة عند التسجيل
          </label>
          <Input
            type="number"
            id="pointsReward"
            name="pointsReward"
            defaultValue={initialData?.pointsReward || 50}
            required
            min={0}
            className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan"
          />
        </div>

        {/* Workshop Status */}
        <div className="space-y-1.5">
          <label htmlFor="status" className="text-sm font-semibold text-gray-300 block text-right">
            حالة الورشة
          </label>
          <select
            id="status"
            name="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
          >
            <option value="UPCOMING" className="bg-gray-950 text-white">قادمة</option>
            <option value="ONGOING" className="bg-gray-950 text-white">جارية</option>
            <option value="COMPLETED" className="bg-gray-950 text-white">مكتملة</option>
            <option value="CANCELLED" className="bg-gray-950 text-white">ملغية</option>
          </select>
        </div>

        {/* Publish Status */}
        <div className="space-y-1.5">
          <label htmlFor="isPublished" className="text-sm font-semibold text-gray-300 block text-right">
            حالة النشر
          </label>
          <select
            id="isPublished"
            name="isPublished"
            defaultValue={initialData?.isPublished ? "true" : "false"}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
          >
            <option value="false" className="bg-gray-950 text-white">مسودة (حفظ فقط)</option>
            <option value="true" className="bg-gray-950 text-white">منشورة (تظهر للجميع)</option>
          </select>
        </div>
      </div>

      {/* Conditional Fields for COMPLETED Status */}
      {selectedStatus === "COMPLETED" && (
        <div className="space-y-6 border-t border-white/10 pt-6">
          <h3 className="text-lg font-semibold text-white text-right">تفاصيل الورشة المكتملة</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendee Count */}
            <div className="space-y-1.5">
              <label htmlFor="attendeeCount" className="text-sm font-semibold text-gray-300 block text-right">
                عدد الحضور
              </label>
              <Input
                type="number"
                id="attendeeCount"
                name="attendeeCount"
                defaultValue={initialData?.attendeeCount || 0}
                min={0}
                className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
              />
            </div>

            {/* Host Organization */}
            <div className="space-y-1.5">
              <label htmlFor="hostOrganization" className="text-sm font-semibold text-gray-300 block text-right">
                الجهة المستضيفة أو الشركاء
              </label>
              <Input
                type="text"
                id="hostOrganization"
                name="hostOrganization"
                defaultValue={initialData?.hostOrganization || ""}
                placeholder="مثال: شركاء ComixDev"
                className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
              />
            </div>

            {/* Gallery Link */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="galleryLink" className="text-sm font-semibold text-gray-300 block text-right">
                رابط معرض الصور (اختياري)
              </label>
              <Input
                type="text"
                id="galleryLink"
                name="galleryLink"
                defaultValue={initialData?.galleryLink || ""}
                placeholder="رابط معرض الصور على منصة خارجية"
                className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan"
              />
            </div>

            {/* Workshop Photos (comma-separated URLs) */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="workshopPhotos" className="text-sm font-semibold text-gray-300 block text-right">
                روابط صور الورشة (افصل بينهم بفاصلة)
              </label>
              <Textarea
                id="workshopPhotos"
                name="workshopPhotos"
                defaultValue={initialData?.workshopPhotos?.join(", ") || ""}
                rows={2}
                placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan resize-none"
              />
            </div>

            {/* Workshop Videos (comma-separated URLs) */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="workshopVideos" className="text-sm font-semibold text-gray-300 block text-right">
                روابط فيديوهات الورشة (افصل بينهم بفاصلة)
              </label>
              <Textarea
                id="workshopVideos"
                name="workshopVideos"
                defaultValue={initialData?.workshopVideos?.join(", ") || ""}
                rows={2}
                placeholder="https://example.com/video1.mp4, https://example.com/video2.mp4"
                className="bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-neon-cyan resize-none"
              />
            </div>

            {/* Workshop Notes */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="workshopNotes" className="text-sm font-semibold text-gray-300 block text-right">
                ملاحظات الورشة
              </label>
              <Textarea
                id="workshopNotes"
                name="workshopNotes"
                defaultValue={initialData?.workshopNotes || ""}
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
            className: "border-white/10 hover:bg-white/10 text-gray-300 flex items-center gap-1.5"
          })}
        >
          إلغاء العودة
        </Link>
      </div>

    </form>
  );
}
