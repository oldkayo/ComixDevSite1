import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { LayoutDashboard, Users, BookOpen, Zap, Image } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [totalUsers, totalWorkshops, totalPrompts, totalMessages] = await Promise.all([
    db.user.count(),
    db.workshop.count(),
    db.prompt.count(),
    db.contactMessage.count(),
  ]);

  const stats = [
    {
      label: "المستخدمون",
      value: totalUsers,
      icon: Users,
      color: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20",
    },
    {
      label: "الورش",
      value: totalWorkshops,
      icon: BookOpen,
      color: "text-neon-purple bg-neon-purple/10 border-neon-purple/20",
    },
    {
      label: "البرومبتات",
      value: totalPrompts,
      icon: Zap,
      color: "text-neon-pink bg-neon-pink/10 border-neon-pink/20",
    },
    {
      label: "الرسائل",
      value: totalMessages,
      icon: Image,
      color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    },
  ];

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-neon-cyan" />
            لوحة التحكم
          </h1>
          <p className="text-gray-400 text-sm mt-2">مرحباً بك في لوحة تحكم ComixDev</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`glass p-6 rounded-2xl border ${stat.color.split(" ")[2]} shadow-xl`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${stat.color.split(" ")[0]}`} />
                </div>
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
