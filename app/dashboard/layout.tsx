'use client';

import React, { useState } from 'react';
import { LeftSidebar } from '@/components/dashboard/LeftSidebar';
import { RightSidebar } from '@/components/dashboard/RightSidebar';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';
import { QuickBillModal } from '@/components/dashboard/QuickBillModal';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Receipt, Bell, Menu, Sun, Moon, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [quickBillOpen, setQuickBillOpen] = useState(false);
  const { mode, toggleMode } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#c0c4cd] flex overflow-x-hidden transition-colors duration-200">
      {/* Desktop Left Sidebar (xl:flex hidden) */}
      <div className="hidden xl:block fixed left-0 inset-y-0 z-30">
        <LeftSidebar />
      </div>

      {/* Mobile Top Header (xl:hidden) */}
      <header className="xl:hidden fixed top-0 left-0 right-0 h-14 bg-[#15161c] border-b border-[#252628] flex items-center justify-between px-3 z-30 select-none shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg border border-[#252628] text-zinc-300 hover:text-white"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>
          <BrandLogo size="sm" variant="badge" />
        </div>

        {/* Mobile Quick Action Buttons: Language, Theme, Quick Bill & Alerts */}
        <div className="flex items-center space-x-1.5">
          {/* Quick Language Toggle */}
          <button
            onClick={toggleMode}
            className="px-2 py-1 rounded-lg bg-[#252628] text-xs font-bold text-emerald-400 border border-[#35383d] flex items-center space-x-1"
            title={mode === 'bn' ? 'ভাষা পরিবর্তন' : 'Switch Language'}
          >
            <Globe className="size-3" />
            <span>{mode === 'bn' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Quick Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-[#252628] text-zinc-300 hover:text-white border border-[#35383d]"
            title={mode === 'bn' ? 'থিম পরিবর্তন' : 'Toggle Theme'}
          >
            {theme === 'dark' ? <Moon className="size-4 text-purple-300" /> : <Sun className="size-4 text-amber-500" />}
          </button>

          {/* Make Bill */}
          <button
            onClick={() => setQuickBillOpen(true)}
            className="size-8 rounded-lg sidebar-right-selected grid place-items-center shadow-sm"
            title={mode === 'bn' ? 'নতুন চালান' : 'Make Bill'}
          >
            <Receipt className="size-4 text-black" />
          </button>

          {/* Activity Alerts */}
          <button
            onClick={() => setMobileRightOpen(true)}
            className="size-8 rounded-lg bg-zinc-800 border border-zinc-700 grid place-items-center text-zinc-300 hover:text-white"
            title={mode === 'bn' ? 'সতর্কতা' : 'Alerts'}
          >
            <Bell className="size-4" />
          </button>
        </div>
      </header>

      {/* Center Main Workspace */}
      <main className="grow xl:pl-64 xl:pr-72 pt-14 xl:pt-0 pb-20 xl:pb-6 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4">
          {children}
        </div>
      </main>

      {/* Desktop Right Sidebar (xl:block hidden) */}
      <div className="hidden xl:block fixed right-0 inset-y-0 z-30">
        <RightSidebar onOpenQuickBill={() => setQuickBillOpen(true)} />
      </div>

      {/* Mobile Slide-Over Left Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 h-full bg-[#0b0c10] shadow-2xl animate-fade-in">
            <LeftSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile Slide-Over Right Activity Sidebar */}
      {mobileRightOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileRightOpen(false)}
          />
          <div className="relative z-10 w-80 h-full bg-[#0b0c10] shadow-2xl animate-fade-in">
            <RightSidebar
              onOpenQuickBill={() => {
                setMobileRightOpen(false);
                setQuickBillOpen(true);
              }}
              onCloseMobile={() => setMobileRightOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar on Mobile */}
      <MobileBottomNav
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onOpenQuickBill={() => setQuickBillOpen(true)}
      />

      {/* Global Quick POS Bill Modal */}
      <QuickBillModal
        isOpen={quickBillOpen}
        onClose={() => setQuickBillOpen(false)}
      />
    </div>
  );
}
