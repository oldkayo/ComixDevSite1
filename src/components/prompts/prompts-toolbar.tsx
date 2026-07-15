"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, Loader2, SlidersHorizontal, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

interface PromptsToolbarProps {
  categories: Category[];
  tags: string[];
}

export function PromptsToolbar({ categories, tags }: PromptsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const query = searchParams.get("q") || "";
  const activeCategory = searchParams.get("cat") || "ALL";
  const activeTag = searchParams.get("tag") || "ALL";
  const sort = searchParams.get("sort") || "newest";

  // Helper to compile dynamic search parameters
  const updateParams = (newQuery: string, newCat: string, newTag: string, newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newQuery) params.set("q", newQuery);
    else params.delete("q");

    if (newCat && newCat !== "ALL") params.set("cat", newCat);
    else params.delete("cat");

    if (newTag && newTag !== "ALL") params.set("tag", newTag);
    else params.delete("tag");

    if (newSort && newSort !== "newest") params.set("sort", newSort);
    else params.delete("sort");

    startTransition(() => {
      router.push(`/prompts?${params.toString()}`);
    });
  };

  const sortOptions = [
    { label: "الأحدث", value: "newest" },
    { label: "الأكثر استخداماً", value: "popular" },
    { label: "الأبجدية", value: "alpha" },
  ];

  return (
    <div className="space-y-6 w-full text-right" dir="rtl">
      
      {/* 1. Main Search & Sort Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="ابحث عن برومبت معين..."
            defaultValue={query}
            onChange={(e) => updateParams(e.target.value, activeCategory, activeTag, sort)}
            className="bg-white/5 border-white/10 text-white pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan placeholder-gray-600 text-sm h-10 text-right"
          />
          {isPending && (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-cyan animate-spin" />
          )}
        </div>

        {/* Sort Select list */}
        <div className="flex items-center gap-2 justify-end">
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neon-cyan" />
            ترتيب حسب:
          </span>
          <select
            value={sort}
            onChange={(e) => updateParams(query, activeCategory, activeTag, e.target.value)}
            className="bg-gray-950 border border-white/10 text-gray-300 text-xs px-3 py-2 rounded-xl focus:border-neon-cyan focus:outline-none cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-950 text-gray-300">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* 2. Category Filters Toggle Cards */}
      <div className="space-y-2">
        <span className="text-xs text-gray-500 font-bold block">التصنيفات:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParams(query, "ALL", activeTag, sort)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer",
              activeCategory === "ALL"
                ? "bg-gradient-to-r from-neon-cyan to-neon-blue text-white border-transparent shadow-lg shadow-neon-cyan/10 font-bold"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
            )}
          >
            الكل
          </button>
          
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => updateParams(query, cat.slug, activeTag, sort)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "bg-gradient-to-r from-neon-cyan to-neon-blue text-white border-transparent shadow-lg shadow-neon-cyan/10 font-bold"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tags Filter Pills */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 justify-start text-xs text-gray-500 font-bold">
            <Tag className="w-3.5 h-3.5 text-neon-purple" />
            <span>الوسوم الشائعة:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => updateParams(query, activeCategory, "ALL", sort)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] border transition-colors cursor-pointer",
                activeTag === "ALL"
                  ? "bg-neon-purple/20 border-neon-purple text-neon-purple font-semibold"
                  : "bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10"
              )}
            >
              الكل
            </button>
            {tags.map((tag) => {
              const isSelected = activeTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => updateParams(query, activeCategory, tag, sort)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] border transition-colors cursor-pointer",
                    isSelected
                      ? "bg-neon-purple/20 border-neon-purple text-neon-purple font-semibold shadow-md shadow-neon-purple/5"
                      : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
