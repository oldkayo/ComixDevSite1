import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLinkHubSettings } from "@/lib/linkhub";
import { LinkHubSettingsForm } from "@/components/admin/linkhub-settings-form";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default async function AdminLinkHubPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const settings = await getLinkHubSettings();

  const tabs = [
    { key: "settings", name: "الإعدادات العامة", href: "/admin/linkhub" },
    { key: "socials", name: "روابط التواصل", href: "/admin/linkhub/socials" },
    { key: "custom", name: "الروابط المخصصة", href: "/admin/linkhub/custom" },
  ];

  return (
    <div className="w-full py-8 md:py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        
        {/* Back and view page buttons */}
        <div className="flex items-center justify-between">
          <Link href="/admin/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            العودة للوحة الإعدادات
          </Link>
          <Link 
            href="/connect" 
            target="_blank"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "border-neon-cyan/20 bg-neon-cyan/5 hover:bg-neon-cyan/15 hover:border-neon-cyan/30 text-neon-cyan text-xs inline-flex items-center gap-1.5"
            })}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            عرض صفحة Connect الحية
          </Link>
        </div>

        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">إدارة صفحة الاتصال الموحدة (LinkHub)</h1>
          <p className="text-sm text-gray-400">تحكم بالمعلومات والشعار والروابط التي تظهر في صفحة /connect للمشتركين.</p>
        </div>

        {/* Tab Sub-Navigation */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-1">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition-all duration-300 ${
                tab.key === "settings"
                  ? "border-neon-cyan text-neon-cyan font-bold"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </div>

        {/* Form component */}
        <LinkHubSettingsForm initialSettings={settings} />

      </div>
    </div>
  );
}
