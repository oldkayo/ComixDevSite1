"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeamMember, updateTeamMember } from "@/actions/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface TeamMemberFormProps {
  initialTeamMember?: {
    id?: string;
    name: string;
    position: string;
    image: string | null;
    description: string | null;
    socialLinks: any;
    isVisible: boolean;
    order: number;
  } | null;
}

export function TeamMemberForm({ initialTeamMember }: TeamMemberFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [name, setName] = useState(initialTeamMember?.name || "");
  const [position, setPosition] = useState(initialTeamMember?.position || "");
  const [image, setImage] = useState(initialTeamMember?.image || "");
  const [description, setDescription] = useState(
    initialTeamMember?.description || "",
  );
  const [isVisible, setIsVisible] = useState(
    initialTeamMember?.isVisible ?? true,
  );
  const [order, setOrder] = useState(initialTeamMember?.order ?? 0);
  const [socialLinksInput, setSocialLinksInput] = useState(
    initialTeamMember?.socialLinks
      ? JSON.stringify(initialTeamMember.socialLinks, null, 2)
      : "",
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    let socialLinks = null;
    if (socialLinksInput.trim()) {
      try {
        socialLinks = JSON.parse(socialLinksInput);
      } catch (err) {
        setStatus({
          type: "error",
          message: "تنسيق روابط التواصل الاجتماعي غير صالح (JSON)",
        });
        setSaving(false);
        return;
      }
    }

    const payload = {
      name,
      position,
      image: image || "",
      description: description || "",
      socialLinks,
      isVisible,
      order,
    };

    try {
      let result;
      if (initialTeamMember?.id) {
        result = await updateTeamMember(initialTeamMember.id, payload);
      } else {
        result = await createTeamMember(payload);
      }

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({
          type: "success",
          message: initialTeamMember?.id
            ? "تم تحديث عضو الفريق بنجاح!"
            : "تم إضافة عضو الفريق بنجاح!",
        });
        router.refresh();
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-right" dir="rtl">
      {/* Status */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-400 block">
            الاسم
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={saving}
            className="bg-white/5 border-white/10 text-white text-xs h-9"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-400 block">
            الوظيفة
          </label>
          <Input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
            disabled={saving}
            className="bg-white/5 border-white/10 text-white text-xs h-9"
          />
        </div>
      </div>

      {/* Image */}
      <ImageUpload
        value={image}
        onChange={setImage}
        disabled={saving}
        label="الصورة الشخصية"
        placeholder="اختر صورة أو اسحبها هنا"
      />

      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-400 block">
          نبذة عنه
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={saving}
          className="bg-white/5 border-white/10 text-white text-xs"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-400 block">
          روابط التواصل الاجتماعي (JSON)
        </label>
        <Textarea
          placeholder='{"instagram": "...", "linkedin": "..."}'
          value={socialLinksInput}
          onChange={(e) => setSocialLinksInput(e.target.value)}
          rows={3}
          disabled={saving}
          className="bg-white/5 border-white/10 text-white text-xs font-mono"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
          <span className="text-[10px] text-gray-400">ظاهر في الصفحة</span>
          <Switch
            checked={isVisible}
            onCheckedChange={setIsVisible}
            disabled={saving}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-400 block">
            الترتيب
          </label>
          <Input
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            disabled={saving}
            className="bg-white/5 border-white/10 text-white text-xs h-9"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-neon-cyan to-neon-blue text-white text-xs px-6 h-9"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : initialTeamMember?.id ? (
            "تحديث عضو الفريق"
          ) : (
            "إضافة عضو الفريق"
          )}
        </Button>
      </div>
    </form>
  );
}
