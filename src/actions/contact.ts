"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getContactFormSettings } from "@/lib/settings";

const ContactSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يتكون من حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  message: z.string().min(10, "الرسالة يجب أن تتكون من 10 أحرف على الأقل"),
});

export async function submitContact(values: z.infer<typeof ContactSchema>) {
  const validatedFields = ContactSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "البيانات المدخلة غير صالحة." };
  }

  const settings = await getContactFormSettings();
  if (!settings.isFormEnabled) {
    return { error: "نموذج الاتصال غير متاح حالياً." };
  }

  const { name, email, message } = validatedFields.data;

  try {
    await db.contactMessage.create({
      data: {
        name,
        email,
        message,
        status: "NEW",
      },
    });
    
    console.log(`[Contact Form Submission] Name: ${name}, Email: ${email}, Message: ${message}`);

    return { success: settings.successMessage };
  } catch (error) {
    console.error("Contact submission error:", error);
    return { error: "حدث خطأ ما أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى." };
  }
}
