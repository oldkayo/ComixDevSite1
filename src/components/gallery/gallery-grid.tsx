"use client";

import React, { useState } from "react";
import { Lightbox } from "./lightbox";
import { Play, Eye, Film } from "lucide-react";

interface GalleryItem {
  id: string;
  type: "IMAGE" | "VIDEO";
  fileUrl: string;
  title: string;
  thumbnail?: string | null;
  event: {
    title: string;
  };
}

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {items.map((item, index) => {
          const isVideo = item.type === "VIDEO";

          return (
            <div
              key={item.id}
              onClick={() => setSelectedIdx(index)}
              className="break-inside-avoid glass rounded-2xl overflow-hidden border border-white/5 relative group cursor-pointer hover:border-neon-cyan/20 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/5 text-right flex flex-col"
            >
              
              {/* Media Container */}
              <div className="relative w-full overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
                {isVideo ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Render a placeholder or static video frame */}
                    <div className="absolute inset-0 bg-gray-950/40 flex items-center justify-center z-10">
                      <div className="w-12 h-12 rounded-full bg-neon-cyan/90 text-gray-950 flex items-center justify-center shadow-lg shadow-neon-cyan/25 group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-gray-950" />
                      </div>
                    </div>
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-950 flex items-center justify-center text-gray-700">
                        <Film className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                ) : (
                  <img
                    src={item.fileUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}

                {/* Hover overlay details */}
                <div className="absolute inset-0 bg-gray-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 z-20">
                  <span className="text-[10px] text-neon-cyan font-bold tracking-wide uppercase">
                    {item.event.title}
                  </span>
                  <h3 className="text-white text-sm font-extrabold mt-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                    <Eye className="w-3.5 h-3.5" />
                    <span>انقر للمشاهدة والتكبير</span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Lightbox Trigger */}
      {selectedIdx !== null && (
        <Lightbox
          items={items.map((item) => ({
            id: item.id,
            type: item.type,
            fileUrl: item.fileUrl,
            title: item.title,
          }))}
          initialIndex={selectedIdx}
          onClose={() => setSelectedIdx(null)}
        />
      )}
    </>
  );
}
