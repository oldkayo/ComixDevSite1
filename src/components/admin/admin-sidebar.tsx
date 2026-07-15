"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Image as ImageIcon,
  Calendar,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  BookOpen,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Globe,
  Shield,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export function AdminSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["website-content", "learning"]),
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const menuSections = [
    {
      id: "overview",
      label: "نظرة عامة",
      items: [
        { name: "لوحة التحكم الرئيسية", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      id: "website-content",
      label: "محتوى الموقع",
      items: [
        { name: "الصفحة الرئيسية", href: "/admin/homepage", icon: FileText },
        { name: "من نحن", href: "/admin/about", icon: Users },
        { name: "اتصل بنا", href: "/admin/contact", icon: MessageSquare },
        { name: "التنقل", href: "/admin/navigation", icon: Globe },
        { name: "التواصل الاجتماعي", href: "/admin/socials", icon: Zap },
        { name: "ComixTree", href: "/admin/comixtree", icon: Zap },
        { name: "إعدادات SEO", href: "/admin/seo", icon: Shield },
      ],
    },
    {
      id: "learning",
      label: "التعليم",
      items: [
        { name: "الورشات", href: "/admin/workshops", icon: BookOpen },
        {
          name: "تسجيلات الورشات",
          href: "/admin/workshops/registrations",
          icon: Users,
        },
        { name: "مكتبة البرومبتات", href: "/admin/prompts", icon: Zap },
        { name: "الشهادات", href: "/admin/certificates", icon: Award },
      ],
    },
    {
      id: "media",
      label: "الوسائط",
      items: [
        { name: "المعرض", href: "/admin/gallery", icon: ImageIcon },
        { name: "الفعاليات", href: "/admin/events", icon: Calendar },
        { name: "الشركاء", href: "/admin/partners", icon: Briefcase },
      ],
    },
    {
      id: "system",
      label: "النظام",
      items: [
        { name: "إعدادات الموقع", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const defaultAvatar = "/images/workshop_ai.png";

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="md:hidden w-full bg-gray-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-cyan animate-pulse" />
          <span className="font-extrabold text-white text-base tracking-wider font-mono">
            ComixDev Admin
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-300 hover:text-white p-1 rounded-md focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 right-0 z-50 w-72 bg-gray-950/95 md:bg-gray-950/40 backdrop-blur-xl border-l md:border-l-0 md:border-r border-white/5 flex flex-col justify-between py-6 px-4 transition-transform duration-300 transform md:transform-none md:relative overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
        )}
        dir="rtl"
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="hidden md:flex items-center justify-center gap-2 border-b border-white/5 pb-6">
            <Zap className="w-7 h-7 text-neon-cyan animate-pulse" />
            <Link
              href="/"
              className="font-extrabold text-white text-xl tracking-wider font-mono"
            >
              ComixDev Admin
            </Link>
          </div>

          {/* User Profile Info Card */}
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <img
              src={user?.image || defaultAvatar}
              alt={user?.name || "Admin"}
              className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
            <div className="space-y-0.5 text-right overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate">
                {user?.name || "مدير"}
              </h4>
              <p className="text-xs text-neon-cyan truncate">ADMIN</p>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-2">
            {menuSections.map((section) => {
              const isSectionExpanded = expandedSections.has(section.id);
              return (
                <div key={section.id} className="space-y-1">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-2 py-2 text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <span>{section.label}</span>
                    {isSectionExpanded ? (
                      <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronLeft className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Section Items */}
                  {isSectionExpanded && (
                    <div className="space-y-1.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                          pathname === item.href ||
                          pathname.startsWith(item.href + "/");

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-right",
                              isActive
                                ? "bg-gradient-to-l from-neon-cyan/15 to-neon-blue/5 text-neon-cyan border-r-2 border-neon-cyan font-bold"
                                : "text-gray-400 hover:text-white hover:bg-white/[0.02]",
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-4.5 h-4.5 transition-colors",
                                isActive
                                  ? "text-neon-cyan"
                                  : "text-gray-400 group-hover:text-white",
                              )}
                            />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer actions: Logout & Back to Site */}
        <div className="border-t border-white/5 pt-6 space-y-2">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.02] transition-all duration-200 text-right"
          >
            <Globe className="w-5 h-5 shrink-0" />
            <span>العودة للموقع</span>
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200 text-right"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
