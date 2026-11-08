'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Navigation, Receipt, Users, Menu } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface MobileBottomNavProps {
  onOpenMobileMenu: () => void;
  onOpenQuickBill: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenMobileMenu,
  onOpenQuickBill,
}) => {
  const pathname = usePathname();
  const { mode } = useLanguage();

  const navItems = [
    { href: '/dashboard', label: mode === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/employees', label: mode === 'bn' ? 'কর্মী ও স্টক' : 'Staff Stock', icon: Users },
    { href: '/dashboard/billing', label: mode === 'bn' ? 'নতুন চালান' : 'Make Bill', icon: Receipt },
    { href: '/dashboard/field', label: mode === 'bn' ? 'ফিল্ড অ্যাপ' : 'Field App', icon: Navigation },
  ];

  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#15161c]/95 dark:bg-[#15161c]/95 bg-white/95 backdrop-blur-md border-t border-[#252628] dark:border-[#252628] border-slate-200 flex items-center justify-around px-2 z-40 select-none shadow-lg">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors ${
              isActive
                ? 'text-[#fae0d1] dark:text-[#fae0d1] text-emerald-600 font-bold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Icon className="size-5" />
            <span className="text-[11px] font-medium mt-0.5 truncate">{item.label}</span>
          </Link>
        );
      })}

      {/* Menu / More Button */}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center w-16 h-12 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <Menu className="size-5" />
        <span className="text-[11px] font-medium mt-0.5">{mode === 'bn' ? 'সব মেনু' : 'All Menus'}</span>
      </button>
    </nav>
  );
};
