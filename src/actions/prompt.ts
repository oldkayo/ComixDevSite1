"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PromptSchema } from "@/lib/schemas";
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

// 1. Create Prompt Action
export async function createPrompt(values: z.infer<typeof PromptSchema>) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإجراء هذه العملية. تسجيل كمسؤول مطلوب." };
  }

  const validatedFields = PromptSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { title, description, content, categoryId, tags, thumbnail, isPublished } = validatedFields.data;

  // Process tags: split by comma, trim whitespace, remove duplicates
  const processedTags = tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  try {
    let slug = generateSlug(title);

    // Ensure slug uniqueness
    const existingPrompt = await db.prompt.findUnique({
      where: { slug },
    });

    if (existingPrompt) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    await db.prompt.create({
      data: {
        title,
        slug,
        description,
        content,
        categoryId,
        tags: processedTags,
        thumbnail: thumbnail || null,
        isPublished,
        copyCount: 0,
        viewCount: 0,
      },
    });

    // Revalidate paths
    revalidatePath("/prompts");
    revalidatePath("/admin/prompts");
    revalidatePath("/");

    return { success: "تم إضافة البرومبت الجديد بنجاح!" };
  } catch (error) {
    console.error("Create prompt error:", error);
    return { error: "حدث خطأ ما أثناء حفظ البرومبت." };
  }
}

// 2. Update Prompt Action
export async function updatePrompt(id: string, values: z.infer<typeof PromptSchema>) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإجراء هذه العملية. تسجيل كمسؤول مطلوب." };
  }

  const validatedFields = PromptSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { title, description, content, categoryId, tags, thumbnail, isPublished } = validatedFields.data;

  const processedTags = tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  try {
    const existing = await db.prompt.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "البرومبت المطلوب غير موجود." };
    }

    // Generate new slug only if title has changed
    let slug = existing.slug;
    if (existing.title !== title) {
      slug = generateSlug(title);
      const duplicate = await db.prompt.findUnique({
        where: { slug },
      });
      if (duplicate && duplicate.id !== id) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    await db.prompt.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        content,
        categoryId,
        tags: processedTags,
        thumbnail: thumbnail || null,
        isPublished,
      },
    });

    // Revalidate paths
    revalidatePath("/prompts");
    revalidatePath(`/prompts/${slug}`);
    revalidatePath("/admin/prompts");
    revalidatePath("/");

    return { success: "تم تحديث بيانات البرومبت بنجاح!" };
  } catch (error) {
    console.error("Update prompt error:", error);
    return { error: "حدث خطأ ما أثناء تعديل البرومبت." };
  }
}

// 3. Delete Prompt Action
export async function deletePrompt(id: string) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإجراء هذه العملية. تسجيل كمسؤول مطلوب." };
  }

  try {
    const existing = await db.prompt.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "البرومبت المطلوب غير موجود." };
    }

    await db.prompt.delete({
      where: { id },
    });

    // Revalidate paths
    revalidatePath("/prompts");
    revalidatePath(`/prompts/${existing.slug}`);
    revalidatePath("/admin/prompts");
    revalidatePath("/");

    return { success: "تم حذف البرومبت بنجاح!" };
  } catch (error) {
    console.error("Delete prompt error:", error);
    return { error: "حدث خطأ ما أثناء حذف البرومبت." };
  }
}

// 4. Increment Copy Count (Public action triggered on client clipboard copy)
export async function incrementCopyCount(id: string) {
  try {
    await db.prompt.update({
      where: { id },
      data: {
        copyCount: {
          increment: 1,
        },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to increment copy count:", error);
    return { error: true };
  }
}

// 5. Toggle Prompt Publication Status
export async function togglePromptPublish(id: string) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإجراء هذه العملية." };
  }

  try {
    const existing = await db.prompt.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "البرومبت غير موجود." };
    }

    await db.prompt.update({
      where: { id },
      data: {
        isPublished: !existing.isPublished,
      },
    });

    revalidatePath("/prompts");
    revalidatePath(`/prompts/${existing.slug}`);
    revalidatePath("/admin/prompts");
    revalidatePath("/");

    return { success: "تم تعديل حالة النشر بنجاح!" };
  } catch (error) {
    console.error("Toggle prompt publish error:", error);
    return { error: "حدث خطأ ما أثناء تعديل حالة النشر." };
  }
}
