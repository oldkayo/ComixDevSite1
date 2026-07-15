"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

// 1. Register Action
export async function register(values: z.infer<typeof RegisterSchema>) {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "البيانات المدخلة غير صالحة." };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // Rate Limiting: Max 3 registration attempts per 60 seconds
    await rateLimit("register", email, 3, 60);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        error: "هذا البريد الإلكتروني مسجل بالفعل.",
      };
    }

    // New User Registration: encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        points: 0,
      },
    });

    return {
      success: "تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.",
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: error.message || "حدث خطأ ما أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى." };
  }
}
