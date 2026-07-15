"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { updateUserProfile } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Mail, Camera, AlertCircle, CheckCircle2 } from "lucide-react";

interface ProfileFormProps {
  initialUser: {
    name: string;
    email: string;
    image: string;
  };
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const { update } = useSession();
  const [name, setName] = useState(initialUser.name);
  const [image, setImage] = useState(initialUser.image);
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const defaultAvatar = "/images/workshop_ai.png";

  // Handle Client-Side Direct Cloudinary Unsigned Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setStatus({ type: "error", message: "حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 3 ميجابايت." });
      return;
    }

    setUploading(true);
    setStatus(null);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // Graceful fallback if Cloudinary settings are missing
    if (!cloudName || !uploadPreset || cloudName === "your_cloud_name") {
      console.log("[DEVELOPMENT PROFILE UPLOAD FALLBACK] Simulating upload...");
      // Simulate network latency (1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Use a cute random placeholder avatar for development
      const avatars = [
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150"
      ];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      
      setImage(randomAvatar);
      setStatus({ type: "success", message: "تمت محاكاة رفع الصورة بنجاح (بيئة التطوير)." });
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Cloudinary upload failed");
      }

      const data = await res.json();
      setImage(data.secure_url);
      setStatus({ type: "success", message: "تم رفع الصورة بنجاح!" });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      setStatus({ type: "error", message: "فشل رفع الصورة إلى Cloudinary. يرجى التحقق من الإعدادات." });
    } finally {
      setUploading(false);
    }
  };

  // Handle Profile Form Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    if (!name || name.trim().length < 2) {
      setStatus({ type: "error", message: "الاسم الكامل يجب أن يتكون من حرفين على الأقل." });
      setSaving(false);
      return;
    }

    try {
      const result = await updateUserProfile({ name, image });

      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: result.success || "تم تحديث الملف الشخصي بنجاح!" });
        
        // Trigger NextAuth's dynamic session update
        await update({
          name,
          image,
        });
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حفظ التعديلات." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Status Alert Banners */}
      {status?.type === "success" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      {status?.type === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      {/* Main Profile Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Avatar Uploader Section */}
        <div className="flex flex-col items-center justify-center gap-4 border-b border-white/5 pb-6">
          <div className="relative group">
            <img
              src={image || defaultAvatar}
              alt={name}
              className="w-24 h-24 rounded-full object-cover border-2 border-white/10 group-hover:border-neon-cyan transition-colors"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-6 h-6 text-white" />
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={uploading || saving}
            />
          </div>

          <div className="text-center space-y-1">
            <span className="text-xs text-gray-500 block">اضغط على الصورة لتعديل الصورة الرمزية</span>
            {uploading && (
              <span className="text-[10px] text-neon-cyan font-semibold flex items-center gap-1 justify-center">
                <Loader2 className="w-3 h-3 animate-spin" />
                جاري الرفع...
              </span>
            )}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5 text-right">
            <label htmlFor="name" className="text-xs font-semibold text-gray-400 block">
              الاسم الكامل
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={uploading || saving}
                placeholder="اسمك الكامل..."
                className="bg-white/5 border-white/10 text-white pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan"
              />
            </div>
          </div>

          {/* Email (Read Only) */}
          <div className="space-y-1.5 text-right">
            <label htmlFor="email" className="text-xs font-semibold text-gray-500 block">
              البريد الإلكتروني (لا يمكن تعديله)
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
              <Input
                type="email"
                id="email"
                value={initialUser.email}
                readOnly
                disabled
                className="bg-white/[0.02] border-white/5 text-gray-500 cursor-not-allowed pr-10 pl-4"
              />
            </div>
          </div>

        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={uploading || saving}
          className="w-full bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90 font-medium py-5 text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "حفظ التغييرات"
          )}
        </Button>

      </form>

    </div>
  );
}
