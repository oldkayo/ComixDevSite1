"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { 
  LinkHubSettingsSchema, 
  SocialPlatformSchema, 
  CustomLinkSchema 
} from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Helper to check admin session
async function ensureAdmin() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("غير مصرح لك بإجراء هذه العملية.");
  }
}

// 1. Update LinkHub Settings
export async function updateLinkHubSettings(data: z.infer<typeof LinkHubSettingsSchema>) {
  try {
    await ensureAdmin();

    const parsed = LinkHubSettingsSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { title, description, logo, coverImage, isEnabled } = parsed.data;

    const existing = await db.linkHubSettings.findFirst();

    if (existing) {
      await db.linkHubSettings.update({
        where: { id: existing.id },
        data: {
          title,
          description,
          logo: logo || null,
          coverImage: coverImage || null,
          isEnabled,
        },
      });
    } else {
      await db.linkHubSettings.create({
        data: {
          title,
          description,
          logo: logo || null,
          coverImage: coverImage || null,
          isEnabled,
        },
      });
    }

    revalidatePath("/connect");
    revalidatePath("/admin/linkhub");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update LinkHub Settings:", error);
    return { error: error.message || "حدث خطأ غير متوقع أثناء حفظ الإعدادات." };
  }
}

// 2. Update Social Platforms
export async function updateSocialPlatforms(platforms: any[]) {
  try {
    await ensureAdmin();

    if (!Array.isArray(platforms)) {
      return { error: "بيانات المنصات غير صالحة." };
    }

    // Process all updates in transactional queries
    const promises = platforms.map(async (platform) => {
      const parsed = SocialPlatformSchema.safeParse(platform);
      if (!parsed.success) {
        throw new Error(`خطأ في منصة ${platform.platform || "غير معروفة"}: ${parsed.error.issues[0].message}`);
      }

      const { url, isEnabled, displayOrder } = parsed.data;

      return db.socialPlatform.update({
        where: { platform: platform.platform },
        data: {
          url: url || "",
          isEnabled,
          displayOrder,
        },
      });
    });

    await Promise.all(promises);

    revalidatePath("/connect");
    revalidatePath("/admin/linkhub/socials");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update social platforms:", error);
    return { error: error.message || "حدث خطأ أثناء تعديل روابط المنصات." };
  }
}

// 3. Add Custom Link
export async function addCustomLink(data: z.infer<typeof CustomLinkSchema>) {
  try {
    await ensureAdmin();

    const parsed = CustomLinkSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { title, url, icon, isEnabled, displayOrder } = parsed.data;

    await db.customLink.create({
      data: {
        title,
        url,
        icon: icon || null,
        isEnabled,
        displayOrder,
      },
    });

    revalidatePath("/connect");
    revalidatePath("/admin/linkhub/custom");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add custom link:", error);
    return { error: error.message || "حدث خطأ أثناء إضافة الرابط المخصص." };
  }
}

// 4. Update Custom Link
export async function updateCustomLink(id: string, data: z.infer<typeof CustomLinkSchema>) {
  try {
    await ensureAdmin();

    const parsed = CustomLinkSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { title, url, icon, isEnabled, displayOrder } = parsed.data;

    await db.customLink.update({
      where: { id },
      data: {
        title,
        url,
        icon: icon || null,
        isEnabled,
        displayOrder,
      },
    });

    revalidatePath("/connect");
    revalidatePath("/admin/linkhub/custom");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update custom link:", error);
    return { error: error.message || "حدث خطأ أثناء تحديث الرابط المخصص." };
  }
}

// 5. Delete Custom Link
export async function deleteCustomLink(id: string) {
  try {
    await ensureAdmin();

    await db.customLink.delete({
      where: { id },
    });

    revalidatePath("/connect");
    revalidatePath("/admin/linkhub/custom");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete custom link:", error);
    return { error: error.message || "حدث خطأ أثناء حذف الرابط المخصص." };
  }
}
