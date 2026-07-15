"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يتكون من حرفين على الأقل").max(50, "الاسم طويل جداً"),
  image: z.string().url("رابط الصورة غير صالح").optional().or(z.literal("")),
});

export async function updateUserProfile(values: z.infer<typeof ProfileUpdateSchema>) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { error: "غير مصرح لك بإجراء هذا التعديل." };
  }

  const validatedFields = ProfileUpdateSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { name, image } = validatedFields.data;
  const userId = session.user.id;

  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name,
        image: image || null,
      },
    });

    // Revalidate dashboard routes to fetch fresh content
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");

    return { 
      success: "تم تحديث بيانات ملفك الشخصي بنجاح!", 
      user: {
        name: updatedUser.name,
        image: updatedUser.image,
      }
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "حدث خطأ غير متوقع أثناء تحديث البيانات. يرجى المحاولة مرة أخرى." };
  }
}
