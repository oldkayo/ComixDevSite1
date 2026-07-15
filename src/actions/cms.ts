"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { 
  SiteSettingsSchema, 
  SocialLinkSchema, 
  NavigationLinkSchema, 
  SEOSettingsSchema, 
  HeroSectionSettingsSchema, 
  WhyComixDevItemSchema, 
  TestimonialSchema,
  AboutUsSettingsSchema,
  TeamMemberSchema,
  ContactFormSettingsSchema,
  ContactMessageStatusSchema,
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

// ==========================================
// 1. Site Settings Actions
// ==========================================

export async function updateSiteSettings(values: z.infer<typeof SiteSettingsSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = SiteSettingsSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    let settings = await db.siteSettings.findFirst();

    if (settings) {
      await db.siteSettings.update({
        where: { id: settings.id },
        data: validatedFields.data,
      });
    } else {
      await db.siteSettings.create({
        data: validatedFields.data,
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/contact");
    revalidatePath("/admin/settings");

    return { success: "تم حفظ إعدادات الموقع بنجاح!" };
  } catch (error: any) {
    console.error("Update site settings error:", error);
    return { error: error.message || "حدث خطأ أثناء حفظ الإعدادات." };
  }
}

// ==========================================
// 2. Social Links Actions
// ==========================================

export async function createSocialLink(values: z.infer<typeof SocialLinkSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = SocialLinkSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    await db.socialLink.create({
      data: validatedFields.data,
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/socials");

    return { success: "تم إضافة رابط التواصل الاجتماعي بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

export async function updateSocialLink(id: string, values: z.infer<typeof SocialLinkSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = SocialLinkSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    await db.socialLink.update({
      where: { id },
      data: validatedFields.data,
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/socials");

    return { success: "تم تحديث رابط التواصل بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

export async function deleteSocialLink(id: string) {
  try {
    await ensureAdmin();

    await db.socialLink.delete({
      where: { id },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/socials");

    return { success: "تم حذف رابط التواصل الاجتماعي بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

// ==========================================
// 3. Navigation Links Actions
// ==========================================

export async function createNavigationLink(values: z.infer<typeof NavigationLinkSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = NavigationLinkSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    await db.navigationLink.create({
      data: validatedFields.data,
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/navigation");

    return { success: "تم إضافة رابط القائمة بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

export async function updateNavigationLink(id: string, values: z.infer<typeof NavigationLinkSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = NavigationLinkSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    await db.navigationLink.update({
      where: { id },
      data: validatedFields.data,
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/navigation");

    return { success: "تم تحديث رابط القائمة بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

export async function deleteNavigationLink(id: string) {
  try {
    await ensureAdmin();

    await db.navigationLink.delete({
      where: { id },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/navigation");

    return { success: "تم حذف رابط القائمة بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

// ==========================================
// 4. SEO Settings Actions
// ==========================================

export async function updateSEOSettings(id: string, values: z.infer<typeof SEOSettingsSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = SEOSettingsSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    await db.sEOSettings.update({
      where: { id },
      data: validatedFields.data,
    });

    // Revalidate all pages dynamically
    revalidatePath("/", "layout");
    revalidatePath("/admin/seo");

    return { success: "تم تحديث إعدادات الـ SEO بنجاح للمسار المحدد!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

// ==========================================
// 5. Hero Settings Actions
// ==========================================

export async function updateHeroSettings(values: z.infer<typeof HeroSectionSettingsSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = HeroSectionSettingsSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    const hero = await db.heroSectionSettings.findFirst();

    if (hero) {
      await db.heroSectionSettings.update({
        where: { id: hero.id },
        data: validatedFields.data,
      });
    } else {
      await db.heroSectionSettings.create({
        data: validatedFields.data,
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/homepage");

    return { success: "تم تحديث قسم الهيرو بالصفحة الرئيسية بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

// ==========================================
// 6. Why ComixDev Items Actions
// ==========================================

export async function createWhyItem(values: z.infer<typeof WhyComixDevItemSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = WhyComixDevItemSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    await db.whyComixDevItem.create({
      data: validatedFields.data,
    });

    revalidatePath("/");
    revalidatePath("/admin/homepage");

    return { success: "تم إضافة عنصر المزايا بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

export async function updateWhyItem(id: string, values: z.infer<typeof WhyComixDevItemSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = WhyComixDevItemSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    await db.whyComixDevItem.update({
      where: { id },
      data: validatedFields.data,
    });

    revalidatePath("/");
    revalidatePath("/admin/homepage");

    return { success: "تم تحديث عنصر المزايا بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

export async function deleteWhyItem(id: string) {
  try {
    await ensureAdmin();

    await db.whyComixDevItem.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/homepage");

    return { success: "تم حذف عنصر المزايا بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

// ==========================================
// 7. Testimonial Actions
// ==========================================

export async function createTestimonial(values: z.infer<typeof TestimonialSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = TestimonialSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    await db.testimonial.create({
      data: {
        name: validatedFields.data.name,
        role: validatedFields.data.role,
        image: validatedFields.data.image || null,
        content: validatedFields.data.content,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/testimonials");

    return { success: "تم إضافة رأي المشترك بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

export async function updateTestimonial(id: string, values: z.infer<typeof TestimonialSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = TestimonialSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    await db.testimonial.update({
      where: { id },
      data: {
        name: validatedFields.data.name,
        role: validatedFields.data.role,
        image: validatedFields.data.image || null,
        content: validatedFields.data.content,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/testimonials");

    return { success: "تم تحديث رأي المشترك بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

export async function deleteTestimonial(id: string) {
  try {
    await ensureAdmin();

    await db.testimonial.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/testimonials");

    return { success: "تم حذف رأي المشترك بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

// ==========================================
// 8. About Us Actions
// ==========================================

export async function updateAboutUsSettings(values: z.infer<typeof AboutUsSettingsSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = AboutUsSettingsSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    let settings = await db.aboutUsSettings.findFirst();
    if (settings) {
      await db.aboutUsSettings.update({
        where: { id: settings.id },
        data: validatedFields.data,
      });
    } else {
      await db.aboutUsSettings.create({
        data: validatedFields.data,
      });
    }

    revalidatePath("/about");
    revalidatePath("/admin/about");

    return { success: "تم حفظ إعدادات من نحن بنجاح!" };
  } catch (error: any) {
    console.error("Update about settings error:", error);
    return { error: error.message || "حدث خطأ أثناء الحفظ." };
  }
}

export async function createTeamMember(values: z.infer<typeof TeamMemberSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = TeamMemberSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    await db.teamMember.create({
      data: validatedFields.data,
    });

    revalidatePath("/about");
    revalidatePath("/admin/about");

    return { success: "تم إضافة عضو الفريق بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

export async function updateTeamMember(id: string, values: z.infer<typeof TeamMemberSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = TeamMemberSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    await db.teamMember.update({
      where: { id },
      data: validatedFields.data,
    });

    revalidatePath("/about");
    revalidatePath("/admin/about");

    return { success: "تم تحديث عضو الفريق بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

export async function deleteTeamMember(id: string) {
  try {
    await ensureAdmin();

    await db.teamMember.delete({
      where: { id },
    });

    revalidatePath("/about");
    revalidatePath("/admin/about");

    return { success: "تم حذف عضو الفريق بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

// ==========================================
// 9. Contact Form Settings & Messages Actions
// ==========================================

export async function updateContactFormSettings(values: z.infer<typeof ContactFormSettingsSchema>) {
  try {
    await ensureAdmin();

    const validatedFields = ContactFormSettingsSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    let settings = await db.contactFormSettings.findFirst();
    if (settings) {
      await db.contactFormSettings.update({
        where: { id: settings.id },
        data: validatedFields.data,
      });
    } else {
      await db.contactFormSettings.create({
        data: validatedFields.data,
      });
    }

    revalidatePath("/contact");
    revalidatePath("/admin/contact");

    return { success: "تم حفظ إعدادات نموذج الاتصال بنجاح!" };
  } catch (error: any) {
    console.error("Update contact settings error:", error);
    return { error: error.message || "حدث خطأ أثناء الحفظ." };
  }
}

export async function updateContactMessageStatus(id: string, status: "NEW" | "READ" | "REPLIED") {
  try {
    await ensureAdmin();

    await db.contactMessage.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/contact/messages");

    return { success: "تم تحديث حالة الرسالة بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}

export async function deleteContactMessage(id: string) {
  try {
    await ensureAdmin();

    await db.contactMessage.delete({
      where: { id },
    });

    revalidatePath("/admin/contact/messages");

    return { success: "تم حذف الرسالة بنجاح!" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ ما." };
  }
}
