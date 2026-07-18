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

// Helper to convert YYYY-MM-DD string to Date (local time)
function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

// 1. Create Workshop
export async function createWorkshop(values: z.infer<typeof WorkshopSchema>) {
  await checkAdmin();

  console.log("createWorkshop received values:", values);
  const validatedFields = WorkshopSchema.safeParse(values);
  console.log("createWorkshop validatedFields:", validatedFields);
  if (!validatedFields.success) {
    console.error("createWorkshop validation errors:", validatedFields.error.issues);
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
        coverImage: image || null,
        date: parseDateString(date),
        startTime: startTime || null,
        endTime: endTime || null,
        location,
        capacity,
        pointsReward,
        isPublished,
        status: status as WorkshopStatus,
        attendeeCount: attendeeCount || 0,
        workshopNotes: workshopNotes || null,
        hostOrganization: hostOrganization || null,
        galleryLink: galleryLink || null,
        workshopPhotos,
        workshopVideos,
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
        coverImage: image || null,
        date: parseDateString(date),
        startTime: startTime || null,
        endTime: endTime || null,
        location,
        capacity,
        pointsReward,
        isPublished,
        status: status as WorkshopStatus,
        attendeeCount: attendeeCount || 0,
        workshopNotes: workshopNotes || null,
        hostOrganization: hostOrganization || null,
        galleryLink: galleryLink || null,
        workshopPhotos,
        workshopVideos,
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

// 5. Auto-update workshop status based on date/time
// Called server-side to keep status in sync. Admin-set CANCELLED is never auto-overridden.
export async function autoUpdateWorkshopStatuses() {
  try {
    const now = new Date();
    const workshops = await db.workshop.findMany({
      where: {
        status: { not: WorkshopStatus.CANCELLED }, // Never override CANCELLED
        isPublished: true,
      },
      select: { id: true, date: true, startTime: true, endTime: true, status: true },
    });

    const updates: Promise<any>[] = [];

    for (const w of workshops) {
      const workshopDate = new Date(w.date);
      const dateStr = workshopDate.toISOString().split("T")[0];

      // Build start and end datetime
      let startDt: Date | null = null;
      let endDt: Date | null = null;

      if (w.startTime) {
        startDt = new Date(`${dateStr}T${w.startTime}:00`);
      } else {
        // Fallback: treat date itself as start
        startDt = new Date(workshopDate);
        startDt.setHours(0, 0, 0, 0);
      }

      if (w.endTime) {
        endDt = new Date(`${dateStr}T${w.endTime}:00`);
      } else {
        // Fallback: treat midnight of next day as end
        endDt = new Date(workshopDate);
        endDt.setHours(23, 59, 59, 999);
      }

      let newStatus: WorkshopStatus;

      if (now < startDt) {
        newStatus = WorkshopStatus.UPCOMING;
      } else if (now >= startDt && now <= endDt) {
        newStatus = WorkshopStatus.ONGOING;
      } else {
        newStatus = WorkshopStatus.COMPLETED;
      }

      if (w.status !== newStatus) {
        updates.push(
          db.workshop.update({
            where: { id: w.id },
            data: { status: newStatus },
          })
        );
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
      revalidatePath("/workshops");
      revalidatePath("/admin/workshops");
    }

    return { updated: updates.length };
  } catch (error) {
    console.error("autoUpdateWorkshopStatuses error:", error);
    return { updated: 0 };
  }
}

// 6. Quick status override (Admin only - manual override)
export async function updateWorkshopStatus(workshopId: string, status: WorkshopStatus) {
  await checkAdmin();

  try {
    const w = await db.workshop.findUnique({ where: { id: workshopId } });
    if (!w) return { error: "الورشة غير موجودة." };

    await db.workshop.update({
      where: { id: workshopId },
      data: { status },
    });

    revalidatePath("/workshops");
    revalidatePath(`/workshops/${w.slug}`);
    revalidatePath("/admin/workshops");

    return { success: "تم تحديث حالة الورشة بنجاح!" };
  } catch (error) {
    console.error("updateWorkshopStatus error:", error);
    return { error: "حدث خطأ أثناء تحديث الحالة." };
  }
}

