"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettings } from "@/actions/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2, CheckCircle2, AlertCircle, Building2, Contact, Award, Palette } from "lucide-react";

interface SettingsFormProps {
  initialSettings: {
    siteName: string;
    siteDescription: string;
    siteLogo: string | null;
    favicon: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    address: string | null;
    copyrightText: string | null;
    statsWorkshopsCount: number;
    statsStudentsCount: number;
    statsCertificatesCount: number;
    statsProjectsCount: number;
  };
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // States
  const [siteName, setSiteName] = useState(initialSettings.siteName || "");
  const [siteDescription, setSiteDescription] = useState(initialSettings.siteDescription || "");
  const [siteLogo, setSiteLogo] = useState(initialSettings.siteLogo || "");
  const [favicon, setFavicon] = useState(initialSettings.favicon || "");
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primaryColor || "#06b6d4");
  const [secondaryColor, setSecondaryColor] = useState(initialSettings.secondaryColor || "#a855f7");
  const [contactEmail, setContactEmail] = useState(initialSettings.contactEmail || "");
  const [contactPhone, setContactPhone] = useState(initialSettings.contactPhone || "");
  const [address, setAddress] = useState(initialSettings.address || "");
  const [copyrightText, setCopyrightText] = useState(initialSettings.copyrightText || "");
  
  const [statsWorkshops, setStatsWorkshops] = useState(initialSettings.statsWorkshopsCount || 0);
  const [statsStudents, setStatsStudents] = useState(initialSettings.statsStudentsCount || 0);
  const [statsCertificates, setStatsCertificates] = useState(initialSettings.statsCertificatesCount || 0);
  const [statsProjects, setStatsProjects] = useState(initialSettings.statsProjectsCount || 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload = {
      siteName,
      siteDescription,
      siteLogo: siteLogo || "",
      favicon: favicon || "",
      primaryColor,
      secondaryColor,
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
      address: address || "",
      copyrightText: copyrightText || "",
      statsWorkshopsCount: Number(statsWorkshops),
      statsStudentsCount: Number(statsStudents),
      statsCertificatesCount: Number(statsCertificates),
      statsProjectsCount: Number(statsProjects),
    };

    try {
      const result = await updateSiteSettings(payload);

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: result.success || "تم حفظ الإعدادات بنجاح!" });
        router.refresh();
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حفظ الإعدادات." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-right" dir="rtl">
      
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

      {/* 1. General Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
          <Building2 className="w-4.5 h-4.5 text-neon-cyan" />
          الإعدادات العامة وهوية الموقع
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label htmlFor="siteName" className="text-xs font-semibold text-gray-400">اسم الموقع</label>
            <Input
              type="text"
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
              disabled={saving}
              className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-sm h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="copyrightText" className="text-xs font-semibold text-gray-400">حقوق النشر (Footer Copyright)</label>
            <Input
              type="text"
              id="copyrightText"
              value={copyrightText}
              onChange={(e) => setCopyrightText(e.target.value)}
              disabled={saving}
              placeholder="جميع الحقوق محفوظة © ComixDev 2026"
              className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-sm h-10"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="siteDescription" className="text-xs font-semibold text-gray-400">وصف الموقع (Meta Description)</label>
            <Textarea
              id="siteDescription"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              required
              rows={2}
              disabled={saving}
              className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-sm leading-relaxed"
            />
          </div>
        </div>
        
        {/* Logo & Favicon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <ImageUpload
            value={siteLogo}
            onChange={setSiteLogo}
            disabled={saving}
            label="شعار الموقع (Site Logo)"
            placeholder="اختر صورة أو اسحبها هنا"
          />
          <ImageUpload
            value={favicon}
            onChange={setFavicon}
            disabled={saving}
            label="أيقونة الموقع (Favicon)"
            placeholder="اختر صورة أو اسحبها هنا"
          />
        </div>
      </div>

      {/* 2. Styling Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
          <Palette className="w-4.5 h-4.5 text-neon-cyan" />
          الألوان الأساسية (Neon Shades)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 block">اللون الأساسي</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                disabled={saving}
                className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <span className="text-xs text-gray-300 font-mono">{primaryColor}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 block">اللون الثانوي</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                disabled={saving}
                className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <span className="text-xs text-gray-300 font-mono">{secondaryColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Contact details */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
          <Contact className="w-4.5 h-4.5 text-neon-cyan" />
          معلومات الاتصال
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label htmlFor="contactEmail" className="text-xs font-semibold text-gray-400">البريد الإلكتروني للاتصال</label>
            <Input
              type="email"
              id="contactEmail"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              disabled={saving}
              placeholder="info@comixdev.com"
              className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-sm h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contactPhone" className="text-xs font-semibold text-gray-400">الهاتف / الواتساب</label>
            <Input
              type="text"
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              disabled={saving}
              placeholder="+966500000000"
              className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-sm h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="address" className="text-xs font-semibold text-gray-400">العنوان الجغرافي</label>
            <Input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={saving}
              placeholder="الرياض، المملكة العربية السعودية"
              className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-sm h-10"
            />
          </div>
        </div>
      </div>

      {/* 4. Statistics Counts */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
          <Award className="w-4.5 h-4.5 text-neon-cyan" />
          إحصائيات المنصة بالصفحة الرئيسية
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">عدد الورشات</label>
            <Input
              type="number"
              value={statsWorkshops}
              onChange={(e) => setStatsWorkshops(Number(e.target.value))}
              required
              disabled={saving}
              className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-sm h-10 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">عدد المشتركين</label>
            <Input
              type="number"
              value={statsStudents}
              onChange={(e) => setStatsStudents(Number(e.target.value))}
              required
              disabled={saving}
              className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-sm h-10 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">الشهادات الموثقة</label>
            <Input
              type="number"
              value={statsCertificates}
              onChange={(e) => setStatsCertificates(Number(e.target.value))}
              required
              disabled={saving}
              className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-sm h-10 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">مشاريع التخرج</label>
            <Input
              type="number"
              value={statsProjects}
              onChange={(e) => setStatsProjects(Number(e.target.value))}
              required
              disabled={saving}
              className="bg-white/5 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan text-sm h-10 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t border-white/5 pt-6 flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 text-xs px-8 h-10 rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري حفظ الإعدادات...
            </>
          ) : (
            "حفظ إعدادات الموقع"
          )}
        </Button>
      </div>

    </form>
  );
}
