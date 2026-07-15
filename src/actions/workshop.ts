"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { RegistrationStatus, WorkshopStatus } from "@prisma/client";

import { WorkshopSchema } from "@/lib/schemas";

// Admin validation helper
async function checkAdmin() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("غير مصرح: يجب أن تكون مديراً للقيام بهذا الإجراء.");
  }
  return session;
}

// Helper to process comma-separated strings into arrays (for photos/videos)
function processStringArray(input: string | string[] | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return input.split(",").map(s => s.trim()).filter(Boolean);
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
    startTime,
    endTime,
    duration,
    location,
    capacity,
    pointsReward,
    isPublished,
    status,
    attendeeCount,
    workshopNotes,
    hostOrganization,
    galleryLink,
    workshopPhotos,
    workshopVideos,
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
        startTime: startTime || null,
        endTime: endTime || null,
        duration,
        location,
        capacity,
        pointsReward,
        isPublished,
        status: status as WorkshopStatus,
        attendeeCount: attendeeCount || 0,
        workshopNotes: workshopNotes || null,
        hostOrganization: hostOrganization || null,
        galleryLink: galleryLink || null,
        workshopPhotos: processStringArray(workshopPhotos),
        workshopVideos: processStringArray(workshopVideos),
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
    startTime,
    endTime,
    duration,
    location,
    capacity,
    pointsReward,
    isPublished,
    status,
    attendeeCount,
    workshopNotes,
    hostOrganization,
    galleryLink,
    workshopPhotos,
    workshopVideos,
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
        startTime: startTime || null,
        endTime: endTime || null,
        duration,
        location,
        capacity,
        pointsReward,
        isPublished,
        status: status as WorkshopStatus,
        attendeeCount: attendeeCount || 0,
        workshopNotes: workshopNotes || null,
        hostOrganization: hostOrganization || null,
        galleryLink: galleryLink || null,
        workshopPhotos: processStringArray(workshopPhotos),
        workshopVideos: processStringArray(workshopVideos),
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

    // If status is ATTENDED and Workshop is COMPLETED, issue certificate if not exists
    if (status === RegistrationStatus.ATTENDED && existingReg.workshop.status === WorkshopStatus.COMPLETED) {
      const existingCertificate = await db.certificate.findFirst({
        where: {
          userId: existingReg.userId,
          workshopId: existingReg.workshopId,
        },
      });

      if (!existingCertificate) {
        // Generate certificate number like CMD-YYYY-XXXX
        const year = new Date().getFullYear();
        const lastCertificate = await db.certificate.findFirst({
          where: { certificateNumber: { startsWith: `CMD-${year}-` } },
          orderBy: { certificateNumber: "desc" },
        });
        
        let sequenceNumber = 1;
        if (lastCertificate) {
          const parts = lastCertificate.certificateNumber.split("-");
          sequenceNumber = parseInt(parts[2], 10) + 1;
        }
        
        const certificateNumber = `CMD-${year}-${String(sequenceNumber).padStart(4, "0")}`;

        await db.certificate.create({
          data: {
            userId: existingReg.userId,
            workshopId: existingReg.workshopId,
            certificateNumber,
            title: `شهادة حضور ورشة عمل: ${existingReg.workshop.title}`,
            issuedAt: new Date(),
          },
        });
      }
    }

    // Revalidate admin views
    revalidatePath(`/admin/workshops/${existingReg.workshopId}/registrations`);
    revalidatePath("/dashboard/workshops");
    revalidatePath("/dashboard/certificates");

    return { success: "تم تحديث حالة التسجيل بنجاح!" };
  } catch (error) {
    console.error("Update registration status error:", error);
    return { error: "حدث خطأ ما أثناء تحديث حالة التسجيل." };
  }
}
