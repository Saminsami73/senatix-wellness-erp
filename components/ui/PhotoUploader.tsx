'use client';

import React, { useRef, useState } from 'react';
import { Camera, Trash2, Upload, Loader2 } from 'lucide-react';
import { compressImage } from '@/lib/imageCompressor';

interface PhotoUploaderProps {
  currentImageUrl?: string | null;
  onImageSelected: (dataUrl: string | null) => void;
  label?: string;
  type?: 'person' | 'product';
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  currentImageUrl,
  onImageSelected,
  label = 'Photo (Optional)',
  type = 'person',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [compressing, setCompressing] = useState(false);
  const [fileSizeKb, setFileSizeKb] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      const result = await compressImage(file, 400, 0.75);
      setPreview(result.dataUrl);
      setFileSizeKb(result.sizeKb);
      onImageSelected(result.dataUrl);
    } catch (err) {
      console.error('Compression failed:', err);
      alert('Failed to process image. Please try another photo.');
    } finally {
      setCompressing(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFileSizeKb(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageSelected(null);
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      <div className="flex items-center space-x-3">
        {/* Preview / Trigger Container */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative size-16 shrink-0 cursor-pointer overflow-hidden border-2 border-dashed border-zinc-700 hover:border-emerald-500 bg-zinc-900/80 transition-all flex items-center justify-center group ${
            type === 'person' ? 'rounded-full' : 'rounded-xl'
          }`}
          title="Click to choose or take photo"
        >
          {compressing ? (
            <Loader2 className="size-6 text-emerald-400 animate-spin" />
          ) : preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="size-6 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="size-4 text-white" />
          </div>
        </div>

        {/* Info & Action Buttons */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 rounded-md border border-zinc-700 flex items-center space-x-1"
            >
              <Upload className="size-3" />
              <span>{preview ? 'Change Photo' : 'Upload WebP'}</span>
            </button>

            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/30 rounded-md border border-rose-900/40"
                title="Remove photo"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>

          <p className="text-[11px] text-zinc-500">
            {fileSizeKb
              ? `Compressed to ~${fileSizeKb} KB WebP`
              : 'Auto-resizes to 400x400 WebP (<30KB)'}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
