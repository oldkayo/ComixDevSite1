"use client";

import React, { useState, useEffect } from "react";
import { incrementCopyCount } from "@/actions/prompt";
import { Button } from "@/components/ui/button";
import { Clipboard, Check, CheckCircle2 } from "lucide-react";

interface PromptCopyButtonProps {
  promptId: string;
  content: string;
  className?: string;
}

export function PromptCopyButton({ promptId, content, className }: PromptCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click triggers

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setShowToast(true);

      // Call Server Action in the background to increment copy count
      incrementCopyCount(promptId);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  // Reset copied states after delay
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Hide toast after delay
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <>
      <Button
        onClick={handleCopy}
        type="button"
        variant="outline"
        className={`border-white/10 hover:border-neon-cyan/30 hover:bg-neon-cyan/5 text-gray-300 hover:text-neon-cyan text-xs font-semibold px-4 py-2 flex items-center gap-1.5 h-9 rounded-xl transition-all duration-200 cursor-pointer ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-neon-cyan" />
            <span>تم النسخ!</span>
          </>
        ) : (
          <>
            <Clipboard className="w-3.5 h-3.5 text-gray-400 group-hover:text-neon-cyan" />
            <span>نسخ البرومبت</span>
          </>
        )}
      </Button>

      {/* Custom Fading Toast Popup Alert */}
      {showToast && (
        <div 
          className="fixed bottom-6 right-6 left-6 md:left-auto md:w-80 bg-gray-900/95 backdrop-blur-xl border border-neon-cyan/20 px-4 py-3.5 rounded-xl shadow-xl shadow-neon-cyan/5 text-xs text-white z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 flex items-center justify-start gap-2.5"
          dir="rtl"
        >
          <div className="w-7 h-7 rounded-lg bg-neon-cyan/15 flex items-center justify-center text-neon-cyan shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-right">
            <span className="font-bold text-white block">تم النسخ بنجاح!</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Prompt copied successfully.</span>
          </div>
        </div>
      )}
    </>
  );
}
