'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Receipt, FileSpreadsheet, AlertTriangle, CheckCircle, X, HelpCircle, ShieldCheck } from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { exportFullCompanyBackup } from '@/lib/excelExport';
import { useLanguage } from '@/context/LanguageContext';
import { LiveNotificationCenter } from '@/components/ui/LiveNotificationCenter';

interface RightSidebarProps {
  onOpenQuickBill: () => void;
  onCloseMobile?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onOpenQuickBill, onCloseMobile }) => {
  const { mode, formatCurrency } = useLanguage();
  const [metrics, setMetrics] = useState(erpStore.getDashboardMetrics());
  const [invoices, setInvoices] = useState(erpStore.getInvoices());

  useEffect(() => {
    const unsub = erpStore.subscribe(() => {
      setMetrics(erpStore.getDashboardMetrics());
      setInvoices(erpStore.getInvoices());
    });
    return unsub;
  }, []);

  const handleExportBackup = () => {
    const allData = erpStore.getAllDataForBackup();
    exportFullCompanyBackup(allData);
  };

  const activities = [
    ...invoices.slice(0, 5).map((inv) => ({
      id: inv.id,
      time: inv.date_time
        ? new Date(inv.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : mode === 'bn'
        ? 'আজ'
        : 'Today',
      title: mode === 'bn' ? `চালান নম্বর ${inv.invoice_ref}` : `Invoice ${inv.invoice_ref}`,
      subtitle: `${inv.customer_name || 'গ্রাহক'} • ${formatCurrency(inv.net_payable)}`,
      category:
        inv.order_status === 'Delivered_Final'
          ? mode === 'bn'
            ? 'ডেলিভারি সম্পন্ন'
            : 'Delivered'
          : mode === 'bn'
          ? 'পেন্ডিং অর্ডার'
          : 'Pending Order',
      isWarning: false,
    })),
    ...metrics.nearExpiryBatches.slice(0, 4).map((b) => ({
      id: b.id,
      time: mode === 'bn' ? `${b.days_to_expiry} দিন বাকি` : `${b.days_to_expiry} days left`,
      title: mode === 'bn' ? `মেয়াদ সতর্কতা: ${b.product_name}` : `Expiry alert: ${b.product_name}`,
      subtitle:
        mode === 'bn'
          ? `ব্যাচ: ${b.batch_no} • গুদামে আছে: ${b.warehouse_qty} বক্স`
          : `Batch: ${b.batch_no} • Stock: ${b.warehouse_qty} boxes`,
      category: mode === 'bn' ? 'নিকটবর্তী মেয়াদ' : 'Near Expiry',
      isWarning: true,
    })),
  ].slice(0, 8);

  return (
    <aside className="w-72 h-screen bg-[#0b0c10] border-l border-[#252628] flex flex-col p-4 overflow-y-auto no-scrollbar select-none">
      {/* Top Icon Actions: Exactly One Bell, New Invoice, Backup, Guide */}
      <div className="shrink-0 flex items-center justify-between pb-3 border-b border-[#252628]">
        {/* Quick POS New Invoice Button */}
        <button
          onClick={onOpenQuickBill}
          className="size-10 grid place-items-center rounded-xl sidebar-right-selected hover:opacity-90 transition-all shadow-md active:scale-95 group cursor-pointer"
          title={mode === 'bn' ? 'নতুন চালান তৈরি করুন' : 'Make New Bill'}
        >
          <Receipt className="size-5 text-zinc-900 group-hover:scale-110 transition-transform" />
        </button>

        {/* Single Free Realtime & Expiry Notification Bell */}
        <LiveNotificationCenter nearExpiryBatches={metrics.nearExpiryBatches} />

        {/* 1-Click Company Full Excel Backup Button */}
        <button
          onClick={handleExportBackup}
          className="size-10 grid place-items-center rounded-xl bg-[#1b1c20] hover:bg-[#252628] text-zinc-300 hover:text-white border border-[#252628] transition-colors cursor-pointer"
          title={mode === 'bn' ? 'সম্পূর্ণ এক্সেল ব্যাকআপ ডাউনলোড' : 'Download Company Excel Backup'}
        >
          <FileSpreadsheet className="size-5" />
        </button>

        {/* User Guide Link */}
        <Link
          href="/dashboard/guide"
          className="size-10 grid place-items-center rounded-xl bg-[#1b1c20] hover:bg-[#252628] text-zinc-300 hover:text-white border border-[#252628] transition-colors"
          title={mode === 'bn' ? 'ব্যবহার সহায়িকা ও গাইড' : 'User Guide & Manual'}
        >
          <HelpCircle className="size-5 text-[#de9489]" />
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="size-8 rounded-full grid place-items-center border border-[#252628] text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Live Activity & Alerts Header */}
      <div className="shrink-0 flex items-center justify-between mt-4 mb-2">
        <div className="flex items-center space-x-2">
          <div className="size-2 rounded-full bg-emerald-400 animate-ping" />
          <h3 className="font-semibold text-white text-xs uppercase tracking-wider">
            {mode === 'bn' ? 'লাইভ আপডেট ও সতর্কতা' : 'Live Activity & Alerts'}
          </h3>
        </div>
        <span className="text-[10px] text-zinc-500">{mode === 'bn' ? 'সরাসরি' : 'Live'}</span>
      </div>

      {/* Notification Cards List */}
      <div className="grow flex flex-col space-y-2.5 overflow-y-auto no-scrollbar">
        {activities.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#1b1c20] border border-[#252628] text-center my-auto">
            <ShieldCheck className="size-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="text-xs font-semibold text-white">
              {mode === 'bn' ? 'সবকিছু স্বাভাবিক আছে' : 'All Clear & Healthy'}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
              {mode === 'bn'
                ? 'বর্তমানে কোনো বকেয়া সতর্কবার্তা নেই। নতুন চালান বা স্টক মুভমেন্ট এন্ট্রি হলে তাৎক্ষণিক এখানে দেখা যাবে।'
                : 'No pending alerts. Real-time invoices and stock movements will appear here instantly.'}
            </p>
          </div>
        ) : (
          activities.map((item, idx) => {
            const isHighlight = item.isWarning || idx === 1;
            return (
              <div
                key={`${item.id}-${idx}`}
                className={`p-0.5 rounded-xl transition-all ${
                  isHighlight ? 'notification-selected' : ''
                }`}
              >
                <div className="bg-[#1b1c20] p-3 rounded-[10px] border border-[#252628]">
                  <div className="flex items-center justify-between text-[11px] text-[#70718e]">
                    <span>{item.time}</span>
                    {item.isWarning && (
                      <span className="text-amber-400 flex items-center space-x-1 font-semibold">
                        <AlertTriangle className="size-3" />
                        <span>{mode === 'bn' ? 'সতর্কতা' : 'Alert'}</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-semibold text-xs text-white line-clamp-1">
                    {item.title}
                  </div>
                  <div className="mt-1 text-[11px] text-[#8e9099] line-clamp-1">
                    {item.subtitle}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-medium">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Backup Button Footer */}
      <div className="shrink-0 pt-3 border-t border-[#252628] mt-3">
        <button
          onClick={handleExportBackup}
          className="w-full py-2.5 bg-[#35383d] hover:bg-[#43474d] text-zinc-100 border border-[#43474d] rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <FileSpreadsheet className="size-4 text-[#fae0d1]" />
          <span>{mode === 'bn' ? 'সম্পূর্ণ এক্সেল ব্যাকআপ ডাউনলোড' : 'Download Excel Backup'}</span>
        </button>
      </div>
    </aside>
  );
};
