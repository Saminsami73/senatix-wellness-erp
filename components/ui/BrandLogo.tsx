'use client';

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'filter' | 'plain';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'badge',
  showSubtitle = false,
}) => {
  const logoDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
  }[size];

  const textDimensions = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-9',
  }[size];

  return (
    <div className="flex items-center space-x-2 select-none">
      {/* 3D Metallic Emerald & Gold Monogram Logo */}
      <img
        src="/brand/Senatix_Wellness_logo_transparent.png"
        alt="Senatix Logo"
        className={`${logoDimensions} object-contain shrink-0 filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition-transform duration-200 active:scale-95`}
      />

      <div className="flex flex-col justify-center">
        {/* Contrast Fixed Stencil Wordmark */}
        {variant === 'badge' ? (
          <div className="bg-emerald-50/95 px-2 py-0.5 rounded-md flex items-center shadow-sm border border-emerald-200/50">
            <img
              src="/brand/Senatix_text_transparent.png"
              alt="senatix"
              className={`${textDimensions} object-contain`}
            />
          </div>
        ) : (
          <img
            src="/brand/Senatix_text_transparent.png"
            alt="senatix"
            className={`${textDimensions} object-contain brightness-150 contrast-125 drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]`}
          />
        )}

        {showSubtitle && (
          <span className="text-[10px] text-emerald-400 font-medium tracking-wider mt-0.5 uppercase">
            ঔষধ ও হেলথকেয়ার ডিস্ট্রিবিউশন
          </span>
        )}
      </div>
    </div>
  );
};
