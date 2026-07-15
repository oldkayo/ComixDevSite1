import React from "react";
import type { Metadata } from "next";
import {
  getLinkHubSettings,
  getSocialPlatforms,
  getCustomLinks,
} from "@/lib/linkhub";
import { getSEOSettings } from "@/lib/settings";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Award,
  Zap,
  Cpu,
  MessageSquare,
  Phone,
  Globe,
  Calendar,
  Users,
  BookOpen,
  Link as LinkIcon,
  ChevronLeft,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOSettings("connect");
  return {
    title: seo.title || "ComixDev Connect",
    description: seo.description,
    keywords: seo.keywords,
    openGraph: seo.ogImage ? { images: [seo.ogImage] } : undefined,
  };
}

export default async function LinkHubPublicPage() {
  const [settings, socials, customLinks] = await Promise.all([
    getLinkHubSettings(),
    getSocialPlatforms(true), // only enabled platforms
    getCustomLinks(true), // only enabled custom links
  ]);

  // If the linkhub page is disabled, redirect to home page
  if (!settings.isEnabled) {
    redirect("/");
  }

  // Mapper for Lucide Icons
  const renderCustomIcon = (iconName: string | null) => {
    if (!iconName) return <LinkIcon className="w-5 h-5" />;
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return <LinkIcon className="w-5 h-5" />;
    return <IconComponent className="w-5 h-5" />;
  };

  // Mapper for custom SVG social icons
  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p === "github") {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );
    }
    if (p === "linkedin") {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    }
    if (p === "x" || p === "twitter") {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    }
    if (p === "youtube") {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.53 3.545 12 3.545 12 3.545s-7.53 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.017 0 12 0 12s0 3.983.502 5.837a3.003 3.003 0 002.11 2.11c1.858.507 9.388.507 9.388.507s7.53 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.983 24 12 24 12s0-3.983-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    }
    if (p === "facebook") {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
        </svg>
      );
    }
    if (p === "instagram") {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    }
    if (p === "tiktok") {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v15.17a2.5 2.5 0 01-2.5 2.5 2.47 2.47 0 01-2.5-2.5 2.5 2.5 0 012.5-2.5 2.4 2.4 0 012.5 2.5v-1.46a4.85 4.85 0 00-4.93-4.85 4.85 4.85 0 00-4.92 4.85 4.85 4.85 0 004.92 4.85 4.85 4.85 0 004.93-4.85v-5.28a6.78 6.78 0 004.13 1.44v-3.45a4.85 4.85 0 01-3.06-1.1z" />
        </svg>
      );
    }
    if (p === "discord") {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.073.073 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );
    }
    if (p === "whatsapp") {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.812 11.812 0 0010.05 0C3.414 0 0 3.414 0 7.632c0 2.023.634 3.91 1.728 5.587L0 24l5.956-1.714A11.817 11.817 0 0010.054 23c.003.001.006.001.01 0 6.633 0 12.004-5.37 12.004-12.001 0-3.193-1.25-6.196-3.53-8.47" />
        </svg>
      );
    }
    if (p === "telegram") {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.348-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    }
    if (p === "website") {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center py-6 sm:py-16 relative overflow-hidden">
      {/* Background neon glow */}
      <div className="absolute top-1/10 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-neon-cyan/5 to-neon-purple/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main smartphone-framed container */}
      <div className="w-full max-w-[460px] mx-auto bg-gray-900/40 sm:bg-gray-900/50 sm:backdrop-blur-md sm:border sm:border-white/10 sm:rounded-[36px] sm:shadow-2xl sm:shadow-black/60 overflow-hidden flex flex-col min-h-screen sm:min-h-[750px] relative z-10">
        {/* Cover banner header */}
        <div className="w-full h-36 overflow-hidden relative border-b border-white/5 bg-gradient-to-r from-neon-cyan/15 via-gray-900 to-neon-purple/15 flex items-center justify-center">
          {settings.coverImage ? (
            <img
              src={settings.coverImage}
              alt="Cover Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
          )}
        </div>

        {/* Circular logo avatar */}
        <div className="mx-auto -mt-12 w-24 h-24 rounded-full border-4 border-gray-900 bg-gray-950 shadow-xl overflow-hidden flex items-center justify-center relative z-20">
          {settings.logo ? (
            <img
              src={settings.logo}
              alt="ComixDev Logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-neon-cyan to-neon-blue flex items-center justify-center text-white font-extrabold text-2xl tracking-wider font-mono">
              CD
            </div>
          )}
        </div>

        {/* Header Text */}
        <div className="text-center mt-5 space-y-2 px-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            {settings.title}
          </h2>
          <p className="text-xs md:text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            {settings.description}
          </p>
        </div>

        {/* Social Platforms buttons */}
        {socials.length > 0 && (
          <div className="w-full px-6 mt-6 space-y-3">
            {socials.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full glass p-4 rounded-xl border border-white/5 flex items-center gap-3 text-gray-200 hover:text-white hover:border-neon-cyan/30 hover:bg-white/[0.03] transition-all duration-300 shadow-lg shadow-black/25 relative overflow-hidden group"
              >
                <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-neon-cyan to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-neon-cyan group-hover:scale-105 transition-transform duration-300">
                  {getSocialIcon(s.platform)}
                </div>
                <span className="font-bold text-sm tracking-wide">
                  {s.platform}
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Custom redirection buttons */}
        <div className="flex-1 w-full space-y-4 mt-8 px-6 pb-12">
          {customLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full glass p-4 rounded-xl border border-white/5 flex items-center justify-between text-right text-gray-200 hover:text-white hover:border-neon-cyan/30 hover:bg-white/[0.03] transition-all duration-300 group shadow-lg shadow-black/25 relative overflow-hidden"
              dir="rtl"
            >
              <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-neon-cyan to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-neon-cyan group-hover:scale-105 transition-transform duration-300">
                  {renderCustomIcon(link.icon)}
                </span>
                <span className="font-bold text-sm tracking-wide">
                  {link.title}
                </span>
              </div>
              <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-neon-cyan group-hover:-translate-x-1 transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* Small bottom footer */}
        <div className="py-5 text-center bg-gray-950/40 border-t border-white/5 mt-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-neon-cyan transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-neon-cyan" />
            <span>منصة ComixDev التقنية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
