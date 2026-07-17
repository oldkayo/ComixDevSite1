'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, FileType } from 'lucide-react';
import { Button } from './button';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  accept = 'image/jpeg,image/png,image/webp,image/svg+xml',
  maxSizeMB = 10,
  label = 'رفع صورة',
  placeholder = 'اختر صورة أو اسحبها هنا'
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!accept.includes(file.type)) {
      return 'نوع الملف غير مدعوم';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `حجم الملف يزيد عن ${maxSizeMB} ميجابايت`;
    }
    return null;
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'comix_dev_preset');

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error('Cloudinary not configured');

    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
          resolve(response.secure_url);
        } else {
          reject(new Error(response.error?.message || 'Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.open('POST', url);
      xhr.send(formData);
    });
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return;

    const file = files[0];
    const error = validateFile(file);
    if (error) {
      console.error(error);
      return;
    }

    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [disabled, onChange]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold text-gray-400 block text-right">
          {label}
        </label>
      )}
      
      {value ? (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="h-8 w-8 p-0 border-white/10 hover:bg-white/10"
            >
              <ImageIcon className="w-4 h-4 text-gray-400" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange('')}
              disabled={disabled}
              className="h-8 w-8 p-0 border-white/10 hover:bg-red-500/10 hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-neon-cyan bg-neon-cyan/5'
              : 'border-white/10 hover:border-white/20 bg-white/5'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploading ? (
            <div className="space-y-3 text-center">
              <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
              <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">جاري الرفع... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="space-y-2 text-center">
              <div className="p-3 rounded-full bg-white/5 border border-white/10">
                <Upload className="w-6 h-6 text-neon-cyan" />
              </div>
              <p className="text-sm text-gray-400">{placeholder}</p>
              <p className="text-xs text-gray-600">
                {accept.split(',').map(t => t.split('/')[1].toUpperCase()).join(', ')} - max {maxSizeMB}MB
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled || uploading}
        className="hidden"
      />
    </div>
  );
}
