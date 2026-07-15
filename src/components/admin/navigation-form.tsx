"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createNavigationLink, updateNavigationLink } from "@/actions/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle, Menu } from "lucide-react";

interface NavigationFormProps {
  initialLink?: {
    id: string;
    name: string;
    url: string;
    type: "NAVBAR" | "FOOTER";
    order: number;
    isVisible: boolean;
  } | null;
}

export function NavigationForm({ initialLink }: NavigationFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isEditMode = !!initialLink;

  // States
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"NAVBAR" | "FOOTER">("NAVBAR");
  const [order, setOrder] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (initialLink) {
      setName(initialLink.name);
      setUrl(initialLink.url);
      setType(initialLink.type);
      setOrder(initialLink.order);
      setIsVisible(initialLink.isVisible);
    } else {
      setName("");
      setUrl("");
      setType("NAVBAR");
      setOrder(0);
      setIsVisible(true);
    }
  }, [initialLink]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload = {
      name,
      url,
      type,
      order: Number(order),
      isVisible,
    };

    try {
      let result;
      if (isEditMode && initialLink) {
        result = await updateNavigationLink(initialLink.id, payload);
      } else {
        result = await createNavigationLink(payload);
      }

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: isEditMode ? "تم تحديث الرابط بنجاح!" : "تم إضافة الرابط بنجاح!" });
        if (!isEditMode) {
          setName("");
          setUrl("");
          setOrder(order + 1); // increment order automatically for next links
        }
        setTimeout(() => {
          router.push("/admin/navigation");
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حفظ رابط القائمة." });
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
        <label htmlFor="navName" className="text-[10px] font-semibold text-gray-400 block">
          اسم الرابط (العنوان الظاهر للمستخدم)
        </label>
        <Input
          type="text"
          id="navName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={saving}
          placeholder="مثال: من نحن، تواصل معنا..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9"
        />
      </div>

      {/* URL */}
      <div className="space-y-1">
        <label htmlFor="navUrl" className="text-[10px] font-semibold text-gray-400 block">
          المسار (URL / Path)
        </label>
        <Input
          type="text"
          id="navUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={saving}
          placeholder="مثال: /about أو /contact أو رابط خارجي..."
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9"
        />
      </div>

      {/* Type Select (Navbar vs Footer) */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-400 block">مكان العرض بالصفحة</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("NAVBAR")}
            disabled={saving}
            className={`py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              type === "NAVBAR"
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            القائمة العلوية (Navbar)
          </button>
          <button
            type="button"
            onClick={() => setType("FOOTER")}
            disabled={saving}
            className={`py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              type === "FOOTER"
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            القائمة السفلية (Footer)
          </button>
        </div>
      </div>

      {/* Order */}
      <div className="space-y-1">
        <label htmlFor="navOrder" className="text-[10px] font-semibold text-gray-400 block">
          ترتيب العرض (الوزن الرقمي التصاعدي)
        </label>
        <Input
          type="number"
          id="navOrder"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          required
          disabled={saving}
          className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-right text-xs h-9 font-mono"
        />
      </div>

      {/* Visible Toggle */}
      <div className="flex items-center gap-2 justify-end py-1">
        <label htmlFor="navVisible" className="text-xs font-semibold text-gray-300 cursor-pointer">
          تفعيل وعرض الرابط للجمهور بالموقع
        </label>
        <input
          type="checkbox"
          id="navVisible"
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
              router.push("/admin/navigation");
            }}
            disabled={saving}
            className="border-white/10 hover:bg-white/10 text-gray-400 text-[10px] h-9 cursor-pointer"
          >
            إلغاء التعديل
          </Button>
        )}
        <Button
          type="submit"
          disabled={saving || !name || !url}
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
