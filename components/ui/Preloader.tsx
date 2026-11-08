'use client';

import React, { useEffect, useState } from 'react';

export const Preloader: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(10);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 600ms progress completion animation
    const progressTimer = setTimeout(() => {
      setProgress(100);
    }, 200);

    // Fade out at 650ms, remove from DOM at 800ms
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 600);

    const finishTimer = setTimeout(() => {
      setVisible(false);
    }, 800);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080710] transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ willChange: 'opacity' }}
    >
      <div className="flex flex-col items-center">
        {/* Logo Container with Emerald-Gold Pulse Ring */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-emerald-500/20 via-amber-500/15 to-teal-500/20 blur-md animate-pulse-subtle" />
          <div className="relative size-24 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 p-3 shadow-2xl flex items-center justify-center">
            <img
              src="/brand/Senatix_Wellness_logo_transparent.png"
              alt="Senatix Wellness"
              className="w-20 h-20 object-contain transform transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        {/* Brand Wordmark in Sleek Illuminated Badge */}
        <div className="bg-emerald-50/95 px-4 py-1.5 rounded-xl shadow-lg border border-emerald-300/40 mb-3 flex items-center justify-center">
          <img
            src="/brand/Senatix_text_transparent.png"
            alt="Senatix"
            className="h-8 object-contain"
          />
        </div>

        {/* Subtitle */}
        <p className="text-xs font-medium text-emerald-400 tracking-wider mb-6 text-center">
          SENATIX WELLNESS • ঔষধ ও হেলথকেয়ার ডিস্ট্রিবিউশন
        </p>

        {/* Progress Bar (Completes in 600ms) */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
