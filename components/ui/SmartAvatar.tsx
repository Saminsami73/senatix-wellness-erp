'use client';

import React from 'react';
import { Pill, FlaskConical, Syringe, Package, LucideIcon } from 'lucide-react';

interface SmartAvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  type?: 'person' | 'product';
  category?: string;
  ringColor?: string; // Optional colored status ring (e.g. green for present, gold for admin)
  className?: string;
}

const colorPairs = [
  { bg: 'bg-emerald-900/60', text: 'text-emerald-300', border: 'border-emerald-600/40' },
  { bg: 'bg-blue-900/60', text: 'text-blue-300', border: 'border-blue-600/40' },
  { bg: 'bg-amber-900/60', text: 'text-amber-300', border: 'border-amber-600/40' },
  { bg: 'bg-purple-900/60', text: 'text-purple-300', border: 'border-purple-600/40' },
  { bg: 'bg-rose-900/60', text: 'text-rose-300', border: 'border-rose-600/40' },
  { bg: 'bg-teal-900/60', text: 'text-teal-300', border: 'border-teal-600/40' },
];

export const SmartAvatar: React.FC<SmartAvatarProps> = ({
  imageUrl,
  name,
  size = 'md',
  type = 'person',
  category = 'Tablet',
  ringColor,
  className = '',
}) => {
  const sizeMap = {
    xs: 'size-6 text-[10px]',
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-14 text-base',
    xl: 'size-16 text-lg',
    '2xl': 'size-20 text-xl',
  };

  const getInitials = (n: string) => {
    const parts = (n || '').trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'SX';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Deterministic color pair based on name hash
  const colorIndex = (name || '')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorPairs.length;
  const colors = colorPairs[colorIndex];

  const getProductIcon = (cat: string): LucideIcon => {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('syrup') || lower.includes('suspension')) return FlaskConical;
    if (lower.includes('injection') || lower.includes('drop')) return Syringe;
    if (lower.includes('supplement') || lower.includes('box')) return Package;
    return Pill;
  };

  const ProductIcon = getProductIcon(category);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${
        ringColor ? `p-0.5 rounded-full border-2 ${ringColor}` : ''
      } ${className}`}
    >
      <div
        className={`${sizeMap[size]} aspect-square overflow-hidden flex items-center justify-center font-semibold select-none shadow-sm ${
          type === 'person' ? 'rounded-full' : 'rounded-xl'
        } ${imageUrl ? 'bg-zinc-800' : `${colors.bg} ${colors.text} border ${colors.border}`}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              // Hide broken image and fallback to initials
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : type === 'person' ? (
          <span>{getInitials(name)}</span>
        ) : (
          <ProductIcon className="size-1/2 shrink-0" />
        )}
      </div>
    </div>
  );
};
