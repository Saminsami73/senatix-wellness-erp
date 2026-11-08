'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Receipt, Bell, FileSpreadsheet, AlertTriangle, CheckCircle, X, HelpCircle } from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { exportFullCompanyBackup } from '@/lib/excelExport';
import { useLanguage } from '@/context/LanguageContext';

interface RightSidebarProps {
  onOpenQuickBill: () => void;
  onCloseMobile?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onOpenQuickBill, onCloseMobile }) => {
  const { mode, t, formatCurrency } = useLanguage();
  const [metrics, setMetrics] = useState(erpStore.getDashboardMetrics());
  const [invoices, setInvoices] = useState(erpStore.getInvoices());
  const [showAlertModal, setShowAlertModal] = useState(false);

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
      time: inv.date_time ? new Date(inv.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (mode === 'bn' ? 'আজ' : 'Today'),
      title: mode === 'bn' ? `চালান নম্বর ${inv.invoice_ref}` : `Invoice ${inv.invoice_ref}`,
      subtitle: `${inv.customer_name} • ${formatCurrency(inv.net_payable)}`,
      category: inv.order_status === 'Delivered_Final'
        ? (mode === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered')
        : (mode === 'bn' ? 'পেন্ডিং অর্ডার' : 'Pending Order'),
      isWarning: false,
    })),
    ...metrics.nearExpiryBatches.slice(0, 3).map((b) => ({
      id: b.id,
      time: mode === 'bn' ? `${b.days_to_expiry} দিন বাকি` : `${b.days_to_expiry} days left`,
      title: mode === 'bn' ? `মেয়াদ সতর্কতা: ${b.product_name}` : `Expiry alert: ${b.product_name}`,
      subtitle: mode === 'bn' ? `ব্যাচ: ${b.batch_no} • গুদামে আছে: ${b.warehouse_qty} বক্স` : `Batch: ${b.batch_no} • Stock: ${b.warehouse_qty} boxes`,
      category: mode === 'bn' ? 'নিকটবর্তী মেয়াদ' : 'Near Expiry',
      isWarning: true,
    })),
  ].slice(0, 8);

  return (
    <>
      <aside className="w-72 h-screen bg-[#0b0c10] border-l border-[#252628] flex flex-col p-4 overflow-y-auto no-scrollbar select-none">
        {/* Top Icon Actions */}
        <div className="shrink-0 flex items-center justify-between pb-3 border-b border-[#252628]">
          {/* Quick POS New Invoice Button */}
          <button
            onClick={onOpenQuickBill}
            className="size-10 grid place-items-center rounded-xl sidebar-right-selected hover:opacity-90 transition-all shadow-md active:scale-95 group"
            title={mode === 'bn' ? 'নতুন চালান তৈরি করুন' : 'Make New Bill'}
          >
            <Receipt className="size-5 text-zinc-900 group-hover:scale-110 transition-transform" />
          </button>

          {/* Near-Expiry & Low-Stock Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertModal(true)}
              className="size-10 grid place-items-center rounded-xl bg-[#1b1c20] hover:bg-[#252628] text-zinc-300 hover:text-white border border-[#252628] transition-colors"
              title={mode === 'bn' ? 'ওষুধ মেয়াদ ও স্টক সতর্কতা' : 'Stock & Expiry Alerts'}
            >
              <Bell className="size-5" />
            </button>
            {(metrics.expiringCount + metrics.lowStockCount) > 0 && (
              <span className="absolute -top-1 -right-1 size-5 bg-rose-500 text-white text-[10px] font-bold rounded-full grid place-items-center animate-pulse">
                {metrics.expiringCount + metrics.lowStockCount}
              </span>
            )}
          </div>

          {/* 1-Click Company Full Excel Backup Button */}
          <button
            onClick={handleExportBackup}
            className="size-10 grid place-items-center rounded-xl bg-[#1b1c20] hover:bg-[#252628] text-zinc-300 hover:text-white border border-[#252628] transition-colors"
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
              className="size-8 rounded-full grid place-items-center border border-[#252628] text-zinc-400 hover:text-white"
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
          {activities.map((item, idx) => {
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
          })}
        </div>

        {/* Backup Button Footer */}
        <div className="shrink-0 pt-3 border-t border-[#252628] mt-3">
          <button
            onClick={handleExportBackup}
            className="w-full py-2.5 bg-[#35383d] hover:bg-[#43474d] text-zinc-100 border border-[#43474d] rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-95"
          >
            <FileSpreadsheet className="size-4 text-[#fae0d1]" />
            <span>{mode === 'bn' ? 'সম্পূর্ণ এক্সেল ব্যাকআপ ডাউনলোড' : 'Download Excel Backup'}</span>
          </button>
        </div>
      </aside>

      {/* Near-Expiry & Low-Stock Alerts Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1c20] border border-[#252628] rounded-xl max-w-lg w-full p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="size-5 text-amber-400" />
                <h3 className="font-semibold text-base">
                  {mode === 'bn' ? 'ওষুধের মেয়াদ ও কম স্টক সতর্কতা' : 'Stock & Expiry Alerts'}
                </h3>
              </div>
              <button
                onClick={() => setShowAlertModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="text-xs text-zinc-400 font-medium">
                {mode === 'bn'
                  ? 'পরবর্তী ৯০ দিনের মধ্যে মেয়াদ শেষ হতে যাওয়া ব্যাচসমূহ:'
                  : 'Batches expiring within the next 90 days:'}
              </div>
              {metrics.nearExpiryBatches.length === 0 ? (
                <div className="p-3 bg-zinc-900 rounded-lg text-xs text-emerald-400 flex items-center space-x-2">
                  <CheckCircle className="size-4" />
                  <span>
                    {mode === 'bn'
                      ? 'কোনো ওষুধের মেয়াদ ৯০ দিনের মধ্যে শেষ হচ্ছে না।'
                      : 'No medicine batches are expiring within 90 days.'}
                  </span>
                </div>
              ) : (
                metrics.nearExpiryBatches.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 bg-zinc-900 rounded-lg border border-amber-500/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{b.product_name}</div>
                      <div className="text-zinc-400 mt-0.5">
                        {mode === 'bn' ? 'ব্যাচ:' : 'Batch:'} <strong className="text-amber-300">{b.batch_no}</strong> | {mode === 'bn' ? 'মেয়াদ:' : 'Exp:'} {b.exp_date}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded font-bold">
                        {b.warehouse_qty} {mode === 'bn' ? 'বক্স' : 'boxes'}
                      </span>
                      <div className="text-[10px] text-zinc-400 mt-1">
                        {mode === 'bn' ? `${b.days_to_expiry} দিন বাকি` : `${b.days_to_expiry} days left`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowAlertModal(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-sm"
            >
              {mode === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
