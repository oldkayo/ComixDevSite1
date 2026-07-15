"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { RegistrationStatus } from "@prisma/client";

export async function registerForWorkshop(workshopId: string) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { error: "unauthenticated", message: "يجب عليك تسجيل الدخول أولاً للتسجيل في الورشة." };
  }

  const userId = session.user.id;

  try {
    // Check if workshop exists
    const workshop = await db.workshop.findUnique({
      where: { id: workshopId },
      include: { registrations: { where: { status: { not: RegistrationStatus.CANCELLED } } } },
    });

    if (!workshop) {
      return { error: "not_found", message: "الورشة المطلوبة غير موجودة." };
    }

    // Check if user is already registered (and not cancelled)
    const existingRegistration = await db.workshopRegistration.findUnique({
      where: {
        userId_workshopId: {
          userId,
          workshopId,
        },
      },
    });

    if (existingRegistration && existingRegistration.status !== RegistrationStatus.CANCELLED) {
      return { error: "already_registered", message: "You are already registered" };
    }

    // Check seat capacity availability
    const currentActiveRegistrations = workshop.registrations.length;
    if (currentActiveRegistrations >= workshop.capacity) {
      return { error: "no_seats", message: "عذراً، هذه الورشة مكتملة العدد بالكامل." };
    }

    // Start transaction to create/update registration and award user loyalty points
    await db.$transaction([
      db.workshopRegistration.upsert({
        where: {
          userId_workshopId: {
            userId,
            workshopId,
          },
        },
        create: {
          userId,
          workshopId,
          status: RegistrationStatus.REGISTERED,
        },
        update: {
          status: RegistrationStatus.REGISTERED,
          registeredAt: new Date(),
        },
      }),
      db.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: workshop.pointsReward,
          },
        },
      }),
    ]);

    // Revalidate paths for dynamic seat updates
    revalidatePath(`/workshops/${workshop.slug}`);
    revalidatePath("/workshops");
    revalidatePath("/");

    return {
      success: true,
      message: `تم تسجيلك في الورشة بنجاح! تم منحك ${workshop.pointsReward} نقطة ولاء.`,
    };
  } catch (error) {
    console.error("Workshop registration error:", error);
    return { error: "server_error", message: "حدث خطأ ما أثناء التسجيل. يرجى المحاولة مرة أخرى." };
  }
}
