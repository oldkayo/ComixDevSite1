import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getContactFormSettings } from "@/lib/settings";
import { ContactSettingsForm } from "@/components/admin/contact-settings-form";
import { MessageSquare, Mail } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default async function AdminContactPage() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const settings = await getContactFormSettings();

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        <div className="border-b border-white/5 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-neon-cyan" />
              إدارة الاتصال
            </h1>
          </div>
          <Link href="/admin/contact/messages" className={buttonVariants({
            className: "bg-gradient-to-r from-neon-purple to-neon-pink text-white"
          })}>
            <Mail className="w-4 h-4" />
            عرض الرسائل
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">إعدادات نموذج الاتصال</h2>
          <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl">
            <ContactSettingsForm initialSettings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
}
