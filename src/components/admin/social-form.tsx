"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSocialLink, updateSocialLink } from "@/actions/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle, Share2 } from "lucide-react";

interface SocialFormProps {
  initialSocial?: {
    id: string;
    platform: string;
    url: string;
    icon: string | null;
    isVisible: boolean;
  } | null;
}

export function SocialForm({ initialSocial }: SocialFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isEditMode = !!initialSocial;

  // States
  const [platform, setPlatform] = useState("LinkedIn");
  const [url, setUrl] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (initialSocial) {
      setPlatform(initialSocial.platform);
      setUrl(initialSocial.url);
      setIsVisible(initialSocial.isVisible);
    } else {
      setPlatform("LinkedIn");
      setUrl("");
      setIsVisible(true);
    }
  }, [initialSocial]);

  const platforms = ["Instagram", "LinkedIn", "Facebook", "X", "YouTube", "TikTok", "GitHub"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload = {
      platform,
      url,
      icon: platform, // Store platform name as icon name
      isVisible,
    };

    try {
      let result;
      if (isEditMode && initialSocial) {
        result = await updateSocialLink(initialSocial.id, payload);
      } else {
        result = await createSocialLink(payload);
      }

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: isEditMode ? "تم تحديث الرابط بنجاح!" : "تم إضافة الرابط بنجاح!" });
        if (!isEditMode) {
          setUrl("");
        }
        setTimeout(() => {
          router.push("/admin/socials");
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حفظ الرابط." });
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

      {/* Platform Select */}
      <div className="space-y-1">
        <label htmlFor="platformSelect" className="text-[10px] font-semibold text-gray-400 block">
          منصة التواصل الاجتماعي
        </label>
        <select
          id="platformSelect"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          disabled={saving}
          className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:border-neon-cyan focus:ring-neon-cyan focus:outline-none cursor-pointer"
        >
          {platforms.map((p) => (
            <option key={p} value={p} className="bg-gray-950 text-gray-300">
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* URL */}
      <div className="space-y-1">
        <label htmlFor="socialUrl" className="text-[10px] font-semibold text-gray-400 block">
          رابط الحساب المباشر
        </label>
        <Input
          type="url"
          id="socialUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={saving}
          placeholder="https://linkedin.com/in/username..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9"
        />
      </div>

      {/* Visible Toggle */}
      <div className="flex items-center gap-2 justify-end py-1">
        <label htmlFor="socialVisible" className="text-xs font-semibold text-gray-300 cursor-pointer">
          عرض الرابط للجمهور بالموقع
        </label>
        <input
          type="checkbox"
          id="socialVisible"
          checked={isVisible}
          onChange={(e) => setIsVisible(e.target.checked)}
          disabled={saving}
          className="w-4 h-4 rounded border-white/10 bg-white/5 text-neon-cyan focus:ring-neon-cyan cursor-pointer"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
        {isEditMode && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              router.push("/admin/socials");
            }}
            disabled={saving}
            className="border-white/10 hover:bg-white/10 text-gray-400 text-[10px] h-9 cursor-pointer"
          >
            إلغاء التعديل
          </Button>
        )}
        <Button
          type="submit"
          disabled={saving || !url}
          className="bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 text-xs h-9 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer flex-1"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            isEditMode ? "تحديث الرابط" : "إضافة الرابط"
          )}
        </Button>
      </div>

    </form>
  );
}
