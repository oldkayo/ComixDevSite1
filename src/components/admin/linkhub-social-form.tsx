"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSocialPlatforms } from "@/actions/linkhub";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2, GripVertical } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface SocialPlatformItem {
  id: string;
  platform: string;
  icon: string | null;
  url: string;
  isEnabled: boolean;
  displayOrder: number;
}

interface LinkHubSocialFormProps {
  initialPlatforms: SocialPlatformItem[];
}

export function LinkHubSocialForm({ initialPlatforms }: LinkHubSocialFormProps) {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<SocialPlatformItem[]>(initialPlatforms);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleUrlChange = (platformName: string, url: string) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.platform === platformName ? { ...p, url } : p))
    );
  };

  const handleEnabledChange = (platformName: string, isEnabled: boolean) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.platform === platformName ? { ...p, isEnabled } : p))
    );
  };

  const handleOrderChange = (platformName: string, orderVal: string) => {
    const displayOrder = parseInt(orderVal) || 0;
    setPlatforms((prev) =>
      prev.map((p) => (p.platform === platformName ? { ...p, displayOrder } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const result = await updateSocialPlatforms(platforms);
      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "تم تحديث روابط شبكات التواصل بنجاح!" });
        router.refresh();
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حفظ البيانات." });
    } finally {
      setSaving(false);
    }
  };

  const renderPlatformIcon = (iconName: string | null) => {
    if (!iconName) return <LucideIcons.Share2 className="w-4 h-4 text-gray-400" />;
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return <LucideIcons.Share2 className="w-4 h-4 text-gray-400" />;
    return <IconComponent className="w-4 h-4 text-neon-purple" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
      {status && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
          status.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {status.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">روابط شبكات التواصل الاجتماعي الافتراضية</h3>
          <p className="text-xs text-gray-400">حدد الروابط الفعالة وقسم ترتيبها لتظهر في صفحة /connect</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-right text-gray-300">
            <thead className="bg-white/[0.02] text-xs font-semibold text-gray-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-3.5">المنصة</th>
                <th className="px-6 py-3.5 text-center">الحالة</th>
                <th className="px-6 py-3.5">رابط الحساب (URL)</th>
                <th className="px-6 py-3.5 text-center w-24">الترتيب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {platforms.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                  {/* Platform Name and Icon */}
                  <td className="px-6 py-4 flex items-center gap-3 font-bold text-white">
                    <span className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      {renderPlatformIcon(p.icon)}
                    </span>
                    <span>{p.platform}</span>
                  </td>

                  {/* Enable Toggle Switch */}
                  <td className="px-6 py-4 text-center">
                    <Switch 
                      checked={p.isEnabled} 
                      onCheckedChange={(checked: boolean) => handleEnabledChange(p.platform, checked)} 
                    />
                  </td>

                  {/* URL Input */}
                  <td className="px-6 py-4">
                    <Input 
                      type="url"
                      value={p.url}
                      onChange={(e) => handleUrlChange(p.platform, e.target.value)}
                      placeholder={`أدخل رابط حسابك على ${p.platform}`}
                      className="bg-gray-900 border-white/10 text-white text-xs h-9 w-full focus:border-neon-cyan/50"
                      disabled={!p.isEnabled}
                    />
                  </td>

                  {/* Display Order Weight */}
                  <td className="px-6 py-4">
                    <Input 
                      type="number"
                      min="0"
                      value={p.displayOrder}
                      onChange={(e) => handleOrderChange(p.platform, e.target.value)}
                      className="bg-gray-900 border-white/10 text-white text-center text-xs h-9 w-20 focus:border-neon-cyan/50"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-start">
        <Button 
          type="submit" 
          disabled={saving}
          className="bg-gradient-to-r from-neon-cyan to-neon-blue text-white shadow-lg shadow-neon-cyan/15 hover:opacity-90 font-medium px-8"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              جاري حفظ الروابط...
            </>
          ) : "حفظ التغييرات"}
        </Button>
      </div>
    </form>
  );
}
