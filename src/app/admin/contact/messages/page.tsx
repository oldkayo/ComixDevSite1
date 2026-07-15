import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getContactMessages } from "@/lib/settings";
import { updateContactMessageStatus, deleteContactMessage } from "@/actions/cms";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Mail, Trash2, ArrowLeft, CheckCircle2, Eye } from "lucide-react";
import Link from "next/link";

export default async function AdminContactMessagesPage() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const messages = await getContactMessages();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "READ":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "REPLIED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "NEW":
        return "جديدة";
      case "READ":
        return "مقروئة";
      case "REPLIED":
        return "مُجاب عليها";
      default:
        return status;
    }
  };

  return (
    <div className="w-full py-12 min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        <div className="border-b border-white/5 pb-6 flex items-center gap-4">
          <Link href="/admin/contact" className={buttonVariants({
            variant: "outline",
            className: "border-white/10 bg-white/5"
          })}>
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <Mail className="w-7 h-7 text-neon-cyan" />
            رسائل الاتصال
          </h1>
        </div>

        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => {
              const handleMarkRead = async () => {
                "use server";
                await updateContactMessageStatus(msg.id, "READ");
              };
              const handleMarkReplied = async () => {
                "use server";
                await updateContactMessageStatus(msg.id, "REPLIED");
              };
              const handleDelete = async () => {
                "use server";
                await deleteContactMessage(msg.id);
              };

              return (
                <div
                  key={msg.id}
                  className="glass rounded-2xl border border-white/5 p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white">{msg.name}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(msg.status)}`}>
                          {getStatusLabel(msg.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{msg.email}</p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {new Date(msg.createdAt).toLocaleString("ar-EG")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {msg.status === "NEW" && (
                        <form action={handleMarkRead}>
                          <Button
                            type="submit"
                            variant="outline"
                            className="border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            تمت القراءة
                          </Button>
                        </form>
                      )}
                      {msg.status !== "REPLIED" && (
                        <form action={handleMarkReplied}>
                          <Button
                            type="submit"
                            variant="outline"
                            className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 text-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            تم الرد
                          </Button>
                        </form>
                      )}
                      <form action={handleDelete}>
                        <DeleteConfirmButton
                          message="هل أنت متأكد من حذف هذه الرسالة؟"
                          variant="outline"
                          className="border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          حذف
                        </DeleteConfirmButton>
                      </form>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-950/20 rounded-2xl border border-white/5">
            <p className="text-gray-400 text-sm">لا توجد رسائل بعد.</p>
          </div>
        )}
      </div>
    </div>
  );
}
