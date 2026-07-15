import React from "react";
import type { Metadata } from "next";
import { getSEOSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { Award, Globe, Building2, ShieldAlert } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOSettings("partners");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: seo.ogImage ? { images: [seo.ogImage] } : undefined,
  };
}

export default async function PartnersPage() {
  // Fetch all partners from database
  let partners: any[] = [];
  try {
    partners = await db.partner.findMany({
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Failed to query partners list:", error);
  }

  return (
    <div className="w-full py-12 md:py-20 min-h-screen bg-gray-950 text-right" dir="rtl">
      
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white flex items-center justify-center gap-3">
            <Award className="w-8 h-8 text-neon-cyan" />
            الشركاء والجهات المستضيفة
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            الشركات، الجامعات، والحواضن التقنية الداعمة والمستضيفة لمختلف الفعاليات والورشات التي نظمتها ComixDev.
          </p>
        </div>

        {/* Partners Grid */}
        {partners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {partners.map((partner) => (
              <div 
                key={partner.id} 
                className="glass rounded-2xl p-6 border border-white/5 flex flex-col justify-between items-center text-center space-y-6 hover:border-neon-cyan/20 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/5 relative group overflow-hidden"
              >
                
                {/* Accent line hover */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-neon-cyan to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Logo wrapper */}
                <div className="h-20 flex items-center justify-center p-3 rounded-xl bg-white/5 w-full border border-white/5 group-hover:border-white/10 transition-colors">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain brightness-95 opacity-80 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                </div>

                {/* Description details */}
                <div className="space-y-2 flex-grow flex flex-col justify-center">
                  <h3 className="text-base md:text-lg font-bold text-white group-hover:text-neon-cyan transition-colors">
                    {partner.name}
                  </h3>
                  {partner.description ? (
                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                      {partner.description}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 italic">لا يوجد وصف مضاف حالياً لهذا الشريك.</p>
                  )}
                </div>

                {/* Website CTA */}
                {partner.website && (
                  <div className="w-full border-t border-white/5 pt-4">
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-neon-cyan hover:underline font-mono"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      زيارة الموقع الإلكتروني
                    </a>
                  </div>
                )}

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-950/20 rounded-2xl border border-white/5 max-w-md mx-auto space-y-4">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-gray-400 text-sm">عذراً، لا يوجد شركاء مضافين في قاعدة البيانات حالياً.</p>
          </div>
        )}

      </div>
    </div>
  );
}
