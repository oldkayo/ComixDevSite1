"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className="flex items-center gap-1.5 border-white/10 bg-white/5 text-gray-300 hover:bg-neon-cyan/20 hover:text-white hover:border-neon-cyan/30 transition-all duration-200"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs">تم النسخ!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span className="text-xs">نسخ الأمر</span>
        </>
      )}
    </Button>
  );
}
