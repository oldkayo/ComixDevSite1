import React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-gray-100 relative overflow-x-hidden">
      {/* Admin Sidebar */}
      <AdminSidebar user={session.user} />
      
      {/* Content wrapper */}
      <main className="flex-1 w-full overflow-y-auto" dir="rtl">
        {children}
      </main>
    </div>
  );
}
