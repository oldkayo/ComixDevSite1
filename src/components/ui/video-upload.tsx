"use client";

import React, { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon, Film, Loader2, AlertCircle, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  placeholder?: string;
}

export function VideoUpload({
  value,
  onChange,
  disabled = false,
  accept = "video/mp4,video/webm,video/quicktime,video/x-msvideo",
  maxSizeMB = 50,
  label = "رفع فيديو",
  placeholder = "اختر فيديو أو اسحبه هنا",
}: VideoUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url">(value && !value.startsWith("blob:") ? "url" : "upload");
  const [urlInput, setUrlInput] = useState(value);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      
      // Validate file
      const validTypes = accept.split(",");
      const fileType = file.type;
      const isValidType = validTypes.some((type) => {
        if (type.endsWith("*")) {
          const baseType = type.slice(0, -1);
          return fileType.startsWith(baseType);
        }
        return fileType === type;
      });

      if (!isValidType) {
        setError(`نوع الملف غير مدعوم. يرجى استخدام: ${accept}`);
        return;
      }

      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(`حجم الملف كبير جداً. الحد الأقصى: ${maxSizeMB}MB`);
        return;
      }

      // Cloudinary upload
      setUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "comix_dev_preset");
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        setError("Cloudinary Cloud Name not configured");
        setUploading(false);
        return;
      }
      
      try {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });
        
        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
          xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
          
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };
          
          xhr.onerror = () => reject(new Error("Network error during upload"));
          
          xhr.send(formData);
        });
        
        onChange(result.secure_url);
        setUrlInput(result.secure_url);
        setMode("url");
        setError(null);
      } catch (err) {
        console.error("Upload error:", err);
        setError("فشل رفع الفيديو. يرجى المحاولة مرة أخرى أو استخدام رابط مباشر.");
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [accept, maxSizeMB, onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      
      if (disabled || uploading) return;
      
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [disabled, uploading, handleUpload]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleClear = useCallback(() => {
    onChange("");
    setUrlInput("");
    setMode("upload");
    setError(null);
  }, [onChange]);

  const handleUrlSubmit = useCallback(() => {
    onChange(urlInput);
    setError(null);
  }, [urlInput, onChange]);

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-[10px] font-semibold text-gray-400 block">
          {label}
        </label>
      )}
      
      {error && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] mb-2">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {value && (
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border border-white/10 mb-2">
          <video
            src={value}
            controls
            className="w-full h-full object-cover"
            onLoadedMetadata={() => setPreviewLoaded(true)}
          />
          
          {!previewLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />
            </div>
          )}
          
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-500/80 rounded-full transition-colors text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {!value || mode === "upload" ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full p-4 border-2 border-dashed rounded-lg transition-all ${
            dragOver
              ? "border-neon-cyan bg-neon-cyan/5"
              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            disabled={disabled || uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-2 w-full">
                <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
                <div className="w-full max-w-xs h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-blue transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-neon-cyan font-medium">
                  جاري الرفع... {uploadProgress}%
                </span>
              </div>
            ) : (
              <>
                <Film className="w-6 h-6 text-gray-400" />
                <div className="space-y-0.5">
                  <p className="text-[10px] text-gray-300 font-medium">
                    {placeholder}
                  </p>
                  <p className="text-[9px] text-gray-500">
                    أو انقر للاختيار
                  </p>
                </div>
                <div className="flex gap-1.5 mt-1">
                  <span className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] text-gray-500">
                    MP4
                  </span>
                  <span className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] text-gray-500">
                    WebM
                  </span>
                  <span className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] text-gray-500">
                    {maxSizeMB}MB
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        {mode === "upload" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMode("url")}
            disabled={disabled || uploading}
            className="flex-1 h-8 text-[10px] border-white/10 hover:bg-white/10 text-gray-400"
          >
            <LinkIcon className="w-3.5 h-3.5 ml-1.5" />
            استخدام رابط مباشر
          </Button>
        ) : (
          <div className="flex-1 flex items-center gap-1.5">
            <Input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onBlur={handleUrlSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUrlSubmit();
                }
              }}
              disabled={disabled}
              placeholder="أدخل رابط الفيديو..."
              className="h-8 text-[10px] bg-white/5 border-white/10 text-white"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMode("upload")}
              disabled={disabled}
              className="shrink-0 h-8 text-[10px] border-white/10 hover:bg-white/10 text-gray-400"
            >
              <Upload className="w-3.5 h-3.5 ml-1.5" />
              رفع من الجهاز
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
