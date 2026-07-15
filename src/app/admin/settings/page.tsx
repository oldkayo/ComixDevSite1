import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import { 
  Settings, 
  Home, 
  Link as LinkIcon, 
  Share2, 
  Search, 
  MessageSquare, 
  Zap, 
  BookOpen, 
  Calendar, 
  Image as ImageIcon 
} from "lucide-react";
import Link from "next/link";

export default async function AdminSettingsPage() {
  const session = await auth();

  // Guard access: only admin
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch settings dynamically (will auto-seed defaults if database is empty!)
  const settings = await getSiteSettings();

  const cmsModules = [
    { name: "الإعدادات العامة", desc: "الشعار، الألوان، الإحصائيات، بيانات الاتصال", href: "/admin/settings", icon: Settings, color: "text-neon-cyan bg-neon-cyan/5 border-neon-cyan/10" },
    { name: "أقسام الرئيسية", desc: "تعديل محتوى الهيرو ومزايا المنصة", href: "/admin/homepage", icon: Home, color: "text-neon-blue bg-neon-blue/5 border-neon-blue/10" },
    { name: "روابط القائمة والتذييل", desc: "ترتيب وتنظيم روابط الهيدر والفوتر", href: "/admin/navigation", icon: LinkIcon, color: "text-neon-purple bg-neon-purple/5 border-neon-purple/10" },
    { name: "قنوات التواصل", desc: "إضافة وتعديل روابط السوشيال ميديا", href: "/admin/socials", icon: Share2, color: "text-neon-cyan bg-neon-cyan/5 border-neon-cyan/10" },
    { name: "أرشفة البحث (SEO)", desc: "العناوين والأوصاف لمحركات البحث", href: "/admin/seo", icon: Search, color: "text-neon-blue bg-neon-blue/5 border-neon-blue/10" },
    { name: "آراء وتقييمات الطلاب", desc: "إدارة تقييمات وآراء المشتركين", href: "/admin/testimonials", icon: MessageSquare, color: "text-neon-purple bg-neon-purple/5 border-neon-purple/10" },
    { name: "صفحة Connect (LinkHub)", desc: "رابط موحد للبوثات والفعاليات وقنواتنا", href: "/admin/linkhub", icon: Zap, color: "text-amber-400 bg-amber-400/5 border-amber-400/10" },
    { name: "إدارة الورشات", desc: "إنشاء وتعديل ورش العمل والمسجلين", href: "/admin/workshops", icon: BookOpen, color: "text-neon-cyan bg-neon-cyan/5 border-neon-cyan/10" },
    { name: "إدارة الفعاليات والتغطيات", desc: "معرض الصور وتغطيات الهاكاثونات", href: "/admin/events", icon: Calendar, color: "text-neon-blue bg-neon-blue/5 border-neon-blue/10" },
  ];

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl space-y-10">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Settings className="w-7 h-7 text-neon-cyan animate-pulse" />
              لوحة الإدارة الشاملة (CMS Panel)
            </h1>
            <p className="text-sm text-gray-400">
              تحكم بجميع أقسام ومحتويات منصة ComixDev من مكان واحد دون الحاجة لتعديل الكود.
            </p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {cmsModules.map((mod) => {
            const Icon = mod.icon;
            const isCurrent = mod.href === "/admin/settings";

            return (
              <Link 
                key={mod.href} 
                href={mod.href}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all duration-300 relative overflow-hidden group ${
                  isCurrent
                    ? "bg-white/[0.04] border-neon-cyan/30 shadow-lg shadow-neon-cyan/5"
                    : "glass border-white/5 hover:border-white/20 hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-lg border ${mod.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold bg-neon-cyan/15 text-neon-cyan px-2 py-0.5 rounded-full border border-neon-cyan/20">
                      مفتوح حالياً
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white group-hover:text-neon-cyan transition-colors text-sm">{mod.name}</h4>
                  <p className="text-[11px] text-gray-400 leading-normal">{mod.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Form container */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">تعديل الإعدادات العامة للموقع</h3>
          <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
            <SettingsForm initialSettings={settings as any} />
          </div>
        </div>

      </div>
    </div>
  );
}
