'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  Building2,
  Navigation,
  ShieldCheck,
  Briefcase,
  UserCheck,
  Truck,
  X,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { erpStore } from '@/lib/erpStore';

export default function LoginPage() {
  const router = useRouter();
  const { mode, toggleMode, t } = useLanguage();

  const [selectedApp, setSelectedApp] = useState<'hq' | 'field'>('hq');
  const [identifier, setIdentifier] = useState('ADM-01');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Switch between Head Office Suite and Field Rep App
  const handleAppTabSwitch = (app: 'hq' | 'field') => {
    setSelectedApp(app);
    setErrorMsg('');
    if (app === 'hq') {
      setIdentifier('ADM-01');
      setPin('1234');
    } else {
      setIdentifier('EMP-001');
      setPin('1234');
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = erpStore.loginWithCredentials(identifier, pin);
      if (res.success && res.user) {
        erpStore.setActivePortal(selectedApp);
        if (selectedApp === 'field') {
          router.push('/dashboard/field');
        } else {
          router.push('/dashboard');
        }
      } else {
        setErrorMsg(
          mode === 'bn'
            ? 'আইডি বা পিন নম্বর সঠিক নয়। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
            : 'Invalid Employee ID or PIN. Please check and try again.'
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (empId: string, portal: 'hq' | 'field') => {
    const employees = erpStore.getEmployees();
    const target = employees.find((e) => e.emp_id === empId);
    if (target) {
      erpStore.setCurrentUser(target);
      erpStore.setActivePortal(portal);
      if (portal === 'field') {
        router.push('/dashboard/field');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#080710] flex items-center justify-center p-4 overflow-hidden font-poppins selection:bg-[#de9489] selection:text-black">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute w-[440px] h-[540px] pointer-events-none">
        <div
          className="absolute -top-[90px] -left-[90px] size-[240px] rounded-full blur-[4px] opacity-80"
          style={{
            background: 'linear-gradient(135deg, #1845ad, #23a2f6)',
          }}
        />
        <div
          className="absolute -bottom-[90px] -right-[60px] size-[240px] rounded-full blur-[4px] opacity-80"
          style={{
            background: 'linear-gradient(135deg, #ff512f, #f09819)',
          }}
        />
      </div>

      {/* Main Glass Login Container */}
      <div className="relative w-full max-w-[480px] bg-[#15161c]/90 backdrop-blur-xl border border-[#252628] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 sm:p-8 text-white z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <BrandLogo size="lg" variant="badge" showSubtitle={false} />
          <h1 className="text-xl sm:text-2xl font-bold text-center mt-3 tracking-tight text-white">
            {mode === 'bn' ? 'সেনাটিক্স ওয়েলনেস' : 'Senatix Wellness'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 text-center font-normal">
            {mode === 'bn'
              ? 'ওষুধ ডিস্ট্রিবিউশন ও বিক্রয় ব্যবস্থাপনা সিস্টেম'
              : 'Pharmaceutical Distribution & Sales Management System'}
          </p>
        </div>

        {/* Portal Selector */}
        <div className="mb-6 p-1 bg-[#0b0c10] border border-[#252628] rounded-xl grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => handleAppTabSwitch('hq')}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
              selectedApp === 'hq'
                ? 'bg-[#35383d] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className={`size-4 ${selectedApp === 'hq' ? 'text-[#fae0d1]' : 'text-zinc-400'}`} />
            <span>{mode === 'bn' ? 'হেড অফিস' : 'Head Office'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleAppTabSwitch('field')}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
              selectedApp === 'field'
                ? 'bg-[#35383d] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Navigation className={`size-4 ${selectedApp === 'field' ? 'text-[#86759f]' : 'text-zinc-400'}`} />
            <span>{mode === 'bn' ? 'ফিল্ড অ্যাপ' : 'Field App'}</span>
          </button>
        </div>

        {/* Portal Info */}
        <div className="mb-5 p-3 rounded-xl bg-[#1b1c20] border border-[#252628] text-xs">
          {selectedApp === 'hq' ? (
            <div className="flex items-start space-x-2.5">
              <ShieldCheck className="size-4 text-[#fae0d1] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-100">
                  {mode === 'bn' ? 'হেড অফিস ও ড্যাশবোর্ড' : 'Head Office & Management'}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {mode === 'bn'
                    ? 'গোডাউন স্টক, ফ্যাক্টরি চালান, বাকির খাতা ও পুরো ব্যবসার পরিচালনা।'
                    : 'Warehouse inventory, factory shipments, ledger and business controls.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-2.5">
              <Navigation className="size-4 text-[#86759f] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-100">
                  {mode === 'bn' ? 'ফিল্ড সেলস অ্যাপ' : 'Field Sales Rep App'}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {mode === 'bn'
                    ? 'আজকের বাজার রুট, দ্রুত চালান তৈরি, ডাক্তার ভিজিট ও নগদ টাকা জমা।'
                    : 'Territory route, quick invoice creation, doctor visits and cash collection.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-200 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              {mode === 'bn' ? 'কর্মী আইডি বা মোবাইল নম্বর' : 'Employee ID or Mobile'}
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={selectedApp === 'hq' ? 'ADM-01 or 01711000001' : 'EMP-001 or 01712000001'}
              className="w-full h-11 px-3.5 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              {mode === 'bn' ? 'পিন বা পাসওয়ার্ড' : 'PIN or Password'}
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full h-11 pl-3.5 pr-11 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                aria-label="Toggle PIN Visibility"
              >
                {showPin ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-5 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-sm rounded-xl transition-transform active:scale-[0.99] shadow-lg flex items-center justify-center space-x-2 disabled:opacity-75"
          >
            {isLoading ? (
              <span>{t('logging_in')}</span>
            ) : (
              <span>
                {selectedApp === 'hq'
                  ? (mode === 'bn' ? 'হেড অফিসে প্রবেশ করুন' : 'Enter Head Office')
                  : (mode === 'bn' ? 'ফিল্ড অ্যাপে প্রবেশ করুন' : 'Enter Field App')}
              </span>
            )}
          </button>
        </form>

        {/* Language & Help Pills */}
        <div className="flex items-center space-x-3 mt-5">
          <button
            type="button"
            onClick={toggleMode}
            className="flex-1 h-9 bg-[#1b1c20] hover:bg-[#252628] text-zinc-200 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 border border-[#252628] transition-colors"
          >
            <Globe className="size-3.5 text-[#fae0d1]" />
            <span>{mode === 'bn' ? 'বাংলা' : 'English'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex-1 h-9 bg-[#1b1c20] hover:bg-[#252628] text-zinc-200 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 border border-[#252628] transition-colors"
          >
            <HelpCircle className="size-3.5 text-[#de9489]" />
            <span>{mode === 'bn' ? 'সহায়তা' : 'Help Desk'}</span>
          </button>
        </div>

        {/* 1-Tap Role Presets */}
        <div className="mt-6 pt-4 border-t border-[#252628]">
          <p className="text-xs text-zinc-400 text-center uppercase tracking-wider mb-2.5 font-medium">
            {mode === 'bn' ? '১-ক্লিকে টেস্ট ডেমো অ্যাকাউন্ট' : '1-Click Demo Logins'}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {selectedApp === 'hq' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('ADM-01', 'hq')}
                  className="p-2 bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] rounded-xl text-zinc-200 text-left transition-colors flex items-center space-x-2"
                >
                  <ShieldCheck className="size-4 text-[#fae0d1] shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-white">{mode === 'bn' ? 'সুপার এডমিন' : 'Super Admin'}</div>
                    <div className="text-[10px] text-zinc-400">ADM-01 ({mode === 'bn' ? 'সামিন' : 'Samin'})</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('EXE-01', 'hq')}
                  className="p-2 bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] rounded-xl text-zinc-200 text-left transition-colors flex items-center space-x-2"
                >
                  <Briefcase className="size-4 text-[#de9489] shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-white">{mode === 'bn' ? 'ম্যানেজিং ডিরেক্টর' : 'Managing Director'}</div>
                    <div className="text-[10px] text-zinc-400">EXE-01 ({mode === 'bn' ? 'ডা. রফিকুল' : 'Dr. Rafiqul'})</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('STR-01', 'hq')}
                  className="p-2 bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] rounded-xl text-zinc-200 text-left transition-colors flex items-center space-x-2"
                >
                  <UserCheck className="size-4 text-[#86759f] shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-white">{mode === 'bn' ? 'স্টোর ইনচার্জ' : 'Store In-charge'}</div>
                    <div className="text-[10px] text-zinc-400">STR-01 ({mode === 'bn' ? 'গুদাম' : 'Godown'})</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('ACC-01', 'hq')}
                  className="p-2 bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] rounded-xl text-zinc-200 text-left transition-colors flex items-center space-x-2"
                >
                  <Building2 className="size-4 text-[#fae0d1] shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-white">{mode === 'bn' ? 'হিসাবরক্ষক' : 'Accountant'}</div>
                    <div className="text-[10px] text-zinc-400">ACC-01 ({mode === 'bn' ? 'অর্থ' : 'Finance'})</div>
                  </div>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('EMP-001', 'field')}
                  className="p-2 bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] rounded-xl text-zinc-200 text-left transition-colors flex items-center space-x-2"
                >
                  <Navigation className="size-4 text-[#fae0d1] shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-white">
                      {mode === 'bn' ? 'তানভীর (অফিসার)' : 'Tanvir (Officer)'}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      EMP-001 ({mode === 'bn' ? 'মিরপুর' : 'Mirpur'})
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('EMP-002', 'field')}
                  className="p-2 bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] rounded-xl text-zinc-200 text-left transition-colors flex items-center space-x-2"
                >
                  <Navigation className="size-4 text-[#de9489] shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-white">
                      {mode === 'bn' ? 'সাকিব (অফিসার)' : 'Shakib (Officer)'}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      EMP-002 ({mode === 'bn' ? 'ধানমন্ডি' : 'Dhanmondi'})
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('EMP-003', 'field')}
                  className="p-2 bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] rounded-xl text-zinc-200 text-left transition-colors flex items-center space-x-2"
                >
                  <Navigation className="size-4 text-[#86759f] shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-white">
                      {mode === 'bn' ? 'কামরুল (অফিসার)' : 'Kamrul (Officer)'}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      EMP-003 ({mode === 'bn' ? 'উত্তরা' : 'Uttara'})
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('DEL-01', 'field')}
                  className="p-2 bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] rounded-xl text-zinc-200 text-left transition-colors flex items-center space-x-2"
                >
                  <Truck className="size-4 text-amber-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-white">{mode === 'bn' ? 'ডেলিভারি স্টাফ' : 'Delivery Staff'}</div>
                    <div className="text-[10px] text-zinc-400">DEL-01 ({mode === 'bn' ? 'ভ্যান রুট' : 'Van Route'})</div>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#15161c] border border-[#252628] rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <div className="flex items-center space-x-2">
                <HelpCircle className="size-5 text-[#de9489]" />
                <h3 className="font-semibold text-base">{mode === 'bn' ? 'সহায়তা ডেস্ক' : 'Support Desk'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-zinc-300">
              <p>
                {mode === 'bn'
                  ? 'আইডি বা পিন নম্বর ভুলে গেলে অথবা নতুন কর্মীর রেজিস্ট্রেশনের জন্য হেড অফিসে যোগাযোগ করুন:'
                  : 'If you forgot your Employee ID/PIN or need assistance, contact Head Office:'}
              </p>
              <div className="p-3 bg-[#0b0c10] rounded-xl space-y-1.5 border border-[#252628]">
                <div className="text-[11px] text-zinc-400">{mode === 'bn' ? 'হটলাইন নম্বর:' : 'Head Office Hotline:'}</div>
                <div className="text-sm font-bold text-[#fae0d1]">01711-000001</div>
                <div className="text-[11px] text-zinc-400">01819-000002</div>
                <div className="text-[11px] text-zinc-400">support@senatix.com</div>
              </div>
              <p className="text-[11px] text-zinc-400">
                {mode === 'bn'
                  ? 'ডেমো অ্যাকাউন্টের ডিফল্ট পিন কোড: 1234'
                  : 'Default testing PIN code: 1234'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold rounded-xl text-xs transition-colors"
            >
              {mode === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
