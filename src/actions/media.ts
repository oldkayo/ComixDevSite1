"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { EventSchema, GalleryItemSchema, PartnerSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Helper to generate a URL-friendly slug supporting Arabic characters
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-") // Keep english, numbers, and arabic letters
    .replace(/^-+|-+$/g, ""); // strip leading/trailing hyphens
}

// ==========================================
// 1. Events Server Actions
// ==========================================

export async function createEvent(values: z.infer<typeof EventSchema>) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإجراء هذه العملية. تسجيل كمسؤول مطلوب." };
  }

  const validatedFields = EventSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { 
    title, 
    description, 
    coverImage, 
    startDate, 
    endDate, 
    location, 
    hostedBy, 
    attendeeCount, 
    isPublished,
    partnerIds
  } = validatedFields.data;

  try {
    let slug = generateSlug(title);

    // Ensure slug uniqueness
    const existingEvent = await db.event.findUnique({
      where: { slug },
    });

    if (existingEvent) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    await db.event.create({
      data: {
        title,
        slug,
        description,
        coverImage,
        startDate,
        endDate,
        location,
        hostedBy,
        attendeeCount,
        isPublished,
        eventPartners: partnerIds?.length
          ? { create: partnerIds.map(pid => ({ partnerId: pid })) }
          : undefined,
      },
    });

    revalidatePath("/events");
    revalidatePath("/admin/events");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: "تم إضافة الفعالية الجديدة بنجاح!" };
  } catch (error) {
    console.error("Create event error:", error);
    return { error: "حدث خطأ ما أثناء حفظ الفعالية." };
  }
}

export async function updateEvent(id: string, values: z.infer<typeof EventSchema>) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإجراء هذه العملية. تسجيل كمسؤول مطلوب." };
  }

  const validatedFields = EventSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { 
    title, 
    description, 
    coverImage, 
    startDate, 
    endDate, 
    location, 
    hostedBy, 
    attendeeCount, 
    isPublished,
    partnerIds
  } = validatedFields.data;

  try {
    const existing = await db.event.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "الفعالية المطلوبة غير موجودة." };
    }

    // Generate new slug only if title has changed
    let slug = existing.slug;
    if (existing.title !== title) {
      slug = generateSlug(title);
      const duplicate = await db.event.findUnique({
        where: { slug },
      });
      if (duplicate && duplicate.id !== id) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    // Update event fields
    await db.event.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        coverImage,
        startDate,
        endDate,
        location,
        hostedBy,
        attendeeCount,
        isPublished,
      },
    });

    // Sync partners via explicit join table (delete-then-recreate)
    if (partnerIds !== undefined) {
      await db.eventPartner.deleteMany({ where: { eventId: id } });
      if (partnerIds.length > 0) {
        await db.eventPartner.createMany({
          data: partnerIds.map(pid => ({ eventId: id, partnerId: pid })),
          skipDuplicates: true,
        });
      }
    }

    revalidatePath("/events");
    revalidatePath(`/events/${slug}`);
    revalidatePath("/admin/events");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: "تم تحديث بيانات الفعالية بنجام!" };
  } catch (error) {
    console.error("Update event error:", error);
    return { error: "حدث خطأ ما أثناء تعديل الفعالية." };
  }
}

export async function deleteEvent(id: string) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإجراء هذه العملية." };
  }

  try {
    const existing = await db.event.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "الفعالية المطلوبة غير موجودة." };
    }

    await db.event.delete({
      where: { id },
    });

    revalidatePath("/events");
    revalidatePath(`/events/${existing.slug}`);
    revalidatePath("/admin/events");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: "تم حذف الفعالية بنجاح!" };
  } catch (error) {
    console.error("Delete event error:", error);
    return { error: "حدث خطأ ما أثناء حذف الفعالية." };
  }
}

// ==========================================
// 2. Gallery Items Server Actions
// ==========================================

export async function createGalleryItem(values: z.infer<typeof GalleryItemSchema>) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإجراء هذه العملية." };
  }

  const validatedFields = GalleryItemSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { eventId, type, title, fileUrl, thumbnail } = validatedFields.data;

  try {
    await db.galleryItem.create({
      data: {
        eventId,
        type,
        title,
        fileUrl,
        thumbnail: thumbnail || null,
      },
    });

    revalidatePath("/gallery");
    const event = await db.event.findUnique({ where: { id: eventId } });
    if (event) {
      revalidatePath(`/events/${event.slug}`);
    }
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: "تم إضافة ملف الوسائط بنجاح للمعرض!" };
  } catch (error) {
    console.error("Create gallery item error:", error);
    return { error: "حدث خطأ ما أثناء حفظ ملف المعرض." };
  }
}

export async function deleteGalleryItem(id: string) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإجراء هذه العملية." };
  }

  try {
    const item = await db.galleryItem.findUnique({
      where: { id },
      include: { event: true }
    });

    if (!item) {
      return { error: "ملف المعرض المطلوب غير موجود." };
    }

    await db.galleryItem.delete({
      where: { id },
    });

    revalidatePath("/gallery");
    if (item.event) {
      revalidatePath(`/events/${item.event.slug}`);
    }
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: "تم حذف ملف الوسائط بنجاح!" };
  } catch (error) {
    console.error("Delete gallery item error:", error);
    return { error: "حدث خطأ ما أثناء حذف ملف المعرض." };
  }
}

// ==========================================
// 3. Partners Server Actions
// ==========================================

export async function createPartner(values: z.infer<typeof PartnerSchema>) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإجراء هذه العملية." };
  }

  const validatedFields = PartnerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { name, logo, website, description } = validatedFields.data;

  try {
    await db.partner.create({
      data: {
        name,
        logo,
        website: website || null,
        description: description || null,
      },
    });

    revalidatePath("/partners");
    revalidatePath("/admin/partners");
    revalidatePath("/events");
    revalidatePath("/");

    return { success: "تم إضافة الشريك الجديد بنجاح!" };
  } catch (error) {
    console.error("Create partner error:", error);
    return { error: "حدث خطأ ما أثناء حفظ الشريك." };
  }
}

export async function updatePartner(id: string, values: z.infer<typeof PartnerSchema>) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإجراء هذه العملية." };
  }

  const validatedFields = PartnerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { name, logo, website, description } = validatedFields.data;

  try {
    const existing = await db.partner.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "الشريك المطلوب غير موجود." };
    }

    await db.partner.update({
      where: { id },
      data: {
        name,
        logo,
        website: website || null,
        description: description || null,
      },
    });

    revalidatePath("/partners");
    revalidatePath("/admin/partners");
    revalidatePath("/events");
    revalidatePath("/");

    return { success: "تم تحديث بيانات الشريك بنجاح!" };
  } catch (error) {
    console.error("Update partner error:", error);
    return { error: "حدث خطأ ما أثناء تعديل الشريك." };
  }
}

export async function deletePartner(id: string) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإجراء هذه العملية." };
  }

  try {
    const existing = await db.partner.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "الشريك المطلوب غير موجود." };
    }

    await db.partner.delete({
      where: { id },
    });

    revalidatePath("/partners");
    revalidatePath("/admin/partners");
    revalidatePath("/events");
    revalidatePath("/");

    return { success: "تم حذف الشريك بنجاح!" };
  } catch (error) {
    console.error("Delete partner error:", error);
    return { error: "حدث خطأ ما أثناء حذف الشريك." };
  }
}
