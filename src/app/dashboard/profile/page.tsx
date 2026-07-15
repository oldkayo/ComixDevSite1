import React from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { User as UserIcon } from "lucide-react";

export default async function UserDashboardProfilePage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/dashboard/profile");
  }

  const userId = session.user.id;
  let userDetails = { name: "", email: "", image: "" };

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true },
    });

    if (user) {
      userDetails = {
        name: user.name || "",
        email: user.email || "",
        image: user.image || "",
      };
    }
  } catch (error) {
    console.error("Failed to query user details for profile page:", error);
  }

  return (
    <div className="w-full py-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-xl space-y-8 text-right">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center justify-start gap-2">
            <UserIcon className="w-7 h-7 text-neon-cyan" />
            الملف الشخصي
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            قم بتحديث معلومات حسابك وصورتك الرمزية للظهور بها في الشهادات والورشات.
          </p>
        </div>

        {/* Edit Form wrapper */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
          <ProfileForm initialUser={userDetails} />
        </div>

      </div>
    </div>
  );
}
