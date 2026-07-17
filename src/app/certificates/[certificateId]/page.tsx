import React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { PrintTrigger } from "@/components/dashboard/print-trigger";
import { Award, ShieldCheck, Zap, Calendar } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    certificateId: string;
  }>;
}

export default async function UserCertificateDetailsPage({
  params,
}: PageProps) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const certificateId = resolvedParams.certificateId;

  // Retrieve certificate details
  let certificate: any = null;
  try {
    certificate = await db.certificate.findUnique({
      where: { id: certificateId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        workshop: {
          select: {
            title: true,
            date: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error retrieving certificate:", error);
  }

  if (!certificate) {
    return (
      <div className="w-full py-12 min-h-screen flex items-center justify-center">
        <div className="text-center py-20 bg-gray-950/20 rounded-xl border border-white/5 max-w-md mx-auto space-y-4">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 inline-flex">
            <Award className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">
            الشهادة غير موجودة أو تم حذفها
          </h2>
          <p className="text-sm text-gray-400">
            لا توجد شهادة بهذا الرابط أو قد تم إيقاف نشرها.
          </p>
          <Link
            href="/dashboard/certificates"
            className={buttonVariants({
              className:
                "bg-gradient-to-r from-neon-cyan to-neon-blue text-white text-sm px-4 h-9",
            })}
          >
            العودة إلى شهاداتي
          </Link>
        </div>
      </div>
    );
  }

  // Security: only allow the owner to view this private download/details page
  if (certificate.userId !== session.user.id) {
    redirect("/dashboard");
  }

  // QR Code verification endpoint link
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-certificate/${certificate.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

  return (
    <div className="w-full min-h-screen bg-gray-950 py-12 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background blurs (no-print) */}
      <div className="no-print absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="no-print absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      {/* CSS overrides for print screen layout */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body, html {
            background-color: #ffffff !important;
            color: #111827 !important;
          }
          .no-print {
            display: none !important;
          }
          .certificate-card {
            background-color: #ffffff !important;
            color: #111827 !important;
            border: 12px double #1f2937 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 40px !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            border-radius: 0 !important;
          }
          .text-neon-cyan {
            color: #0891b2 !important;
          }
          .text-neon-purple {
            color: #7c3aed !important;
          }
          .text-gray-400 {
            color: #4b5563 !important;
          }
          .text-gray-500 {
            color: #6b7280 !important;
          }
        }
      `,
        }}
      />

      {/* Print Controller Tool Bar */}
      <PrintTrigger />

      {/* Certificate Main Card */}
      <div className="certificate-card w-full max-w-4xl bg-gray-900 border-4 border-double border-white/10 rounded-3xl p-8 md:p-16 text-center space-y-8 relative shadow-2xl relative z-10">
        {/* Certificate Border accents (glowing corners on screen, hidden on print) */}
        <div className="no-print absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-cyan rounded-tr-3xl pointer-events-none" />
        <div className="no-print absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neon-purple rounded-bl-3xl pointer-events-none" />

        {/* Certificate Header Banner */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neon-cyan mb-2 shadow-lg shadow-neon-cyan/5">
            <Zap className="w-8 h-8 text-neon-cyan" />
          </div>
          <span className="text-neon-cyan font-bold tracking-[6px] text-xs uppercase font-mono">
            ComixDev Academy
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white bg-gradient-to-l from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent">
            شهادة حضور معتمدة
          </h1>
          <p className="text-xs text-gray-500 font-mono tracking-wider">
            CERTIFICATE OF ATTENDANCE
          </p>
        </div>

        {/* Certificate Body text */}
        <div className="space-y-6 max-w-2xl mx-auto text-gray-300">
          <p className="text-sm md:text-base leading-relaxed text-gray-400">
            تُمنح هذه الشهادة المعتمدة تقديراً لحضور وإتمام ورشة العمل التقنية
            بنجاح:
          </p>

          <h2 className="text-2xl md:text-3xl font-black text-white py-1">
            {certificate.user.name || "عضو نشط"}
          </h2>

          <div className="w-24 h-[1px] bg-gradient-to-r from-neon-cyan to-neon-purple mx-auto my-4" />

          <p className="text-sm md:text-base leading-relaxed text-gray-400">
            والمعنونة باسم:
          </p>

          <h3 className="text-lg md:text-xl font-bold text-neon-cyan">
            {certificate.workshop.title}
          </h3>

          <p className="text-xs md:text-sm text-gray-500">
            الصادرة بتأريخ:{" "}
            {new Date(certificate.issuedAt).toLocaleDateString("ar-EG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Validation QR and Signatures */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-8 max-w-3xl mx-auto">
          {/* Signatures */}
          <div className="text-right space-y-1">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase font-mono">
              Issued by
            </span>
            <span className="text-sm font-bold text-white block">
              إدارة ComixDev
            </span>
            <span className="text-xs text-neon-purple font-semibold block">
              أكاديمية التدريب والذكاء الاصطناعي
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-full mt-2 self-start w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>شهادة موثقة إلكترونياً</span>
            </div>
          </div>

          {/* QR Code block */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-2xl">
            <img
              src={qrCodeUrl}
              alt="Verification QR Code"
              className="w-24 h-24 object-contain rounded-lg border border-white/10 shrink-0 bg-white p-1"
            />
            <div className="text-right space-y-1">
              <span className="text-[10px] text-gray-500 font-semibold block">
                رمز التحقق للشهادة
              </span>
              <span className="text-[10px] text-neon-cyan font-mono font-bold block">
                {certificate.certificateNumber}
              </span>
              <p className="text-[9px] text-gray-400 max-w-[150px] leading-snug">
                امسح الرمز ضوئياً للتحقق الفوري من صحة وصلاحية هذه الشهادة عبر
                موقعنا الرسمي.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
