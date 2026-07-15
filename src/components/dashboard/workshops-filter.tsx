"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkshopsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const query = searchParams.get("q") || "";
  const activeStatus = searchParams.get("status") || "ALL";

  const statuses = [
    { label: "الكل", value: "ALL" },
    { label: "مسجل", value: "REGISTERED" },
    { label: "تم الحضور", value: "ATTENDED" },
    { label: "ملغى", value: "CANCELLED" },
  ];

  // Helper to construct updated query URL params
  const updateParams = (newQuery: string, newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newQuery) {
      params.set("q", newQuery);
    } else {
      params.delete("q");
    }

    if (newStatus && newStatus !== "ALL") {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }

    startTransition(() => {
      router.push(`/dashboard/workshops?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-4 w-full" dir="rtl">
      
      {/* Search Input and Status Badges list */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="ابحث عن ورشة عمل مسجلة..."
            defaultValue={query}
            onChange={(e) => updateParams(e.target.value, activeStatus)}
            className="bg-white/5 border-white/10 text-white pr-10 pl-4 focus:border-neon-cyan focus:ring-neon-cyan placeholder-gray-600 text-right text-sm"
          />
          {isPending && (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-cyan animate-spin" />
          )}
        </div>

        {/* Status Filters Toggle Row */}
        <div className="flex flex-wrap items-center gap-1.5 justify-start md:justify-end">
          {statuses.map((status) => {
            const isSelected = activeStatus === status.value;
            return (
              <button
                key={status.value}
                onClick={() => updateParams(query, status.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan shadow-md shadow-neon-cyan/5"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                {status.label}
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}
