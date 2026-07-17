"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2, Calendar, MapPin, Users, CheckCircle2, AlertCircle } from "lucide-react";

interface Partner {
  id: string;
  name: string;
}

interface EventFormProps {
  partners: Partner[];
  initialEvent?: {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    startDate: Date;
    endDate: Date;
    location: string;
    hostedBy: string;
    attendeeCount: number;
    isPublished: boolean;
    partners: Partner[];
  };
}

export function EventForm({ partners, initialEvent }: EventFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isEditMode = !!initialEvent;

  // Form states prefilled if edit
  const [title, setTitle] = useState(initialEvent?.title || "");
  const [description, setDescription] = useState(initialEvent?.description || "");
  const [coverImage, setCoverImage] = useState(initialEvent?.coverImage || "");
  const [startDate, setStartDate] = useState(
    initialEvent?.startDate ? new Date(initialEvent.startDate).toISOString().slice(0, 16) : ""
  );
  const [endDate, setEndDate] = useState(
    initialEvent?.endDate ? new Date(initialEvent.endDate).toISOString().slice(0, 16) : ""
  );
  const [location, setLocation] = useState(initialEvent?.location || "");
  const [hostedBy, setHostedBy] = useState(initialEvent?.hostedBy || "");
  const [attendeeCount, setAttendeeCount] = useState(initialEvent?.attendeeCount || 0);
  const [isPublished, setIsPublished] = useState(initialEvent?.isPublished || false);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>(
    initialEvent?.partners.map((p) => p.id) || []
  );

  const handlePartnerToggle = (pid: string) => {
    setSelectedPartnerIds((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload = {
      title,
      description,
      coverImage,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      hostedBy,
      attendeeCount: Number(attendeeCount),
      isPublished,
      partnerIds: selectedPartnerIds,
    };

    try {
      let result;
      if (isEditMode && initialEvent) {
        result = await updateEvent(initialEvent.id, payload);
      } else {
        result = await createEvent(payload);
      }

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: result.success || "تم حفظ الفعالية بنجاح!" });
        setTimeout(() => {
          router.push("/admin/events");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حفظ الفعالية." });
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
            عنوان الفعالية
          </label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={saving}
            placeholder="مثال: مؤتمر الرياض للذكاء الاصطناعي..."
            className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-sm h-10"
          />
        </div>

        {/* Hosted By */}
        <div className="space-y-1.5">
          <label htmlFor="hostedBy" className="text-xs font-semibold text-gray-400 block">
            الجهة المنظمة / المستضيفة
          </label>
          <Input
            type="text"
            id="hostedBy"
            value={hostedBy}
            onChange={(e) => setHostedBy(e.target.value)}
            required
            disabled={saving}
            placeholder="مثال: حاضنة بادر التقنية..."
            className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-sm h-10"
          />
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <label htmlFor="startDate" className="text-xs font-semibold text-gray-400 block">
            تاريخ ووقت البدء
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="datetime-local"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={saving}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-neon-cyan focus:outline-none text-right [color-scheme:dark]"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label htmlFor="endDate" className="text-xs font-semibold text-gray-400 block">
            تاريخ ووقت الانتهاء
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="datetime-local"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              disabled={saving}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-neon-cyan focus:outline-none text-right [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label htmlFor="location" className="text-xs font-semibold text-gray-400 block">
            الموقع / المكان
          </label>
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <Input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              disabled={saving}
              placeholder="مثال: فندق الفورسيزونز، الرياض..."
              className="bg-white/5 border-white/10 text-white pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan text-right text-sm h-10"
            />
          </div>
        </div>

        {/* Attendee Count */}
        <div className="space-y-1.5">
          <label htmlFor="attendeeCount" className="text-xs font-semibold text-gray-400 block">
            عدد الحضور التقديري
          </label>
          <div className="relative">
            <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <Input
              type="number"
              id="attendeeCount"
              value={attendeeCount}
              onChange={(e) => setAttendeeCount(Number(e.target.value))}
              required
              disabled={saving}
              placeholder="150"
              className="bg-white/5 border-white/10 text-white pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan text-right text-sm h-10"
            />
          </div>
        </div>

        {/* Cover Image Upload */}
        <div className="md:col-span-2">
          <ImageUpload
            value={coverImage}
            onChange={setCoverImage}
            disabled={saving}
            label="صورة غلاف الفعالية"
            placeholder="اختر صورة أو اسحبها هنا"
          />
        </div>

      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="text-xs font-semibold text-gray-400 block">
          وصف تفصيلي للفعالية
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          disabled={saving}
          placeholder="اكتب تفاصيل الفعالية وجلسات المؤتمر والأنشطة التقنية المقامة..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-sm leading-relaxed"
        />
      </div>

      {/* Partners Multi-Select */}
      {partners.length > 0 && (
        <div className="space-y-2 border-t border-white/5 pt-4">
          <span className="text-xs font-semibold text-gray-400 block">اربط شركاء الفعالية:</span>
          <div className="flex flex-wrap gap-2">
            {partners.map((partner) => {
              const isSelected = selectedPartnerIds.includes(partner.id);
              return (
                <button
                  type="button"
                  key={partner.id}
                  onClick={() => handlePartnerToggle(partner.id)}
                  disabled={saving}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-neon-purple/20 border-neon-purple text-neon-purple font-bold"
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {partner.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Publish Status Toggle */}
      <div className="flex items-center gap-2 justify-end py-2 border-t border-white/5 pt-4">
        <label htmlFor="isPublished" className="text-sm font-semibold text-gray-300 cursor-pointer">
          نشر الفعالية وتغطيتها مباشرة للجمهور
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

      {/* Actions buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-white/5 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/events")}
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
            isEditMode ? "تحديث الفعالية" : "إنشاء الفعالية"
          )}
        </Button>
      </div>

    </form>
  );
}
