import React from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Terminal, Award, Tag, Sparkles, Copy, Eye, Calendar } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PromptCopyButton } from "@/components/prompts/prompt-card-actions";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PromptDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let prompt: any = null;
  try {
    // 1. Fetch prompt and increment viewCount inside query transaction
    prompt = await db.prompt.update({
      where: { slug },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      include: {
        category: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch and increment view count for prompt:", error);
    
    // Fallback: try querying without incrementing if database update fails
    try {
      prompt = await db.prompt.findUnique({
        where: { slug },
        include: { category: true },
      });
    } catch (e) {
      console.error("Critical prompt retrieval error:", e);
    }
  }

  if (!prompt || !prompt.isPublished) {
    return (
      <div className="w-full py-12 min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center py-20 bg-gray-950/20 rounded-xl border border-white/5 max-w-md mx-auto space-y-4">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 inline-flex">
            <Terminal className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">البرومبت غير موجود أو تم حذفه</h2>
          <p className="text-sm text-gray-400">
            لا توجد برومبت بهذا الرابط أو قد تم إيقاف نشره.
          </p>
          <Link
            href="/prompts"
            className={buttonVariants({
              className:
                "bg-gradient-to-r from-neon-cyan to-neon-blue text-white text-sm px-4 h-9",
            })}
          >
            العودة إلى مكتبة البرومبتات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 md:py-20 min-h-screen relative overflow-hidden bg-gray-950 text-right" dir="rtl">
      
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-3xl space-y-8 relative z-10">
        
        {/* Navigation back */}
        <Link 
          href="/prompts" 
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          العودة لمكتبة البرومبتات
        </Link>

        {/* Prompt Detailed Card */}
        <div className="glass p-6 md:p-10 rounded-3xl border border-white/5 shadow-2xl space-y-8 relative overflow-hidden">
          
          {/* Accent corners */}
          <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-neon-cyan rounded-tr-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-neon-purple rounded-bl-3xl pointer-events-none" />

          {/* Header row metadata */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
            
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs font-bold font-mono">
                {prompt.category.name}
              </span>
              <h1 className="text-xl md:text-3xl font-extrabold text-white leading-tight">
                {prompt.title}
              </h1>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400 md:self-end font-mono">
              <span className="flex items-center gap-1">
                <Copy className="w-4 h-4 text-neon-cyan" />
                {prompt.copyCount} نسخ
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-neon-purple" />
                {prompt.viewCount} مشاهدة
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                {new Date(prompt.createdAt).toLocaleDateString("ar-EG")}
              </span>
            </div>

          </div>

          {/* Prompt Description */}
          <div className="space-y-2">
            <span className="text-xs text-gray-500 font-bold block">الوصف والاستخدام:</span>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              {prompt.description}
            </p>
          </div>

          {/* Tags List */}
          {prompt.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-gray-500 font-bold block">الوسوم:</span>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag: string) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/5 text-neon-purple font-mono"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Prompt Code Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <PromptCopyButton promptId={prompt.id} content={prompt.content} />
              <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                <Terminal className="w-4 h-4 text-neon-cyan" />
                البرومبت الكامل للنسخ:
              </span>
            </div>

            <div className="relative group rounded-2xl border border-white/10 bg-gray-950 p-6 font-mono text-xs md:text-sm text-gray-200 text-left select-all leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto" dir="ltr">
              {prompt.content}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
