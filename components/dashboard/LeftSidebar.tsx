'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Truck,
  Boxes,
  Store,
  Users,
  CalendarCheck,
  BookOpen,
  PieChart,
  FileSpreadsheet,
  ChevronLeft,
  MoreVertical,
  LogOut,
  PhoneCall,
  X,
  Stethoscope,
  Navigation,
  Building2,
  Sun,
  Moon,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { PhotoUploader } from '@/components/ui/PhotoUploader';
import { erpStore } from '@/lib/erpStore';
import { Employee } from '@/types/erp';

interface LeftSidebarProps {
  onCloseMobile?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState<Employee>(erpStore.getCurrentUser());
  const [metrics, setMetrics] = useState(erpStore.getDashboardMetrics());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user.image_url || null);
  const [profilePhone, setProfilePhone] = useState(user.phone);

  useEffect(() => {
    const unsub = erpStore.subscribe(() => {
      setUser(erpStore.getCurrentUser());
      setMetrics(erpStore.getDashboardMetrics());
    });
    return unsub;
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    erpStore.updateEmployee(user.emp_id, {
      name: profileName,
      image_url: profilePhoto,
      phone: profilePhone,
    });
    setShowProfileModal(false);
  };

  const handleLogout = () => {
    router.push('/');
  };

  const navLinks = [
    { href: '/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard, badge: null },
    { href: '/dashboard/billing', label: t('nav_billing'), icon: Receipt, badge: mode === 'bn' ? 'চালান' : 'POS' },
    { href: '/dashboard/employees', label: mode === 'bn' ? 'কর্মী ও অবিক্রীত স্টক' : 'Staff & In-Hand Stock', icon: Users, badge: metrics.totalEmployeeHeldBoxes > 0 ? `${metrics.totalEmployeeHeldBoxes} ${mode === 'bn' ? 'বক্স' : 'box'}` : null },
    { href: '/dashboard/inventory', label: t('nav_inventory'), icon: Boxes, badge: (metrics.lowStockCount + metrics.expiringCount) > 0 ? (metrics.lowStockCount + metrics.expiringCount) : null },
    { href: '/dashboard/field', label: t('nav_field_app'), icon: Navigation, badge: mode === 'bn' ? 'অফিসার' : 'Field' },
    { href: '/dashboard/orders', label: t('nav_orders'), icon: Truck, badge: metrics.pendingOrdersCount > 0 ? metrics.pendingOrdersCount : null },
    { href: '/dashboard/doctors', label: t('nav_doctors'), icon: Stethoscope, badge: null },
    { href: '/dashboard/hr-payroll', label: t('nav_hr_payroll'), icon: CalendarCheck, badge: null },
    { href: '/dashboard/ledger', label: t('nav_ledger'), icon: BookOpen, badge: null },
    { href: '/dashboard/expenses', label: t('nav_expenses'), icon: PieChart, badge: null },
    { href: '/dashboard/reports', label: t('nav_reports'), icon: FileSpreadsheet, badge: mode === 'bn' ? 'এক্সেল' : 'Excel' },
    { href: '/dashboard/guide', label: mode === 'bn' ? 'ব্যবহার সহায়িকা' : 'User Guide', icon: HelpCircle, badge: mode === 'bn' ? 'গাইড' : 'PDF' },
  ];

  return (
    <>
      <aside className="w-64 h-screen bg-[#0b0c10] border-r border-[#252628] flex flex-col p-4 overflow-y-auto no-scrollbar select-none">
        {/* Header: Logo + Close */}
        <div className="shrink-0 flex items-center justify-between pb-3">
          <BrandLogo size="md" variant="badge" />
          {onCloseMobile ? (
            <button
              onClick={onCloseMobile}
              className="size-8 rounded-full grid place-items-center border border-[#252628] hover:bg-[#1b1c20] text-zinc-400 hover:text-white"
            >
              <X className="size-4" />
            </button>
          ) : (
            <div className="size-8 rounded-full grid place-items-center border border-[#252628] text-zinc-400 cursor-pointer hover:bg-[#1b1c20]">
              <ChevronLeft className="size-4" strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* User Profile Card */}
        <div
          onClick={() => setShowProfileModal(true)}
          className="shrink-0 bg-[#1b1c20] hover:bg-[#252628] cursor-pointer transition-colors flex items-center p-2.5 rounded-xl mt-2 border border-[#252628]"
        >
          <SmartAvatar
            imageUrl={user.image_url}
            name={user.name}
            size="md"
            ringColor={
              user.role === 'super_admin' || user.role === 'executor'
                ? 'border-amber-400'
                : 'border-[#fae0d1]'
            }
          />
          <div className="ml-2.5 overflow-hidden">
            <div className="font-semibold text-white text-xs truncate">{user.name}</div>
            <div className="text-[11px] text-[#7a7d82] truncate">
              {user.role === 'super_admin'
                ? (mode === 'bn' ? 'সুপার এডমিন' : 'Super Admin')
                : user.role === 'executor'
                ? (mode === 'bn' ? 'ম্যানেজিং ডিরেক্টর' : 'Managing Director')
                : user.designation}
            </div>
          </div>
          <MoreVertical className="size-4 ml-auto text-[#7a7d82] shrink-0" />
        </div>

        {/* Portal Switcher Pill */}
        <div className="shrink-0 grid grid-cols-2 gap-1 p-1 bg-[#15161c] border border-[#252628] rounded-xl mt-3 text-[11px] font-semibold">
          <Link
            href="/dashboard"
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors ${
              pathname !== '/dashboard/field'
                ? 'bg-[#35383d] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Building2 className={`size-3.5 ${pathname !== '/dashboard/field' ? 'text-[#fae0d1]' : 'text-zinc-400'}`} />
            <span>{mode === 'bn' ? 'হেড অফিস' : 'Head Office'}</span>
          </Link>

          <Link
            href="/dashboard/field"
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors ${
              pathname === '/dashboard/field'
                ? 'bg-[#35383d] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Navigation className={`size-3.5 ${pathname === '/dashboard/field' ? 'text-[#86759f]' : 'text-zinc-400'}`} />
            <span>{mode === 'bn' ? 'ফিল্ড অ্যাপ' : 'Field App'}</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="grow flex flex-col space-y-1 mt-3 py-2 border-t border-[#252628]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onCloseMobile}
                className={`flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#35383d] text-white shadow-sm'
                    : 'text-[#c0c4cd] hover:bg-[#1b1c20] hover:text-white'
                }`}
              >
                <Icon
                  className={`size-4 shrink-0 ${
                    isActive ? 'text-[#fae0d1]' : 'text-[#7a7d82]'
                  }`}
                />
                <span className="ml-2.5 truncate">{link.label}</span>
                {link.badge !== null && (
                  <span
                    className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                      typeof link.badge === 'number'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : link.badge === 'MPO'
                        ? 'bg-[#86759f] text-white'
                        : 'bg-[#fae0d1] text-black'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Language & Theme Controls: Designed for quick 1-tap operation */}
        <div className="shrink-0 space-y-2 pt-3 pb-2 border-t border-[#252628]">
          {/* Language Segmented Toggle */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium flex items-center space-x-1.5">
              <Globe className="size-3.5 text-zinc-400" />
              <span>{mode === 'bn' ? 'ভাষা' : 'Language'}</span>
            </span>
            <div className="inline-flex rounded-lg p-0.5 bg-[#15161c] border border-[#252628]">
              <button
                type="button"
                onClick={() => setMode('bn')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  mode === 'bn'
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setMode('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  mode === 'en'
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium flex items-center space-x-1.5">
              {theme === 'dark' ? <Moon className="size-3.5 text-zinc-400" /> : <Sun className="size-3.5 text-amber-500" />}
              <span>{mode === 'bn' ? 'থিম' : 'Theme'}</span>
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#15161c] hover:bg-[#252628] border border-[#252628] text-zinc-300 flex items-center space-x-1.5 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="size-3 text-purple-300" />
                  <span>{mode === 'bn' ? 'ডার্ক মোড' : 'Dark Mode'}</span>
                </>
              ) : (
                <>
                  <Sun className="size-3 text-amber-500" />
                  <span>{mode === 'bn' ? 'লাইট মোড' : 'Light Mode'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Support Card */}
        <div className="shrink-0 rounded-xl bg-gradient-to-br from-[#DFA896] via-[#B17ECE] to-[#EB9197] p-3 text-black shadow-md relative overflow-hidden mt-2">
          <div className="flex items-center space-x-2">
            <PhoneCall className="size-4 text-black" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {mode === 'bn' ? 'জরুরি সহায়তা' : 'Emergency Hotline'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-900 font-bold mt-1">
            01711-000001
          </p>
          <div className="mt-2 pt-1 border-t border-black/10 flex items-center justify-between text-[10px] font-semibold text-zinc-900">
            <span>{mode === 'bn' ? 'সার্বক্ষণিক সাপোর্ট' : 'Support Desk'}</span>
            <span className="text-emerald-950 bg-white/40 px-1.5 py-0.5 rounded">
              {mode === 'bn' ? 'চালু আছে' : 'Active'}
            </span>
          </div>
        </div>

        {/* Logout Link */}
        <button
          onClick={handleLogout}
          className="shrink-0 flex items-center justify-center space-x-2 mt-3 p-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="size-4" />
          <span>{mode === 'bn' ? 'লগআউট' : 'Log Out'}</span>
        </button>
      </aside>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1c20] border border-[#252628] rounded-xl max-w-sm w-full p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <h3 className="font-semibold text-base">{mode === 'bn' ? 'প্রোফাইল ও ছবি' : 'My Profile & Photo'}</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="py-4 space-y-4">
              <PhotoUploader
                currentImageUrl={profilePhoto}
                onImageSelected={(url) => setProfilePhoto(url)}
                label={mode === 'bn' ? 'প্রোফাইল ছবি' : 'Profile Photo'}
                type="person"
              />

              <div>
                <label className="text-xs text-zinc-400">{mode === 'bn' ? 'পুরো নাম' : 'Full Name'}</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">{mode === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}</label>
                <input
                  type="text"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-2.5 bg-zinc-900 rounded-lg text-xs text-zinc-400 space-y-1 border border-zinc-800">
                <div>ID: <strong className="text-white">{user.emp_id}</strong></div>
                <div>{mode === 'bn' ? 'পদবী' : 'Role'}: <strong className="text-emerald-400 uppercase">{user.role}</strong></div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs hover:bg-zinc-700"
                >
                  {mode === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 text-black font-semibold rounded-lg text-xs hover:bg-emerald-400"
                >
                  {mode === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
