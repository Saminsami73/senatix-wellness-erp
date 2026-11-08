'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  ShieldCheck,
  Lock,
  Mail,
  X,
  PhoneCall,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { erpStore } from '@/lib/erpStore';

export default function LoginPage() {
  const router = useRouter();
  const { mode, toggleMode } = useLanguage();

  const [identifier, setIdentifier] = useState('senatixwellness@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg(
        mode === 'bn'
          ? 'অনুগ্রহ করে আপনার এডমিন আইডি বা ইমেইল লিখুন।'
          : 'Please enter your Admin ID or Email address.'
      );
      return;
    }

    if (!password.trim()) {
      setErrorMsg(
        mode === 'bn'
          ? 'অনুগ্রহ করে আপনার গোপন পাসওয়ার্ড লিখুন।'
          : 'Please enter your account password.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = erpStore.loginWithCredentials(identifier, password);
      if (res.success && res.user) {
        erpStore.setActivePortal('hq');
        router.push('/dashboard');
      } else {
        setErrorMsg(
          res.message ||
            (mode === 'bn'
              ? 'আইডি বা পাসওয়ার্ড সঠিক নয়। শুধুমাত্র অনুমোদিত এডমিন প্রবেশ করতে পারবেন।'
              : 'Invalid ID or Password. Authorized Admin personnel only.')
        );
      }
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          (mode === 'bn'
            ? 'লগইন করতে সমস্যা হচ্ছে। ইন্টারনেট ও পাসওয়ার্ড যাচাই করুন।'
            : 'Login failed. Please check your credentials and internet.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#080710] flex items-center justify-center p-4 sm:p-6 overflow-hidden font-poppins selection:bg-[#de9489] selection:text-black">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute w-[440px] h-[540px] pointer-events-none">
        <div
          className="absolute -top-[90px] -left-[90px] size-[240px] rounded-full blur-[4px] opacity-75"
          style={{
            background: 'linear-gradient(135deg, #1845ad, #23a2f6)',
          }}
        />
        <div
          className="absolute -bottom-[90px] -right-[60px] size-[240px] rounded-full blur-[4px] opacity-75"
          style={{
            background: 'linear-gradient(135deg, #ff512f, #f09819)',
          }}
        />
      </div>

      {/* Main Glass Login Card */}
      <div className="relative w-full max-w-[460px] bg-[#15161c]/95 backdrop-blur-xl border border-[#252628] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-6 sm:p-8 text-white z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-6 text-center">
          <BrandLogo size="lg" variant="badge" showSubtitle={false} />
          <h1 className="text-2xl font-bold text-white mt-3.5 tracking-tight">
            {mode === 'bn' ? 'সেনাটিক্স ওয়েলনেস' : 'Senatix Wellness'}
          </h1>
          <p className="text-xs text-zinc-300 mt-1 font-medium">
            {mode === 'bn'
              ? 'সেন্ট্রাল এডমিন ও ডিস্ট্রিবিউশন কন্ট্রোল'
              : 'Central Administration & Distribution ERP'}
          </p>
          <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
            <ShieldCheck className="size-3.5" />
            <span>{mode === 'bn' ? 'অনুমোদিত এডমিন সিকিউর পোর্টাল' : 'Authorized Admin Portal'}</span>
          </div>
        </div>

        {/* Informative Banner */}
        <div className="mb-5 p-3 rounded-2xl bg-[#1b1c20] border border-[#252628] text-xs">
          <div className="flex items-start space-x-2.5">
            <Building2 className="size-4 text-[#fae0d1] shrink-0 mt-0.5" />
            <p className="text-[12px] text-zinc-300 leading-relaxed">
              {mode === 'bn'
                ? 'ম্যানেজিং ডিরেক্টর ও এডমিন কর্মকর্তা এই পোর্টাল থেকে গোডাউন স্টক, কর্মীদের ইন-হ্যান্ড ওষুধ, বিক্রয় চালান ও ক্যাশ জমার হিসাব পরিচালনা করবেন।'
                : 'Executive management and administrators can manage warehouse inventory, field staff custody, sales invoicing, and cash collections here.'}
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-200 text-xs font-semibold leading-relaxed text-center">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              {mode === 'bn' ? 'এডমিন আইডি বা ইমেইল' : 'Admin ID or Email Address'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={mode === 'bn' ? 'যেমন: senatixwellness@gmail.com বা ADM-01' : 'e.g. senatixwellness@gmail.com or ADM-01'}
                className="w-full h-12 pl-10 pr-3.5 bg-[#0b0c10] border border-[#2e3036] focus:border-[#de9489] rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-all font-medium"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              {mode === 'bn' ? 'গোপন পাসওয়ার্ড' : 'Account Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-12 pl-10 pr-11 bg-[#0b0c10] border border-[#2e3036] focus:border-[#de9489] rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-all font-medium"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1.5 rounded-lg transition-colors"
                aria-label="Toggle Password Visibility"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-3 bg-gradient-to-r from-[#fae0d1] via-[#de9489] to-[#86759f] hover:brightness-110 text-[#0b0c10] font-bold text-sm sm:text-base rounded-xl transition-all active:scale-[0.99] shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <span className="font-semibold">{mode === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying credentials...'}</span>
            ) : (
              <span className="font-bold flex items-center justify-center space-x-2">
                <span>{mode === 'bn' ? 'সরাসরি ড্যাশবোর্ডে প্রবেশ করুন' : 'Sign In to ERP Dashboard'}</span>
                <CheckCircle2 className="size-4 text-[#0b0c10]" />
              </span>
            )}
          </button>
        </form>

        {/* Language & Help Pills */}
        <div className="flex items-center space-x-3 mt-6 pt-5 border-t border-[#252628]">
          <button
            type="button"
            onClick={toggleMode}
            className="flex-1 h-10 bg-[#1b1c20] hover:bg-[#252628] text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border border-[#252628] transition-colors"
          >
            <Globe className="size-4 text-[#fae0d1]" />
            <span>{mode === 'bn' ? 'English Language' : 'বাংলা সংস্করণ'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex-1 h-10 bg-[#1b1c20] hover:bg-[#252628] text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border border-[#252628] transition-colors"
          >
            <HelpCircle className="size-4 text-[#de9489]" />
            <span>{mode === 'bn' ? 'সাহায্য ও সাপোর্ট' : 'Admin Support'}</span>
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-5 text-center">
          <p className="text-[11px] text-zinc-500 font-medium">
            {mode === 'bn'
              ? 'নিরাপত্তা নির্দেশিকা: আপনার লগইন পাসওয়ার্ড অন্য কারো সাথে শেয়ার করবেন না।'
              : 'Security Notice: Never share administrative credentials with unauthorized staff.'}
          </p>
        </div>
      </div>

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#15161c] border border-[#252628] rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#252628]">
              <div className="flex items-center space-x-2">
                <HelpCircle className="size-5 text-[#de9489]" />
                <h3 className="font-bold text-base">{mode === 'bn' ? 'সহায়তা ও অফিস হেল্পলাইন' : 'Help & Office Helpline'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-zinc-300">
              <p className="leading-relaxed">
                {mode === 'bn'
                  ? 'পাসওয়ার্ড ভুলে গেলে অথবা নতুন এডমিন এক্সেসের জন্য সেনাটিক্স হেড অফিসে যোগাযোগ করুন:'
                  : 'If you forgot your password or need admin access credentials, contact the Senatix Head Office:'}
              </p>
              <div className="p-3.5 bg-[#0b0c10] rounded-2xl space-y-2 border border-[#252628]">
                <div className="flex items-center space-x-2 text-[#fae0d1]">
                  <PhoneCall className="size-4" />
                  <span className="font-bold text-sm">01711-000001</span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">senatixwellness@gmail.com</div>
                <div className="text-[11px] text-zinc-400">হাউজ #১২, রোড #০৪, ধানমন্ডি, ঢাকা</div>
              </div>
              <p className="text-[11px] text-zinc-400">
                {mode === 'bn'
                  ? 'অনুমোদিত এডমিন পাসওয়ার্ড: Senatix1234@'
                  : 'Official Admin Password: Senatix1234@'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full h-11 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold rounded-xl text-xs transition-colors"
            >
              {mode === 'bn' ? 'ঠিক আছে' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
