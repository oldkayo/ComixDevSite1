import React from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { EventForm } from "@/components/admin/event-form";
import { Film, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminEventEditPage({ params }: PageProps) {
  const session = await auth();

  // Guard access
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const resolvedParams = await params;
  const id = resolvedParams.id;

  let event: any = null;
  let partners: any[] = [];

  try {
    [event, partners] = await Promise.all([
      db.event.findUnique({
        where: { id },
        include: { eventPartners: { include: { partner: { select: { id: true, name: true } } } } }
      }),
      db.partner.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true }
      })
    ]);
  } catch (error) {
    console.error("Failed to query edit event info:", error);
  }

  // Flatten the eventPartners join to a simple partner list for the form
  if (event?.eventPartners) {
    event = { ...event, partners: event.eventPartners.map((ep: any) => ep.partner) };
  }


  if (!event) {
    notFound();
  }

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-2xl space-y-8">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center justify-start gap-2">
              <Film className="w-7 h-7 text-neon-cyan" />
              تعديل الفعالية
            </h1>
            <p className="text-sm text-gray-400">
              قم بتعديل بيانات الفعالية، غلاف التغطية، أو الشركاء الداعمين.
            </p>
          </div>
          
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 ml-1" />
            العودة للقائمة
          </Link>
        </div>

        {/* Form container */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
          <EventForm 
            partners={partners}
            initialEvent={{
              id: event.id,
              title: event.title,
              description: event.description,
              coverImage: event.coverImage,
              startDate: event.startDate,
              endDate: event.endDate,
              location: event.location,
              hostedBy: event.hostedBy,
              attendeeCount: event.attendeeCount,
              isPublished: event.isPublished,
              partners: event.partners,
            }}
          />
        </div>

      </div>
    </div>
  );
}
