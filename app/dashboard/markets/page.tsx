'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function MarketsRedirectPage() {
  const router = useRouter();
  const { mode } = useLanguage();

  useEffect(() => {
    // Automatically redirect to the staff & unsold stock management page
    const timer = setTimeout(() => {
      router.replace('/dashboard/employees');
    }, 400);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="bg-[#1b1c20] border border-[#252628] rounded-2xl max-w-md w-full p-6 text-center space-y-4">
        <div className="size-12 rounded-2xl bg-[#86759f]/20 border border-[#86759f]/30 mx-auto grid place-items-center text-[#86759f]">
          <Users className="size-6" />
        </div>
        <h2 className="text-base font-bold text-white">
          {mode === 'bn'
            ? 'কর্মী ও অবিক্রীত স্টক পাতায় পাঠানো হচ্ছে...'
            : 'Redirecting to Staff and Stock...'}
        </h2>
        <p className="text-xs text-zinc-400">
          {mode === 'bn'
            ? 'সিস্টেম সহজ করতে ফার্মেসি ও মার্কেটের জটিলতা সরিয়ে সরাসরি কর্মীদের কাছে থাকা অবিক্রীত ওষুধের হিসাব রাখা হচ্ছে।'
            : 'The system has been simplified to directly manage employee in-hand unsold stock.'}
        </p>
        <Link
          href="/dashboard/employees"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-[#0b0c10] font-bold text-xs rounded-xl shadow-md"
        >
          <span>{mode === 'bn' ? 'সরাসরি কর্মী তালিকায় যান' : 'Go to Staff Directory'}</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
