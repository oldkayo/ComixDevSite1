import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getSEOSettings } from "@/lib/settings";
import Link from "next/link";
import { Terminal, Sparkles, Code, Palette, Share2, ClipboardList, Copy, Eye, Tag } from "lucide-react";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { PromptsToolbar } from "@/components/prompts/prompts-toolbar";
import { PromptCopyButton } from "@/components/prompts/prompt-card-actions";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOSettings("prompts");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: seo.ogImage ? { images: [seo.ogImage] } : undefined,
  };
}

interface PageProps {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    tag?: string;
    sort?: string;
  }>;
}

export default async function PromptsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const catFilter = resolvedParams.cat || "ALL";
  const tagFilter = resolvedParams.tag || "ALL";
  const sort = resolvedParams.sort || "newest";

  // 1. Fetch categories dynamically from database
  let categories: any[] = [];
  try {
    categories = await db.promptCategory.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to query prompt categories:", error);
  }

  // 2. Fetch all published unique tags dynamically
  let allTags: string[] = [];
  try {
    const allPublished = await db.prompt.findMany({
      where: { isPublished: true },
      select: { tags: true },
    });
    // Flatten and take unique tags
    allTags = Array.from(new Set(allPublished.flatMap((p) => p.tags)));
  } catch (error) {
    console.error("Failed to query unique tags:", error);
  }

  // 3. Build Prisma query filters and order
  let orderBy: any = { createdAt: "desc" };
  if (sort === "popular") {
    orderBy = { copyCount: "desc" };
  } else if (sort === "alpha") {
    orderBy = { title: "asc" };
  }

  let prompts: any[] = [];
  try {
    prompts = await db.prompt.findMany({
      where: {
        isPublished: true,
        category: catFilter !== "ALL" ? { slug: catFilter } : undefined,
        tags: tagFilter !== "ALL" ? { has: tagFilter } : undefined, // PostgreSQL scalar list filter
        OR: q
          ? [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: {
        category: true,
      },
      orderBy,
    });
  } catch (error) {
    console.error("Failed to query prompts:", error);
  }

  const defaultThumbnail = "/images/workshop_prompt.png";

  return (
    <div className="w-full py-12 md:py-20 min-h-screen relative overflow-hidden bg-gray-950">
      
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">
            مكتبة البرومبتات
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed text-center">
            مجموعة منسقة وعالية الأداء من الأوامر والتعليمات البرمجية المهيأة لمساعدتك على استخلاص أفضل النتائج من أدوات الـ AI في أعمالك اليومية.
          </p>
        </div>

        {/* Dynamic Filters Toolbar wrapped in Suspense */}
        <Suspense fallback={
          <div className="h-10 w-full bg-white/5 animate-pulse rounded-xl" />
        }>
          <PromptsToolbar categories={categories} tags={allTags} />
        </Suspense>

        {/* Prompts Grid */}
        {prompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {prompts.map((prompt) => (
              <div 
                key={prompt.id} 
                className="glass p-6 rounded-2xl flex flex-col justify-between space-y-4 border border-white/5 relative overflow-hidden group hover:border-neon-cyan/20 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/5 text-right"
                dir="rtl"
              >
                
                {/* Header categories */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-[10px] font-bold">
                    {prompt.category.name}
                  </span>
                  
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Copy className="w-3.5 h-3.5" />
                      {prompt.copyCount} نسخ
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {prompt.viewCount} مشاهدة
                    </span>
                  </div>
                </div>

                {/* Prompt Meta details */}
                <div className="space-y-2 flex-grow">
                  <h3 className="text-base font-bold text-white group-hover:text-neon-cyan transition-colors line-clamp-1">
                    {prompt.title}
                  </h3>
                  
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed line-clamp-3">
                    {prompt.description}
                  </p>

                  {/* Tags list inside Card */}
                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {prompt.tags.map((tag: string) => (
                        <span key={tag} className="text-[9px] text-neon-purple font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prompt Box Preview */}
                <div className="bg-gray-950 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap text-left" dir="ltr">
                  {prompt.content}
                </div>

                {/* Card CTA Buttons row */}
                <div className="border-t border-white/5 pt-4 flex items-center justify-between gap-3">
                  <Link
                    href={`/prompts/${prompt.slug}`}
                    className={buttonVariants({
                      variant: "outline",
                      className: "border-white/10 hover:bg-white/10 text-gray-300 text-xs px-3 h-9 rounded-xl",
                    })}
                  >
                    التفاصيل
                  </Link>

                  <PromptCopyButton promptId={prompt.id} content={prompt.content} />
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-950/20 rounded-xl border border-white/5 max-w-md mx-auto space-y-4">
            <Terminal className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-gray-400 text-sm">عذراً، لا توجد برومبتات حالياً تطابق معايير البحث والفلترة.</p>
          </div>
        )}

      </div>
    </div>
  );
}
