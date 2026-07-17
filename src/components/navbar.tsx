"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X, User, LogOut, Award, Sparkles, Bell } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  session: any;
  links: { name: string; url: string }[];
  siteName: string;
  siteLogo: string | null;
}

export function Navbar({ session, links, siteName, siteLogo }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-slate-800/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {siteLogo ? (
            <img src={siteLogo} alt={siteName} className="h-8 w-auto object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
            {siteName}
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const isActive = pathname === link.url;
            return (
              <Link
                key={link.url}
                href={link.url}
                className={`text-sm font-medium transition-colors hover:text-white duration-200 ${
                  isActive ? "text-white font-semibold" : "text-slate-400"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User CTA Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative w-10 h-10 flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/50 hover:bg-slate-800 transition-colors">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  0
                </span>
              </button>
              
              {/* Points */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-700">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-slate-200">{user.points ?? 0}</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-10 w-10 rounded-full border border-slate-700 bg-slate-900/50 p-0 overflow-hidden flex items-center justify-center cursor-pointer outline-none">
                  {user.image ? (
                    <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-slate-300" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass border-slate-700 text-right text-slate-200" align="end">
                  <div className="px-2.5 py-2 text-right">
                    <div className="font-semibold text-sm text-white">
                      {user.name || "المستخدم"}
                    </div>
                    <div className="text-xs text-slate-400 font-normal truncate mt-0.5">
                      {user.email}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  
                  <DropdownMenuItem className="p-0">
                    <Link href="/dashboard" className="w-full h-full flex px-3 py-2 justify-end hover:bg-slate-800 cursor-pointer">
                      لوحة المستخدم
                    </Link>
                  </DropdownMenuItem>
                  
                  {session?.user?.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem className="p-0 text-primary focus:text-primary">
                        <Link href="/admin/settings" className="w-full h-full flex px-3 py-2 justify-end hover:bg-slate-800 font-semibold cursor-pointer">
                          لوحة الإدارة
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="cursor-pointer text-red-400 hover:bg-red-950/20 hover:text-red-300 justify-end"
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className={buttonVariants({
                  variant: "default",
                  className: "bg-primary hover:bg-primary/90 text-white shadow-sm",
                })}
              >
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-3">
            {links.map((link) => (
              <Link
                key={link.url}
                href={link.url}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-base font-medium transition-colors hover:text-white ${
                  pathname === link.url ? "text-white font-bold" : "text-slate-300"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <Award className="w-4 h-4 text-amber-400" />
                      نقاط:
                    </span>
                    <span className="font-mono font-bold text-base text-slate-200">{user.points ?? 0}</span>
                  </div>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white py-1">
                    لوحة المستخدم
                  </Link>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    variant="destructive"
                    className="w-full justify-center"
                  >
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setIsOpen(false)} className="text-center py-2 text-slate-300 hover:text-white">
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className={buttonVariants({
                      variant: "default",
                      className: "w-full justify-center text-center bg-primary hover:bg-primary/90",
                    })}
                  >
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
