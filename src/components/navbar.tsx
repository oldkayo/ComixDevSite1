"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X, User, LogOut, Award, Sparkles } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full glass border-b border-white/5 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          {siteLogo ? (
            <img src={siteLogo} alt={siteName} className="h-8 w-auto object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-cyan to-neon-purple flex items-center justify-center shadow-lg shadow-neon-cyan/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:from-neon-cyan group-hover:to-neon-purple transition-all duration-300">
            {siteName}
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.url;
            return (
              <Link
                key={link.url}
                href={link.url}
                className={`text-sm font-medium transition-colors hover:text-neon-cyan duration-200 ${
                  isActive ? "text-neon-cyan font-semibold" : "text-gray-400"
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
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 p-0 overflow-hidden flex items-center justify-center cursor-pointer outline-none">
                {user.image ? (
                  <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-gray-300" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass border-white/10 text-right text-gray-200" align="end">
                <div className="px-2.5 py-2 text-right">
                  <div className="font-semibold text-sm text-white">
                    {user.name || "المستخدم"}
                  </div>
                  <div className="text-xs text-gray-400 font-normal truncate mt-0.5">
                    {user.email}
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                
                {/* Points counter */}
                <div className="px-2 py-1.5 flex items-center justify-between text-sm text-neon-cyan">
                  <span className="flex items-center gap-1 font-medium">
                    <Award className="w-4 h-4" />
                    نقاط الولاء:
                  </span>
                  <span className="font-mono font-bold text-base">{user.points ?? 0}</span>
                </div>
                
                <DropdownMenuSeparator className="bg-white/10" />
                
                <DropdownMenuItem className="p-0">
                  <Link href="/dashboard" className="w-full h-full flex px-3 py-2 justify-end hover:bg-white/5 cursor-pointer">
                    لوحة التحكم
                  </Link>
                </DropdownMenuItem>
                
                {session?.user?.role === "ADMIN" && (
                  <>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="p-0 text-neon-cyan focus:text-neon-cyan">
                      <Link href="/admin/settings" className="w-full h-full flex px-3 py-2 justify-end hover:bg-neon-cyan/5 font-semibold cursor-pointer">
                        لوحة الإدارة (CMS)
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer text-red-400 hover:bg-red-950/20 hover:text-red-300 justify-end"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className={buttonVariants({
                variant: "default",
                className: "bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 shadow-md shadow-neon-cyan/20 px-4 py-2 rounded-lg text-sm font-semibold",
              })}
            >
              تسجيل الدخول
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg border border-white/10 text-gray-300 hover:text-white"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-gray-950/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-3">
            {links.map((link) => (
              <Link
                key={link.url}
                href={link.url}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-base font-medium transition-colors hover:text-neon-cyan ${
                  pathname === link.url ? "text-neon-cyan font-bold" : "text-gray-300"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center justify-between text-sm text-neon-cyan">
                    <span className="flex items-center gap-1 font-medium">
                      <Award className="w-4 h-4" />
                      نقاط الولاء:
                    </span>
                    <span className="font-mono font-bold text-base">{user.points ?? 0}</span>
                  </div>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white py-1">
                    لوحة التحكم
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
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className={buttonVariants({
                    variant: "default",
                    className: "w-full justify-center text-center bg-gradient-to-r from-neon-cyan to-neon-blue text-white",
                  })}
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
