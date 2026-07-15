"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { RegistrationStatus } from "@prisma/client";

import { WorkshopSchema } from "@/lib/schemas";

// Admin validation helper
async function checkAdmin() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("غير مصرح: يجب أن تكون مديراً للقيام بهذا الإجراء.");
  }
  return session;
}

// 1. Create Workshop
export async function createWorkshop(values: z.infer<typeof WorkshopSchema>) {
  await checkAdmin();

  const validatedFields = WorkshopSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "البيانات المدخلة غير صالحة." };
  }

  const {
    title,
    shortDescription,
    description,
    image,
    date,
    duration,
    location,
    capacity,
    pointsReward,
    isPublished,
  } = validatedFields.data;

  try {
    // Generate custom multilingual slug
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check slug uniqueness
    const existing = await db.workshop.findUnique({
      where: { slug },
    });

    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
    }

    await db.workshop.create({
      data: {
        title,
        slug,
        shortDescription,
        description,
        image: image || null,
        date: new Date(date),
        duration,
        location,
        capacity,
        pointsReward,
        isPublished,
      },
    });

    // Revalidate paths
    revalidatePath("/workshops");
    revalidatePath("/admin/workshops");
    revalidatePath("/");

    return { success: "تم إنشاء ورشة العمل بنجاح!" };
  } catch (error) {
    console.error("Create workshop error:", error);
    return { error: "حدث خطأ ما أثناء إنشاء ورشة العمل." };
  }
}

// 2. Update Workshop
export async function updateWorkshop(id: string, values: z.infer<typeof WorkshopSchema>) {
  await checkAdmin();

  const validatedFields = WorkshopSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "البيانات المدخلة غير صالحة." };
  }

  const {
    title,
    shortDescription,
    description,
    image,
    date,
    duration,
    location,
    capacity,
    pointsReward,
    isPublished,
  } = validatedFields.data;

  try {
    const existingWorkshop = await db.workshop.findUnique({ where: { id } });
    if (!existingWorkshop) {
      return { error: "ورشة العمل المطلوبة غير موجودة." };
    }

    // Update slug only if title changes
    let slug = existingWorkshop.slug;
    if (existingWorkshop.title !== title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const existingSlug = await db.workshop.findUnique({ where: { slug } });
      if (existingSlug && existingSlug.id !== id) {
        slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
      }
    }

    await db.workshop.update({
      where: { id },
      data: {
        title,
        slug,
        shortDescription,
        description,
        image: image || null,
        date: new Date(date),
        duration,
        location,
        capacity,
        pointsReward,
        isPublished,
      },
    });

    // Revalidate paths
    revalidatePath(`/workshops/${slug}`);
    revalidatePath("/workshops");
    revalidatePath("/admin/workshops");
    revalidatePath("/");

    return { success: "تم تعديل ورشة العمل بنجاح!" };
  } catch (error) {
    console.error("Update workshop error:", error);
    return { error: "حدث خطأ ما أثناء تعديل ورشة العمل." };
  }
}

// 3. Delete Workshop
export async function deleteWorkshop(id: string) {
  await checkAdmin();

  try {
    const existing = await db.workshop.findUnique({ where: { id } });
    if (!existing) {
      return { error: "ورشة العمل المطلوبة غير موجودة." };
    }

    await db.workshop.delete({
      where: { id },
    });

    // Revalidate paths
    revalidatePath("/workshops");
    revalidatePath("/admin/workshops");
    revalidatePath("/");

    return { success: "تم حذف ورشة العمل بنجاح!" };
  } catch (error) {
    console.error("Delete workshop error:", error);
    return { error: "حدث خطأ ما أثناء حذف ورشة العمل." };
  }
}

// 4. Update Registration Status
export async function updateRegistrationStatus(registrationId: string, status: RegistrationStatus) {
  await checkAdmin();

  try {
    const existingReg = await db.workshopRegistration.findUnique({
      where: { id: registrationId },
      include: { workshop: true },
    });

    if (!existingReg) {
      return { error: "سجل التسجيل المطلوب غير موجود." };
    }

    await db.workshopRegistration.update({
      where: { id: registrationId },
      data: { status },
    });

    // Revalidate admin views
    revalidatePath(`/admin/workshops/${existingReg.workshopId}/registrations`);
    revalidatePath("/dashboard/workshops");

    return { success: "تم تحديث حالة التسجيل بنجاح!" };
  } catch (error) {
    console.error("Update registration status error:", error);
    return { error: "حدث خطأ ما أثناء تحديث حالة التسجيل." };
  }
}
