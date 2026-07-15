import React from "react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Mail, MapPin, Phone, MessageSquare, Clock } from "lucide-react";
import { getSiteSettings, getSEOSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOSettings("contact");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: seo.ogImage ? { images: [seo.ogImage] } : undefined,
  };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="w-full py-12 md:py-20 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-5xl space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">
            اتصل بنا
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            هل لديك أي استفسار حول ورش العمل أو ترغب في التعاون معنا؟ يسعدنا دائماً تواصلك معنا مباشرة وسيقوم فريقنا بالرد عليك في أقرب وقت.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          
          {/* Column 1: Info Cards (2/5 size) */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="glass p-6 rounded-xl space-y-6 border border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-neon-cyan" />
                معلومات الاتصال
              </h2>
              
              <div className="space-y-4">
                
                {settings.contactEmail && (
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded bg-white/5 border border-white/10 text-neon-cyan shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs text-gray-500 font-semibold mb-0.5">البريد الإلكتروني للعملاء</h4>
                      <a href={`mailto:${settings.contactEmail}`} className="text-sm text-gray-200 hover:text-neon-cyan transition-colors">
                        {settings.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {settings.contactPhone && (
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded bg-white/5 border border-white/10 text-neon-cyan shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs text-gray-500 font-semibold mb-0.5">رقم الهاتف / الواتس آب</h4>
                      <span className="text-sm text-gray-200 font-mono" dir="ltr">
                        {settings.contactPhone}
                      </span>
                    </div>
                  </div>
                )}

                {settings.address && (
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded bg-white/5 border border-white/10 text-neon-cyan shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs text-gray-500 font-semibold mb-0.5">المقر الرئيسي</h4>
                      <p className="text-sm text-gray-200">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded bg-white/5 border border-white/10 text-neon-cyan shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500 font-semibold mb-0.5">أوقات العمل واستلام الاستفسارات</h4>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      من الأحد إلى الخميس: 9:00 ص - 6:00 م (KSA)
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Column 2: Interactive Contact Form (3/5 size) */}
          <div className="md:col-span-3 glass p-6 md:p-8 rounded-xl border border-white/10 shadow-xl">
            <h2 className="text-lg md:text-xl font-bold text-white mb-6">
              إرسال رسالة مباشرة
            </h2>
            <ContactForm />
          </div>

        </div>

      </div>
    </div>
  );
}
