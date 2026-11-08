'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

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
  let theme = 'dark';
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
  } catch (e) {
    // Fallback if rendered outside ThemeContext
  }

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // In dark mode: inverted to pure crisp white letters on 100% transparent background
  // In light mode: preserved original rich petrol teal on 100% transparent background
  const isDark = mounted ? theme === 'dark' : true;

  return (
    <div className="flex items-center space-x-2 select-none">
      {/* 3D Metallic Emerald & Gold Monogram Logo */}
      <img
        src="/brand/Senatix_Wellness_logo_transparent.png"
        alt="Senatix Logo"
        className={`${logoDimensions} object-contain shrink-0 filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition-transform duration-200 active:scale-95`}
      />

      <div className="flex flex-col justify-center">
        {/* Transparent opposite-colored Wordmark */}
        <div className="flex items-center bg-transparent">
          <img
            src="/brand/Senatix_text_transparent.png"
            alt="senatix"
            className={`${textDimensions} object-contain transition-all duration-200`}
            style={{
              filter: isDark ? 'brightness(0) invert(1)' : 'none',
            }}
          />
        </div>

        {showSubtitle && (
          <span className="text-[10px] text-emerald-400 font-medium tracking-wider mt-0.5 uppercase">
            ঔষধ ও হেলথকেয়ার ডিস্ট্রিবিউশন
          </span>
        )}
      </div>
    </div>
  );
};
