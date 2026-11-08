'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Printer,
  Download,
  Building2,
  Navigation,
  CheckCircle2,
  Users,
  Receipt,
  Boxes,
  Stethoscope,
  PieChart,
  CalendarCheck,
  FileSpreadsheet,
  ShieldCheck,
  Phone,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function GuidePage() {
  const { mode } = useLanguage();
  const [guideLang, setGuideLang] = useState<'bn' | 'en'>(mode);

  const isBn = guideLang === 'bn';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header Bar & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#252628] print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <div className="size-8 rounded-lg bg-[#fae0d1]/10 text-[#fae0d1] grid place-items-center">
              <BookOpen className="size-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isBn ? 'ব্যবহার নির্দেশিকা ও সহায়িকা' : 'User Walkthrough & Operating Guide'}
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {isBn
              ? 'কোম্পানি পরিচালনা, গোডাউন ইনভেন্টরি, ফিল্ড সেলস ও ক্লাউড ডাটাবেজ সহায়িকা।'
              : 'Complete instructions for godown stock, field sales app, and cloud database.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Language Toggle */}
          <div className="flex items-center bg-[#15161c] border border-[#252628] rounded-xl p-1">
            <button
              onClick={() => setGuideLang('bn')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isBn ? 'bg-[#35383d] text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              বাংলা গাইড
            </button>
            <button
              onClick={() => setGuideLang('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isBn ? 'bg-[#35383d] text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              English Guide
            </button>
          </div>

          {/* 1-Click Print / PDF Save */}
          <button
            onClick={handlePrint}
            className="h-9 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center space-x-1.5 border border-zinc-700 transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="size-3.5 text-emerald-400" />
            <span>{isBn ? 'প্রিন্ট / PDF সেভ' : 'Print / Save PDF'}</span>
          </button>

          {/* Download Official PDF */}
          <a
            href="/docs/Senatix_ERP_Walkthrough_Guide_English.pdf"
            download="Senatix_ERP_Walkthrough_Guide_English.pdf"
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-zinc-100 text-[#0b0c10] text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-transform active:scale-95"
          >
            <Download className="size-3.5 text-black" />
            <span>{isBn ? 'ইংরেজি PDF ডাউনলোড' : 'Download English PDF'}</span>
          </a>
        </div>
      </div>

      {/* Main Printable Document Card */}
      <div className="bg-[#15161c] border border-[#252628] rounded-2xl p-5 sm:p-8 space-y-8 text-zinc-300 print:bg-white print:text-black print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-[#252628] print:border-slate-300 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#de9489] print:text-emerald-700">
                {isBn ? 'সেনাটিক্স ওয়েলনেস লিমিটেড' : 'Senatix Wellness Ltd.'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white print:text-black mt-1">
                {isBn
                  ? 'সহজ ও স্পষ্ট পরিচালন সহায়িকা'
                  : 'Official Beginner Walkthrough & Operating Guide'}
              </h2>
            </div>
            <div className="text-right text-xs text-zinc-400 print:text-slate-500">
              <div>Version 2.0</div>
              <div>{new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <p className="text-xs text-zinc-400 print:text-slate-600 mt-2">
            {isBn
              ? 'এই সহায়িকাটি ৫০+ বয়সের যেকোনো অ-কারিগরি মালিক বা নতুন কর্মীর জন্য সহজে ব্যবহারের উদ্দেশ্যে তৈরি।'
              : 'Designed for non-technical company owners and staff for clear, step-by-step daily operations.'}
          </p>
        </div>

        {/* SECTION 1: SYSTEM OVERVIEW & TWO PORTALS */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white print:text-black flex items-center space-x-2">
            <span className="size-6 rounded-md bg-[#fae0d1]/20 text-[#fae0d1] print:bg-slate-200 print:text-black grid place-items-center text-xs">
              ১
            </span>
            <span>{isBn ? '১. সিস্টেম পরিচিতি ও দুইটি মূল পর্দা' : '1. System Overview & Dual Portals'}</span>
          </h3>

          <p className="text-xs sm:text-sm text-zinc-300 print:text-slate-700 leading-relaxed">
            {isBn
              ? 'সেনাটিক্স ওয়েলনেস সিস্টেমে জটিলতা দূর করতে পুরো কার্যক্রমকে দুইটি স্পষ্ট অংশে ভাগ করা হয়েছে:'
              : 'Senatix Wellness divides operations into two distinct views to keep daily tasks simple:'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-4 bg-[#0b0c10] border border-[#252628] rounded-xl print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center space-x-2 text-white print:text-black font-semibold text-xs sm:text-sm">
                <Building2 className="size-4 text-[#fae0d1]" />
                <span>{isBn ? 'হেড অফিস ও ড্যাশবোর্ড (কম্পিউটার)' : 'Head Office Portal (Desktop/Laptop)'}</span>
              </div>
              <p className="text-xs text-zinc-400 print:text-slate-600 mt-2 leading-relaxed">
                {isBn
                  ? 'মালিক, ডিরেক্টর, স্টোরকিপার ও হিসাবরক্ষকদের জন্য। এখানে প্রধান গুদামের ওষুধ, ফ্যাক্টরি চালান, কর্মীদের মজুত, বাকি খাতা, লাভ-ক্ষতি ও মাসিক বেতন নিয়ন্ত্রণ করা হয়।'
                  : 'For owners, directors, storekeepers, and accountants. Controls warehouse stock, factory receipts, employee allocations, ledger, expenses, and payroll.'}
              </p>
            </div>

            <div className="p-4 bg-[#0b0c10] border border-[#252628] rounded-xl print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center space-x-2 text-white print:text-black font-semibold text-xs sm:text-sm">
                <Navigation className="size-4 text-[#86759f]" />
                <span>{isBn ? 'মাঠপর্যায়ের ফিল্ড অ্যাপ (মোবাইল)' : 'Field Sales App (Mobile Phones)'}</span>
              </div>
              <p className="text-xs text-zinc-400 print:text-slate-600 mt-2 leading-relaxed">
                {isBn
                  ? 'ফিল্ড অফিসার ও ডেলিভারি কর্মীদের জন্য সহজ পর্দা। কর্মী নিজের ব্যাগে থাকা ওষুধ দেখতে পারেন, দোকানে ওষুধ দিয়ে ১-ক্লিকে বিক্রয় রসিদ তৈরি করতে পারেন এবং নগদ ক্যাশ ট্র্যাক করতে পারেন।'
                  : 'A streamlined mobile view for field sales reps. Officers see what unsold boxes they carry, generate instant customer bills, and record cash collections.'}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: DEFAULT LOGIN ACCOUNTS */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white print:text-black flex items-center space-x-2">
            <span className="size-6 rounded-md bg-[#de9489]/20 text-[#de9489] print:bg-slate-200 print:text-black grid place-items-center text-xs">
              ২
            </span>
            <span>{isBn ? '২. প্রস্তুতকৃত লগইন অ্যাকাউন্ট ও পিন নম্বর' : '2. Default Login Accounts & PIN'}</span>
          </h3>

          <p className="text-xs text-zinc-400 print:text-slate-600">
            {isBn
              ? 'সিস্টেমে সকল পদের জন্য ইতিমধ্যে তৈরি আইডি ও পিন রয়েছে। লগইন স্ক্রিনে শুধু আইডি ও পিন লিখুন:'
              : 'The system includes preconfigured accounts for all roles. Enter the ID and PIN on the login screen:'}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#252628] print:border-slate-300 rounded-xl overflow-hidden">
              <thead className="bg-[#0b0c10] print:bg-slate-100 text-zinc-300 print:text-black border-b border-[#252628] print:border-slate-300 font-semibold">
                <tr>
                  <th className="p-2.5">{isBn ? 'পদবী' : 'Role'}</th>
                  <th className="p-2.5">{isBn ? 'আইডি' : 'User ID'}</th>
                  <th className="p-2.5">{isBn ? 'ডিফল্ট পিন' : 'PIN'}</th>
                  <th className="p-2.5">{isBn ? 'কাজের দায়িত্ব' : 'Responsibilities'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252628] print:divide-slate-200">
                <tr className="hover:bg-white/5 print:hover:bg-transparent">
                  <td className="p-2.5 font-semibold text-white print:text-black">{isBn ? 'সুপার এডমিন (মালিক)' : 'Super Admin (Owner)'}</td>
                  <td className="p-2.5 font-mono text-amber-300 print:text-black font-bold">ADM-01</td>
                  <td className="p-2.5 font-mono">1234</td>
                  <td className="p-2.5 text-zinc-400 print:text-slate-600">{isBn ? 'সম্পূর্ণ কোম্পানি নিয়ন্ত্রণ ও রিপোর্ট' : 'Full company controls and reports'}</td>
                </tr>
                <tr className="hover:bg-white/5 print:hover:bg-transparent">
                  <td className="p-2.5 font-semibold text-white print:text-black">{isBn ? 'ম্যানেজিং ডিরেক্টর' : 'Managing Director'}</td>
                  <td className="p-2.5 font-mono text-amber-300 print:text-black font-bold">EXE-01</td>
                  <td className="p-2.5 font-mono">1234</td>
                  <td className="p-2.5 text-zinc-400 print:text-slate-600">{isBn ? 'ব্যবসায়িক সারসংক্ষেপ ও লাভ-ক্ষতি' : 'Executive profit summary'}</td>
                </tr>
                <tr className="hover:bg-white/5 print:hover:bg-transparent">
                  <td className="p-2.5 font-semibold text-white print:text-black">{isBn ? 'স্টোর ইনচার্জ (গুদাম)' : 'Store In-charge'}</td>
                  <td className="p-2.5 font-mono text-amber-300 print:text-black font-bold">STR-01</td>
                  <td className="p-2.5 font-mono">1234</td>
                  <td className="p-2.5 text-zinc-400 print:text-slate-600">{isBn ? 'গুদাম ইনভেন্টরি, ফ্যাক্টরি চালান ও মেয়াদ' : 'Godown inventory, factory GRN, expiry'}</td>
                </tr>
                <tr className="hover:bg-white/5 print:hover:bg-transparent">
                  <td className="p-2.5 font-semibold text-white print:text-black">{isBn ? 'হিসাবরক্ষক (অর্থ)' : 'Senior Accountant'}</td>
                  <td className="p-2.5 font-mono text-amber-300 print:text-black font-bold">ACC-01</td>
                  <td className="p-2.5 font-mono">1234</td>
                  <td className="p-2.5 text-zinc-400 print:text-slate-600">{isBn ? 'জমা-বাকি খাতা, খরচ ও বেতন' : 'Ledger, expenses, payroll'}</td>
                </tr>
                <tr className="hover:bg-white/5 print:hover:bg-transparent">
                  <td className="p-2.5 font-semibold text-white print:text-black">{isBn ? 'সেলস অফিসার (মিরপুর)' : 'Sales Officer (Mirpur)'}</td>
                  <td className="p-2.5 font-mono text-emerald-400 print:text-black font-bold">EMP-001</td>
                  <td className="p-2.5 font-mono">1234</td>
                  <td className="p-2.5 text-zinc-400 print:text-slate-600">{isBn ? 'মোবাইল ফিল্ড অ্যাপ, সরাসরি বিক্রয় চালান' : 'Field mobile app, in-hand stock sales'}</td>
                </tr>
                <tr className="hover:bg-white/5 print:hover:bg-transparent">
                  <td className="p-2.5 font-semibold text-white print:text-black">{isBn ? 'সেলস অফিসার (ধানমন্ডি)' : 'Sales Officer (Dhanmondi)'}</td>
                  <td className="p-2.5 font-mono text-emerald-400 print:text-black font-bold">EMP-002</td>
                  <td className="p-2.5 font-mono">1234</td>
                  <td className="p-2.5 text-zinc-400 print:text-slate-600">{isBn ? 'মোবাইল ফিল্ড অ্যাপ, সরাসরি বিক্রয় চালান' : 'Field mobile app, in-hand stock sales'}</td>
                </tr>
                <tr className="hover:bg-white/5 print:hover:bg-transparent">
                  <td className="p-2.5 font-semibold text-white print:text-black">{isBn ? 'ডেলিভারি স্টাফ' : 'Delivery Staff'}</td>
                  <td className="p-2.5 font-mono text-emerald-400 print:text-black font-bold">DEL-01</td>
                  <td className="p-2.5 font-mono">1234</td>
                  <td className="p-2.5 text-zinc-400 print:text-slate-600">{isBn ? 'ভ্যান ডেলিভারি ও মালামাল স্থানান্তর' : 'Van deliveries and stock handovers'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: DAILY OPERATING WORKFLOWS */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white print:text-black flex items-center space-x-2">
            <span className="size-6 rounded-md bg-[#86759f]/20 text-[#86759f] print:bg-slate-200 print:text-black grid place-items-center text-xs">
              ৩
            </span>
            <span>{isBn ? '৩. প্রতিদিনের মূল কাজের সহজ নিয়ম' : '3. Core Daily Operating Steps'}</span>
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            {/* Step 1 */}
            <div className="p-4 bg-[#0b0c10] border border-[#252628] rounded-xl print:bg-slate-50 print:border-slate-200">
              <div className="font-bold text-white print:text-black flex items-center space-x-2">
                <Boxes className="size-4 text-blue-400" />
                <span>{isBn ? 'ধাপ ১: ফ্যাক্টরি থেকে নতুন ওষুধ গ্রহণ' : 'Step 1: Receiving New Stock from Factory'}</span>
              </div>
              <p className="text-xs text-zinc-400 print:text-slate-600 mt-1.5 leading-relaxed">
                {isBn
                  ? 'গুদামে ওষুধ আসলে বাম পাশের মেনু থেকে "গুদাম ও ওষুধের স্টক" এ যান। "ফ্যাক্টরি থেকে নতুন ওষুধ গ্রহণ" চাপুন। সাপ্লায়ারের নাম, ফ্যাক্টরি চালান নম্বর, ব্যাচ নম্বর ও মেয়াদের তারিখ লিখে সংরক্ষণ করুন। ওষুধগুলো কেন্দ্রীয় গুদামে যুক্ত হবে।'
                  : 'When a shipment arrives, go to "Stock & Storage" > "Factory Stock Receipt". Pick the factory, enter the challan number, batch number, and expiry date. Click Save. The stock is added to the central godown.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-[#0b0c10] border border-[#252628] rounded-xl print:bg-slate-50 print:border-slate-200">
              <div className="font-bold text-white print:text-black flex items-center space-x-2">
                <Users className="size-4 text-emerald-400" />
                <span>{isBn ? 'ধাপ ২: কর্মীদের ওষুধ বুঝিয়ে দেওয়া (অবিক্রীত স্টক গণনা)' : 'Step 2: Issuing Stock to Employees (In-Hand Tracking)'}</span>
              </div>
              <p className="text-xs text-zinc-400 print:text-slate-600 mt-1.5 leading-relaxed">
                {isBn
                  ? '"কর্মী ও অবিক্রীত স্টক" মেনুতে যান। "কর্মীকে ওষুধ দিন" চাপুন। যে সেলস অফিসার ওষুধ নিচ্ছেন তাকে নির্বাচন করে ওষুধের বক্স সংখ্যা দিন। যদি কোনো কর্মী কিছু ওষুধ নিজের কাছে রেখে দেয় কিন্তু বিক্রি না করে, তবে সিস্টেম তা তার নামে "অবিক্রীত ওষুধ" হিসেবে আলাদা সংরক্ষণ করবে।'
                  : 'Go to "Staff & In-Hand Stock" > "Issue Stock to Staff". Select the sales officer and input the box quantities. If an employee keeps products without selling, the system tracks them under that employee as in-hand unsold stock.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-[#0b0c10] border border-[#252628] rounded-xl print:bg-slate-50 print:border-slate-200">
              <div className="font-bold text-white print:text-black flex items-center space-x-2">
                <Receipt className="size-4 text-[#fae0d1]" />
                <span>{isBn ? 'ধাপ ৩: সরাসরি চালান ও বিক্রয় রসিদ তৈরি' : 'Step 3: Instant Billing and POS Invoices'}</span>
              </div>
              <p className="text-xs text-zinc-400 print:text-slate-600 mt-1.5 leading-relaxed">
                {isBn
                  ? '"নতুন চালান তৈরি" মেনুতে যান। কোন কর্মী বিক্রি করছেন তা নির্বাচন করুন এবং ওষুধের নাম ট্যাপ করুন। ক্রেতার নাম এবং কত টাকা নগদ পরিশোধ করেছেন তা লিখে "বিল সেভ করুন" চাপুন। সাথে সাথে পূর্ণাঙ্গ ইনভয়েস PDF ও ডেলিভারি চালান তৈরি হবে।'
                  : 'Go to "Make Bill". Choose the selling employee and tap medicines to add them to the bill. Enter the customer name and payment received. Click Save & Print to produce a clean invoice PDF and delivery challan.'}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-[#0b0c10] border border-[#252628] rounded-xl print:bg-slate-50 print:border-slate-200">
              <div className="font-bold text-white print:text-black flex items-center space-x-2">
                <Navigation className="size-4 text-purple-400" />
                <span>{isBn ? 'ধাপ ৪: মোবাইল ফোনে ফিল্ড সেলস অ্যাপ' : 'Step 4: Field Sales App on Mobile'}</span>
              </div>
              <p className="text-xs text-zinc-400 print:text-slate-600 mt-1.5 leading-relaxed">
                {isBn
                  ? 'ফিল্ড অফিসাররা তাদের নিজস্ব স্মার্টফোনে ব্রাউজারে লিংক খুলে "ফিল্ড অ্যাপ" এ লগইন করবেন। তারা দেখতে পাবেন তাদের কাছে কত বক্স ওষুধ মজুত আছে এবং যেকোনো দোকানে সরাসরি বিক্রির চালান কাটতে পারবেন।'
                  : 'Sales officers open the site on their smartphones, choose "Field App", and log in with their ID. They can view unsold boxes in their bag, make bills on the spot, and record customer payments.'}
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-4 bg-[#0b0c10] border border-[#252628] rounded-xl print:bg-slate-50 print:border-slate-200">
              <div className="font-bold text-white print:text-black flex items-center space-x-2">
                <ShieldCheck className="size-4 text-amber-400" />
                <span>{isBn ? 'ধাপ ৫: অফিসে নগদ কালেকশন জমা ও অবিক্রীত ওষুধ ফেরত' : 'Step 5: Handing Over Cash & Returning Unsold Stock'}</span>
              </div>
              <p className="text-xs text-zinc-400 print:text-slate-600 mt-1.5 leading-relaxed">
                {isBn
                  ? 'ফিল্ড থেকে কর্মী অফিসে টাকা জমা দিলে "কর্মী ও স্টক" মেনুতে "নগদ কালেকশন গ্রহণ" এ ক্লিক করে টাকা জমা রেকর্ড করুন। আর অবিক্রীত ওষুধ ফেরত দিতে চাইলে "ওষুধ ফেরত গ্রহণ" এ ক্লিক করে গুদামে ফিরিয়ে নিন।'
                  : 'When an officer returns to the office, open "Staff & Stock" and click "Accept Cash" to record deposited money. To return unsold boxes back to central storage, click "Return Stock".'}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 4: DOCTORS, EXPENSES & PAYROLL */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white print:text-black flex items-center space-x-2">
            <span className="size-6 rounded-md bg-emerald-500/20 text-emerald-400 print:bg-slate-200 print:text-black grid place-items-center text-xs">
              ৪
            </span>
            <span>{isBn ? '৪. ডাক্তার খাতা, খরচ ও মাসিক বেতন' : '4. Doctors, Expenses & Monthly Payroll'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-[#0b0c10] border border-[#252628] rounded-xl print:bg-slate-50 print:border-slate-200">
              <div className="font-bold text-white print:text-black flex items-center space-x-1.5">
                <Stethoscope className="size-3.5 text-[#de9489]" />
                <span>{isBn ? 'ডাক্তার ও চেম্বার খাতা' : 'Doctors & Prescriptions'}</span>
              </div>
              <p className="text-zinc-400 print:text-slate-600 mt-1">
                {isBn
                  ? 'ডাক্তারদের নাম, চেম্বার, প্রেসক্রাইব করা ওষুধ ও ফিল্ড ভিজিটের উপহার রেকর্ড করুন। মাসিক প্রেসক্রিপশন সংখ্যা স্বয়ংক্রিয়ভাবে ট্র্যাক হয়।'
                  : 'Log doctor profiles, chamber locations, and promotional sample gifts. Track monthly written prescription counts.'}
              </p>
            </div>

            <div className="p-3.5 bg-[#0b0c10] border border-[#252628] rounded-xl print:bg-slate-50 print:border-slate-200">
              <div className="font-bold text-white print:text-black flex items-center space-x-1.5">
                <PieChart className="size-3.5 text-[#fae0d1]" />
                <span>{isBn ? 'দৈনিক খরচ ও নিট লাভ' : 'Expenses & True Net Profit'}</span>
              </div>
              <p className="text-zinc-400 print:text-slate-600 mt-1">
                {isBn
                  ? 'গুদাম ভাড়া, ভ্যানের তেল, বিদ্যুৎ বিল বা কর্মীদের নাস্তার খরচ লিখুন। মোট বিক্রি থেকে ফ্যাক্টরি খরচ ও অন্যান্য খরচ বাদ দিয়ে প্রকৃত নিট লাভ দেখতে পাবেন।'
                  : 'Log rent, fuel, and utility bills. True net profit automatically subtracts factory cost (DP) and expenses from total sales (TP).'}
              </p>
            </div>

            <div className="p-3.5 bg-[#0b0c10] border border-[#252628] rounded-xl print:bg-slate-50 print:border-slate-200">
              <div className="font-bold text-white print:text-black flex items-center space-x-1.5">
                <CalendarCheck className="size-3.5 text-blue-400" />
                <span>{isBn ? 'হাজিরা ও বেতন পে-স্লিপ' : 'Attendance & Monthly Payroll'}</span>
              </div>
              <p className="text-zinc-400 print:text-slate-600 mt-1">
                {isBn
                  ? '১-ক্লিকে দৈনিক হাজিরা দিন। যাতায়াত ভাতা (TA/DA) স্বয়ংক্রিয়ভাবে হিসাব হবে। মাস শেষে পে-স্লিপ তৈরি করে বেতন পরিশোধ করুন।'
                  : 'Mark daily attendance with one click to record daily TA/DA allowances. Generate end-of-month payslips with one click.'}
              </p>
            </div>

            <div className="p-3.5 bg-[#0b0c10] border border-[#252628] rounded-xl print:bg-slate-50 print:border-slate-200">
              <div className="font-bold text-white print:text-black flex items-center space-x-1.5">
                <FileSpreadsheet className="size-3.5 text-emerald-400" />
                <span>{isBn ? '১-ক্লিক সম্পূর্ণ এক্সেল ব্যাকআপ' : '1-Click Multi-Sheet Excel Backup'}</span>
              </div>
              <p className="text-zinc-400 print:text-slate-600 mt-1">
                {isBn
                  ? '"রিপোর্ট ও ব্যাকআপ" মেনুতে গিয়ে "সম্পূর্ণ ব্যাকআপ ডাউনলোড" এ চাপুন। ১৮টি আলাদা শিটসহ একটি এক্সেল ফাইলে সম্পূর্ণ কোম্পানির ডাটা সেভ হয়ে যাবে।'
                  : 'Download the comprehensive 18-sheet Excel backup weekly to keep complete offline copies of your inventory, sales, and accounts.'}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 5: CLOUD DATABASE SETUP INSTRUCTIONS */}
        <div className="p-4 bg-[#0b0c10] border border-emerald-500/30 rounded-xl print:bg-slate-50 print:border-slate-300 space-y-2.5">
          <div className="flex items-center space-x-2 text-emerald-400 print:text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="size-4" />
            <span>{isBn ? '৫. ক্লাউড ডাটাবেজ (Supabase) এ যুক্ত করার নিয়ম' : '5. Cloud Database (Supabase) Quick Setup'}</span>
          </div>
          <p className="text-xs text-zinc-300 print:text-slate-700 leading-relaxed">
            {isBn
              ? 'সফটওয়্যারটি এখন অফলাইনে বা আপনার নিজস্ব ব্রাউজারে স্বয়ংক্রিয়ভাবে কাজ করছে। আপনি যদি চান সকল কর্মীর মোবাইল ও অফিসের কম্পিউটার একই ক্লাউড ডাটাবেজে যুক্ত থাকবে, তবে নিচের সহজ ধাপ অনুসরণ করুন:'
              : 'The application runs out of the box with offline storage. To connect all staff phones and computers to a shared cloud database, follow these steps:'}
          </p>
          <ol className="list-decimal list-inside text-xs text-zinc-400 print:text-slate-700 space-y-1.5 ml-1">
            <li>
              {isBn
                ? 'supabase.com এ গিয়ে একদম ফ্রিতে একটি একাউন্ট ও নতুন প্রজেক্ট তৈরি করুন।'
                : 'Create a free account and new project on supabase.com.'}
            </li>
            <li>
              {isBn
                ? 'প্রজেক্টের SQL Editor এ গিয়ে database/supabase_schema.sql ফাইলটির কোড পেস্ট করে Run করুন।'
                : 'Open SQL Editor, paste the contents of database/supabase_schema.sql, and click Run.'}
            </li>
            <li>
              {isBn
                ? 'Project Settings > API থেকে Project URL এবং anon public key কপি করুন।'
                : 'Copy your Project URL and anon public key from Project Settings > API.'}
            </li>
            <li>
              {isBn
                ? 'Vercel বা .env.local ফাইলে NEXT_PUBLIC_SUPABASE_URL এবং NEXT_PUBLIC_SUPABASE_ANON_KEY পেস্ট করুন।'
                : 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel or your .env.local file.'}
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

