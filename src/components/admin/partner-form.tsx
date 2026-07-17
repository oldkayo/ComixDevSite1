"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPartner, updatePartner } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface PartnerFormProps {
  initialPartner?: {
    id: string;
    name: string;
    logo: string;
    website: string | null;
    description: string | null;
  } | null;
}

export function PartnerForm({ initialPartner }: PartnerFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isEditMode = !!initialPartner;

  // Prefill states when initialPartner changes
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setName(initialPartner?.name || "");
    setLogo(initialPartner?.logo || "");
    setWebsite(initialPartner?.website || "");
    setDescription(initialPartner?.description || "");
  }, [initialPartner]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload = {
      name,
      logo,
      website: website || "",
      description: description || "",
    };

    try {
      let result;
      if (isEditMode && initialPartner) {
        result = await updatePartner(initialPartner.id, payload);
      } else {
        result = await createPartner(payload);
      }

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({
          type: "success",
          message: isEditMode
            ? "تم تحديث الشريك بنجاح!"
            : "تم إضافة الشريك بنجاح!",
        });
        if (!isEditMode) {
          // Reset form inputs if creating
          setName("");
          setLogo("");
          setWebsite("");
          setDescription("");
        }
        setTimeout(() => {
          router.push("/admin/partners");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: "حدث خطأ غير متوقع أثناء حفظ الشريك.",
      });
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
        <label
          htmlFor="partnerName"
          className="text-[10px] font-semibold text-gray-400 block"
        >
          اسم الشريك / الجهة المستضيفة
        </label>
        <Input
          type="text"
          id="partnerName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={saving}
          placeholder="مثال: جامعة الملك سعود..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9"
        />
      </div>

      {/* Website */}
      <div className="space-y-1">
        <label
          htmlFor="partnerWebsite"
          className="text-[10px] font-semibold text-gray-400 block"
        >
          رابط الموقع الإلكتروني (اختياري)
        </label>
        <Input
          type="text"
          id="partnerWebsite"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          disabled={saving}
          placeholder="https://ksu.edu.sa..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9"
        />
      </div>

      {/* Logo */}
      <ImageUpload
        value={logo}
        onChange={setLogo}
        disabled={saving}
        label="شعار الشريك (مربع أو أفقي)"
        placeholder="اختر صورة أو اسحبها هنا"
      />

      {/* Description */}
      <div className="space-y-1">
        <label
          htmlFor="partnerDesc"
          className="text-[10px] font-semibold text-gray-400 block"
        >
          وصف مختصر للشراكة (اختياري)
        </label>
        <Textarea
          id="partnerDesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={saving}
          rows={3}
          placeholder="شرح بسيط لدور الشريك أو علاقته بالفعاليات..."
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
              router.push("/admin/partners");
            }}
            disabled={saving}
            className="border-white/10 hover:bg-white/10 text-gray-400 text-[10px] h-9 cursor-pointer"
          >
            إلغاء التعديل
          </Button>
        )}
        <Button
          type="submit"
          disabled={saving || !logo}
          className="bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 text-xs h-9 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer flex-1"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : isEditMode ? (
            "تحديث الشريك"
          ) : (
            "إضافة الشريك"
          )}
        </Button>
      </div>
    </form>
  );
}
