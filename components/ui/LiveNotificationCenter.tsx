'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRealtimeNotifications, LiveNotification } from '@/context/RealtimeNotificationContext';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Package,
  Receipt,
  DollarSign,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { ProductBatch } from '@/types/erp';
import { broadcastLiveAlert } from '@/lib/realtimeAlerts';

interface LiveNotificationCenterProps {
  nearExpiryBatches?: ProductBatch[];
}

export function LiveNotificationCenter({ nearExpiryBatches = [] }: LiveNotificationCenterProps) {
  const { mode } = useLanguage();
  const {
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    markAllAsRead,
    clearAll,
  } = useRealtimeNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'live' | 'alerts'>('live');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSendTestNotification = () => {
    broadcastLiveAlert({
      type: 'invoice',
      title: 'Live Realtime Cloud Active',
      title_bn: 'রিয়েল-টাইম নোটিফিকেশন সচল',
      description: 'System WebSocket alert received successfully with sound & toast.',
      description_bn: 'ক্লাউড নোটিফিকেশন ও সাউন্ড অ্যালার্ট সম্পূর্ণ ১০০% ফ্রি ও সক্রিয়ভাবে কাজ করছে।',
    });
  };

  if (!isMounted) {
    return (
      <div className="relative size-10 grid place-items-center rounded-xl bg-[#1b1c20] border border-[#252628] text-zinc-400">
        <Bell className="size-5" />
      </div>
    );
  }

  const totalBadges = unreadCount + nearExpiryBatches.length;

  const getIcon = (type: LiveNotification['type']) => {
    switch (type) {
      case 'invoice':
        return <Receipt className="size-4 text-emerald-400" />;
      case 'cash':
        return <DollarSign className="size-4 text-amber-400" />;
      case 'stock':
        return <Package className="size-4 text-cyan-400" />;
      case 'expense':
        return <AlertCircle className="size-4 text-rose-400" />;
      default:
        return <Sparkles className="size-4 text-purple-400" />;
    }
  };

  return (
    <>
      {/* Single Unified Header Notification Bell Button */}
      <div className="relative">
        <button
          onClick={() => {
            setIsOpen(true);
            markAllAsRead();
          }}
          className="size-10 grid place-items-center rounded-xl bg-[#1b1c20] hover:bg-[#252628] text-zinc-300 hover:text-white border border-[#252628] transition-colors cursor-pointer"
          title={mode === 'bn' ? 'লাইভ নোটিফিকেশন ও সতর্কতা' : 'Live Notifications & Alerts'}
          aria-label="Live Notifications"
        >
          <Bell className="size-5" />
        </button>

        {totalBadges > 0 && (
          <span className="absolute -top-1 -right-1 size-5 bg-rose-500 text-white text-[10px] font-bold rounded-full grid place-items-center animate-pulse shadow-md pointer-events-none">
            {totalBadges > 9 ? '9+' : totalBadges}
          </span>
        )}
      </div>

      {/* Screen-Centered Modal: Never Overlaps or Gets Cut Off */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#15161c] border border-[#2e3036] rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 text-white animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#252628]">
              <div className="flex items-center space-x-2.5">
                <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center text-emerald-400">
                  <Bell className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-100">
                    {mode === 'bn' ? 'লাইভ নোটিফিকেশন ও অ্যালার্ট' : 'Live Notifications & Alerts'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {mode === 'bn' ? 'তাৎক্ষণিক আপডেট ও স্টক নিরাপত্তা বার্তা' : 'Real-time updates & stock inventory alerts'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  className="px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-[11px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                  title={mode === 'bn' ? 'নোটিফিকেশন ও সাউন্ড টেস্ট করুন' : 'Test Realtime Notification'}
                >
                  <Sparkles className="size-3.5" />
                  <span>{mode === 'bn' ? 'টেস্ট নোটিফিকেশন' : 'Test Alert'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                    soundEnabled
                      ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                      : 'border-zinc-700 text-zinc-500 bg-zinc-800'
                  }`}
                  title={soundEnabled ? 'সাউন্ড চালু আছে' : 'সাউন্ড বন্ধ আছে'}
                >
                  {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="size-9 rounded-xl bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] grid place-items-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-2 mt-4 p-1 bg-[#0b0c10] border border-[#252628] rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('live')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  activeTab === 'live'
                    ? 'bg-[#1b1c20] text-white shadow-sm border border-[#2e3036]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{mode === 'bn' ? 'লাইভ আপডেট' : 'Live Updates'}</span>
                {notifications.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('alerts')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  activeTab === 'alerts'
                    ? 'bg-[#1b1c20] text-white shadow-sm border border-[#2e3036]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{mode === 'bn' ? 'মেয়াদ ও স্টক সতর্কতা' : 'Stock & Expiry'}</span>
                {nearExpiryBatches.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded-full font-bold">
                    {nearExpiryBatches.length}
                  </span>
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="py-3 max-h-[50vh] overflow-y-auto no-scrollbar space-y-2 mt-2">
              {activeTab === 'live' ? (
                notifications.length === 0 ? (
                  <div className="py-10 text-center text-zinc-400 text-xs">
                    <CheckCircle2 className="size-9 mx-auto mb-2.5 text-emerald-500/60" />
                    <p className="font-semibold text-zinc-200">
                      {mode === 'bn' ? 'কোনো নতুন নোটিফিকেশন নেই' : 'No new notifications'}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                      {mode === 'bn'
                        ? 'নতুন কোনো চালান, ক্যাশ জমা বা স্টক ট্রান্সফার হলে তাৎক্ষণিক শব্দসহ এখানে চলে আসবে।'
                        : 'Real-time invoices, cash receipts, and stock changes appear here automatically.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleSendTestNotification}
                      className="mt-3.5 px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors cursor-pointer border border-[#252628]"
                    >
                      <Sparkles className="size-3.5 text-emerald-400" />
                      <span>{mode === 'bn' ? 'একটি টেস্ট অ্যালার্ট বাজিয়ে দেখুন' : 'Try a Test Alert'}</span>
                    </button>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-2xl bg-[#0b0c10] border border-[#252628] flex items-start space-x-3 text-xs"
                    >
                      <div className="p-2 rounded-xl bg-[#1b1c20] border border-[#2e3036] shrink-0 mt-0.5">
                        {getIcon(n.type)}
                      </div>
                      <div className="grow min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white truncate">
                            {mode === 'bn' ? n.title_bn : n.title}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-2">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                          {mode === 'bn' ? n.description_bn : n.description}
                        </p>
                      </div>
                    </div>
                  ))
                )
              ) : (
                nearExpiryBatches.length === 0 ? (
                  <div className="py-10 text-center text-zinc-400 text-xs">
                    <ShieldCheck className="size-9 mx-auto mb-2.5 text-emerald-500/60" />
                    <p className="font-semibold text-zinc-200">
                      {mode === 'bn' ? 'সব ব্যাচের মেয়াদ সম্পূর্ণ নিরাপদ' : 'All Batches Healthy'}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                      {mode === 'bn'
                        ? 'পরবর্তী ৯০ দিনের মধ্যে কোনো ওষুধের মেয়াদ শেষ হওয়ার ঝুঁকি নেই।'
                        : 'No medicine batches are expiring within the next 90 days.'}
                    </p>
                  </div>
                ) : (
                  nearExpiryBatches.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl bg-[#0b0c10] border border-amber-500/30 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{b.product_name}</div>
                        <div className="text-zinc-400 mt-0.5 text-[11px]">
                          {mode === 'bn' ? 'ব্যাচ নম্বর:' : 'Batch:'}{' '}
                          <strong className="text-amber-300 font-mono">{b.batch_no}</strong> •{' '}
                          {mode === 'bn' ? 'মেয়াদ:' : 'Exp:'} {b.exp_date}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="px-2.5 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-full font-bold text-[11px]">
                          {b.warehouse_qty} {mode === 'bn' ? 'বক্স' : 'boxes'}
                        </span>
                        <div className="text-[10px] text-amber-400 font-semibold mt-1 flex items-center justify-end space-x-1">
                          <Clock className="size-3" />
                          <span>{mode === 'bn' ? `${b.days_to_expiry} দিন বাকি` : `${b.days_to_expiry} days left`}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#252628] flex items-center justify-between text-xs mt-2">
              <div className="flex items-center space-x-1.5 text-[11px] text-zinc-500">
                <div className="size-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{mode === 'bn' ? 'রিয়েল-টাইম ক্লাউড সংযোগ সচল' : 'Real-time Cloud Connected'}</span>
              </div>

              <div className="flex items-center space-x-2">
                {activeTab === 'live' && notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {mode === 'bn' ? 'তালিকা পরিষ্কার' : 'Clear All'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {mode === 'bn' ? 'ঠিক আছে' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
