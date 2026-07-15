"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { addCustomLink, updateCustomLink, deleteCustomLink } from "@/actions/linkhub";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Zap, 
  Cpu, 
  Award, 
  MessageSquare, 
  Phone, 
  Globe, 
  Calendar, 
  Users, 
  BookOpen, 
  Link as LinkIcon 
} from "lucide-react";
import * as LucideIcons from "lucide-react";

interface CustomLinkItem {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  isEnabled: boolean;
  displayOrder: number;
}

interface LinkHubCustomFormProps {
  initialLinks: CustomLinkItem[];
}

export function LinkHubCustomForm({ initialLinks }: LinkHubCustomFormProps) {
  const router = useRouter();

  // Create Mode state
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newIcon, setNewIcon] = useState("Link");
  const [newIsEnabled, setNewIsEnabled] = useState(true);
  const [newOrder, setNewOrder] = useState("0");
  const [adding, setAdding] = useState(false);

  // Edit Mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editIcon, setEditIcon] = useState("Link");
  const [editIsEnabled, setEditIsEnabled] = useState(true);
  const [editOrder, setEditOrder] = useState("0");
  const [updating, setUpdating] = useState(false);

  // Common UI State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const availableIcons = [
    { name: "رابط عام", key: "Link", icon: LinkIcon },
    { name: "برمجة / ذكاء اصطناعي", key: "Cpu", icon: Cpu },
    { name: "ورش عمل / طاقة", key: "Zap", icon: Zap },
    { name: "شهادات وموثوقية", key: "Award", icon: Award },
    { name: "محادثة / دعم", key: "MessageSquare", icon: MessageSquare },
    { name: "هاتف / واتساب", key: "Phone", icon: Phone },
    { name: "موقع ويب", key: "Globe", icon: Globe },
    { name: "مواعيد وفعاليات", key: "Calendar", icon: Calendar },
    { name: "مشاركين ومجتمعات", key: "Users", icon: Users },
    { name: "دورات ومقالات", key: "BookOpen", icon: BookOpen },
  ];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setStatus(null);

    const payload = {
      title: newTitle,
      url: newUrl,
      icon: newIcon,
      isEnabled: newIsEnabled,
      displayOrder: parseInt(newOrder) || 0,
    };

    try {
      const result = await addCustomLink(payload);
      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "تم إضافة الرابط المخصص بنجاح!" });
        setNewTitle("");
        setNewUrl("");
        setNewIcon("Link");
        setNewIsEnabled(true);
        setNewOrder("0");
        router.refresh();
      }
    } catch (err) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء إضافة الرابط." });
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (link: CustomLinkItem) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditIcon(link.icon || "Link");
    setEditIsEnabled(link.isEnabled);
    setEditOrder(String(link.displayOrder));
    setStatus(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id: string) => {
    setUpdating(true);
    setStatus(null);

    const payload = {
      title: editTitle,
      url: editUrl,
      icon: editIcon,
      isEnabled: editIsEnabled,
      displayOrder: parseInt(editOrder) || 0,
    };

    try {
      const result = await updateCustomLink(id, payload);
      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "تم تحديث الرابط بنجاح!" });
        setEditingId(null);
        router.refresh();
      }
    } catch (err) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء تحديث البيانات." });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الرابط المخصص نهائياً؟")) return;
    setDeletingId(id);
    setStatus(null);

    try {
      const result = await deleteCustomLink(id);
      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "تم حذف الرابط المخصص بنجاح!" });
        router.refresh();
      }
    } catch (err) {
      setStatus({ type: "error", message: "حدث خطأ غير متوقع أثناء حذف الرابط." });
    } finally {
      setDeletingId(null);
    }
  };

  const renderIconByKey = (iconKey: string | null) => {
    if (!iconKey) return <LinkIcon className="w-4 h-4" />;
    const IconComponent = (LucideIcons as any)[iconKey];
    if (!IconComponent) return <LinkIcon className="w-4 h-4" />;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      {status && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
          status.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {status.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* 1. Add Custom Link Form */}
      <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-neon-cyan" />
          إضافة رابط مخصص جديد (Custom Link)
        </h3>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Title */}
          <div className="space-y-1.5 md:col-span-3">
            <Label className="text-xs text-gray-400">عنوان الرابط</Label>
            <Input 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
              placeholder="مثال: سجل لورشة العمل القادمة 🚀"
              required
              className="bg-gray-900 border-white/10 text-white h-10 text-xs"
            />
          </div>

          {/* URL */}
          <div className="space-y-1.5 md:col-span-4">
            <Label className="text-xs text-gray-400">رابط التوجيه (URL)</Label>
            <Input 
              type="url"
              value={newUrl} 
              onChange={(e) => setNewUrl(e.target.value)} 
              placeholder="https://example.com/register"
              required
              className="bg-gray-900 border-white/10 text-white h-10 text-xs text-left"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs text-gray-400">أيقونة الرابط</Label>
            <select
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="bg-gray-900 border border-white/10 text-white rounded-md h-10 w-full px-2 text-xs outline-none focus:border-neon-cyan/50"
            >
              {availableIcons.map((i) => (
                <option key={i.key} value={i.key}>{i.name}</option>
              ))}
            </select>
          </div>

          {/* Order */}
          <div className="space-y-1.5 md:col-span-1">
            <Label className="text-xs text-gray-400">الترتيب</Label>
            <Input 
              type="number"
              min="0"
              value={newOrder} 
              onChange={(e) => setNewOrder(e.target.value)} 
              required
              className="bg-gray-900 border-white/10 text-white text-center h-10 text-xs"
            />
          </div>

          {/* Enabled Check */}
          <div className="flex flex-col items-center justify-center gap-1.5 md:col-span-1 pb-1">
            <Label className="text-xs text-gray-400">تفعيل</Label>
            <Switch checked={newIsEnabled} onCheckedChange={setNewIsEnabled} />
          </div>

          {/* Submit */}
          <div className="md:col-span-1">
            <Button 
              type="submit" 
              disabled={adding}
              className="bg-neon-cyan text-gray-950 font-bold hover:bg-neon-cyan/95 hover:shadow-lg hover:shadow-neon-cyan/15 w-full h-10"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Custom Links List Manager */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">الروابط المخصصة النشطة حالياً</h3>
        </div>

        {initialLinks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">لا توجد أي روابط مخصصة نشطة حالياً. قم بإضافة رابط أعلاه.</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-right text-gray-300">
              <thead className="bg-white/[0.02] text-xs font-semibold text-gray-400 border-b border-white/5">
                <tr>
                  <th className="px-6 py-3.5 w-16">أيقونة</th>
                  <th className="px-6 py-3.5">عنوان الزر</th>
                  <th className="px-6 py-3.5">رابط التوجيه</th>
                  <th className="px-6 py-3.5 text-center w-24">الترتيب</th>
                  <th className="px-6 py-3.5 text-center w-20">الحالة</th>
                  <th className="px-6 py-3.5 text-center w-28">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {initialLinks.map((link) => {
                  const isEditing = editingId === link.id;

                  return (
                    <tr key={link.id} className="hover:bg-white/[0.01] transition-colors">
                      {/* Icon */}
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <select
                            value={editIcon}
                            onChange={(e) => setEditIcon(e.target.value)}
                            className="bg-gray-900 border border-white/10 text-white rounded-md h-8 w-20 px-1 text-xs"
                          >
                            {availableIcons.map((i) => (
                              <option key={i.key} value={i.key}>{i.key}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex p-2 rounded-lg bg-white/5 border border-white/10 text-neon-cyan">
                            {renderIconByKey(link.icon)}
                          </span>
                        )}
                      </td>

                      {/* Title */}
                      <td className="px-6 py-4 font-bold text-white">
                        {isEditing ? (
                          <Input 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-gray-900 border-white/10 text-white text-xs h-8"
                          />
                        ) : (
                          link.title
                        )}
                      </td>

                      {/* URL */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <Input 
                            type="url"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="bg-gray-900 border-white/10 text-white text-xs h-8 text-left"
                          />
                        ) : (
                          <span className="text-gray-400 font-mono text-xs">{link.url}</span>
                        )}
                      </td>

                      {/* Display Order */}
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <Input 
                            type="number"
                            value={editOrder}
                            onChange={(e) => setEditOrder(e.target.value)}
                            className="bg-gray-900 border-white/10 text-white text-center text-xs h-8 w-16 mx-auto"
                          />
                        ) : (
                          link.displayOrder
                        )}
                      </td>

                      {/* Enabled Switch */}
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <Switch checked={editIsEnabled} onCheckedChange={setEditIsEnabled} />
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            link.isEnabled 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {link.isEnabled ? "نشط" : "معطل"}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              onClick={() => handleUpdate(link.id)}
                              disabled={updating}
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            >
                              {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              onClick={() => handleStartEdit(link)}
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(link.id)}
                              disabled={deletingId === link.id}
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            >
                              {deletingId === link.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
