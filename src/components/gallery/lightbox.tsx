"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Play, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LightboxItem {
  id: string;
  type: "IMAGE" | "VIDEO";
  fileUrl: string;
  title: string;
}

interface LightboxProps {
  items: LightboxItem[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ items, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const activeItem = items[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  }, [items.length]);

  // Bind Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handlePrev(); // R-to-L for Arabic layout flow
      if (e.key === "ArrowLeft") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    // Lock scroll on background body
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleNext, handlePrev, onClose]);

  if (!activeItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/95 backdrop-blur-md select-none">
      
      {/* 1. Header controls */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 text-white" dir="rtl">
        <div className="space-y-0.5">
          <span className="text-sm font-bold block">{activeItem.title}</span>
          <span className="text-[10px] text-gray-400 block font-mono">
            {currentIndex + 1} من {items.length}
          </span>
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          className="w-10 h-10 rounded-full border-white/10 hover:bg-white/10 hover:border-white/20 text-white flex items-center justify-center cursor-pointer p-0 shrink-0"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* 2. Main Content viewport */}
      <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center p-4">
        
        {/* Previous Button (Right in Arabic RTL) */}
        <button
          onClick={handlePrev}
          className="absolute right-4 md:-right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors z-20 cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Content Render */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-black/40 relative group">
          {activeItem.type === "VIDEO" ? (
            <video
              key={activeItem.fileUrl}
              src={activeItem.fileUrl}
              controls
              autoPlay
              className="max-w-full max-h-full rounded-lg"
            />
          ) : (
            <img
              src={activeItem.fileUrl}
              alt={activeItem.title}
              className="max-w-full max-h-full object-contain rounded-lg pointer-events-none"
            />
          )}
        </div>

        {/* Next Button (Left in Arabic RTL) */}
        <button
          onClick={handleNext}
          className="absolute left-4 md:-left-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors z-20 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

      </div>

      {/* 3. Footer indicator thumb */}
      <div className="absolute bottom-6 flex justify-center gap-1.5 max-w-xl overflow-x-auto px-4 py-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
        {items.map((item, index) => {
          const isSelected = index === currentIndex;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`w-12 h-8 rounded-lg overflow-hidden shrink-0 border-2 transition-all relative ${
                isSelected ? "border-neon-cyan opacity-100 scale-105" : "border-transparent opacity-40 hover:opacity-75"
              }`}
            >
              {item.type === "VIDEO" ? (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center text-[10px] text-neon-cyan">
                  <Play className="w-3.5 h-3.5 fill-neon-cyan/20" />
                </div>
              ) : (
                <img
                  src={item.fileUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
