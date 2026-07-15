"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  BookmarkCheck, 
  Award, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Zap 
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

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
    ...(user.role === "ADMIN" ? [
      { name: "لوحة الإدارة (CMS)", href: "/admin", icon: Zap },
    ] : []),
    { name: "ورشاتي المسجلة", href: "/dashboard/workshops", icon: BookmarkCheck },
    { name: "شهاداتي", href: "/dashboard/certificates", icon: Award },
    { name: "الملف الشخصي", href: "/dashboard/profile", icon: UserIcon },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const defaultAvatar = "/images/workshop_ai.png"; // fallback avatar

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="md:hidden w-full bg-gray-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-cyan animate-pulse" />
          <span className="font-extrabold text-white text-base tracking-wider font-mono">ComixDev</span>
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
          "fixed top-0 bottom-0 right-0 z-50 w-64 bg-gray-950/95 md:bg-gray-950/40 backdrop-blur-xl border-l md:border-l-0 md:border-r border-white/5 flex flex-col justify-between py-8 px-4 transition-transform duration-300 transform md:transform-none md:relative",
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}
        dir="rtl"
      >
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="hidden md:flex items-center justify-center gap-2 border-b border-white/5 pb-6">
            <Zap className="w-6 h-6 text-neon-cyan animate-pulse" />
            <Link href="/" className="font-extrabold text-white text-lg tracking-wider font-mono">
              ComixDev
            </Link>
          </div>

          {/* User Profile Info Card */}
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <img
              src={user?.image || defaultAvatar}
              alt={user?.name || "User"}
              className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
            <div className="space-y-0.5 text-right overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate">{user?.name || "عضو نشط"}</h4>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group text-right",
                    isActive
                      ? "bg-gradient-to-l from-neon-cyan/15 to-neon-blue/5 text-neon-cyan border-r-2 border-neon-cyan font-bold"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-neon-cyan" : "text-gray-400 group-hover:text-white"
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions: Logout */}
        <div className="border-t border-white/5 pt-6">
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
