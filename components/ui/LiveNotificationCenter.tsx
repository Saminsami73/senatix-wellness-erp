'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { erpStore } from '@/lib/erpStore';
import { useLanguage } from '@/context/LanguageContext';
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
} from 'lucide-react';

export interface LiveNotification {
  id: string;
  type: 'invoice' | 'stock' | 'cash' | 'expense' | 'system';
  title: string;
  title_bn: string;
  description: string;
  description_bn: string;
  timestamp: string;
  read: boolean;
}

// Gentle pleasant chime using Web Audio API (0 external assets, 100% free)
function playGentleChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First harmonious tone (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second harmonious tone (880.00 Hz - A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.08);
    gain2.gain.setValueAtTime(0.14, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.55);
  } catch (err) {
    // Browser audio policy might require user interaction first
  }
}

export function LiveNotificationCenter() {
  const { mode } = useLanguage();
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [activeToast, setActiveToast] = useState<LiveNotification | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addNotification = useCallback(
    (notif: Omit<LiveNotification, 'id' | 'timestamp' | 'read'>) => {
      const newNotif: LiveNotification = {
        ...notif,
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]); // Keep last 20

      // Show toast
      setActiveToast(newNotif);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 5500);

      // Play chime if sound enabled
      if (soundEnabled) {
        playGentleChime();
      }

      // Sync local erpStore
      erpStore.syncWithCloud().catch(() => {});
    },
    [soundEnabled]
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Listen to real-time changes on PostgreSQL tables via Supabase Websockets
    const channel = supabase
      .channel('senatix_erp_live_feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'invoices' },
        (payload) => {
          const inv = payload.new;
          addNotification({
            type: 'invoice',
            title: 'New Sales Invoice Created',
            title_bn: 'নতুন বিক্রয় চালান তৈরি হয়েছে',
            description: `Invoice #${inv.invoice_ref || 'N/A'} for ৳${Number(inv.net_payable || 0).toLocaleString()} has been recorded.`,
            description_bn: `চালান #${inv.invoice_ref || 'N/A'} - মোট ৳${Number(inv.net_payable || 0).toLocaleString()} টাকার বিল নিশ্চিত হয়েছে।`,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ledger' },
        (payload) => {
          const leg = payload.new;
          if (leg.credit > 0) {
            addNotification({
              type: 'cash',
              title: 'Cash Collection Deposited',
              title_bn: 'ফিল্ড কালেকশনের ক্যাশ জমা হয়েছে',
              description: `৳${Number(leg.credit || 0).toLocaleString()} deposited into company cash ledger.`,
              description_bn: `৳${Number(leg.credit || 0).toLocaleString()} টাকা অফিস ক্যাশ অ্যাকাউন্টে জমা হয়েছে।`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emp_stock' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            addNotification({
              type: 'stock',
              title: 'Staff Inventory Updated',
              title_bn: 'কর্মীর ওষুধের স্টক আপডেট হয়েছে',
              description: 'Stock transfer between warehouse and staff has been recorded.',
              description_bn: 'গুদাম ও কর্মীর মধ্যকার ওষুধের হস্তান্তর সফলভাবে সংরক্ষিত হয়েছে।',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'expenses' },
        (payload) => {
          const exp = payload.new;
          addNotification({
            type: 'expense',
            title: 'New Operational Expense',
            title_bn: 'নতুন খরচ এন্ট্রি করা হয়েছে',
            description: `${exp.title || 'Expense'} - ৳${Number(exp.amount || 0).toLocaleString()}`,
            description_bn: `${exp.title || 'খরচ'} - ৳${Number(exp.amount || 0).toLocaleString()} টাকা সংরক্ষিত হয়েছে।`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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
      {/* Realtime Floating Toast (Bottom Right) */}
      {activeToast && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#15161c]/95 backdrop-blur-md border border-[#2e3036] rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-white flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700 shrink-0 mt-0.5">
              {getIcon(activeToast.type)}
            </div>
            <div className="grow min-w-0 pr-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white truncate">
                  {mode === 'bn' ? activeToast.title_bn : activeToast.title}
                </h4>
                <span className="text-[10px] text-zinc-400 font-mono ml-2 shrink-0">
                  {activeToast.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                {mode === 'bn' ? activeToast.description_bn : activeToast.description}
              </p>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg shrink-0"
              aria-label="Close notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bell Trigger Button in Fixed Header or Floating Controls */}
      <div className="relative">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) markAllAsRead();
          }}
          className="relative p-2 rounded-xl bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] text-zinc-300 hover:text-white transition-colors"
          title={mode === 'bn' ? 'লাইভ নোটিফিকেশন' : 'Live Notifications'}
          aria-label="Live Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 size-4 bg-emerald-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Notification Drawer */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#15161c] border border-[#2e3036] rounded-2xl shadow-2xl z-50 p-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <div className="flex items-center space-x-2">
                <Bell className="size-4 text-[#fae0d1]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  {mode === 'bn' ? 'লাইভ নোটিফিকেশন' : 'Live Notifications'}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    soundEnabled
                      ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                      : 'border-zinc-700 text-zinc-500 bg-zinc-800'
                  }`}
                  title={soundEnabled ? 'সাউন্ড চালু আছে' : 'সাউন্ড বন্ধ আছে'}
                >
                  {soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-72 overflow-y-auto no-scrollbar py-2 space-y-2">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  <CheckCircle2 className="size-8 mx-auto mb-2 text-zinc-600 opacity-50" />
                  <p>{mode === 'bn' ? 'কোনো নতুন নোটিফিকেশন নেই।' : 'No new live notifications.'}</p>
                  <p className="text-[10px] text-zinc-600 mt-1">
                    {mode === 'bn' ? 'নতুন কোনো চালান বা ক্যাশ জমা হলে সাথে সাথে এখানে বার্তা পাবেন।' : 'Real-time updates will appear here automatically.'}
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-[#0b0c10] border border-[#252628] flex items-start space-x-2.5 text-xs"
                  >
                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="grow min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate">
                          {mode === 'bn' ? n.title_bn : n.title}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-1">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                        {mode === 'bn' ? n.description_bn : n.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="pt-2 border-t border-[#252628] flex justify-between items-center text-[10px]">
                <span className="text-zinc-500">
                  {mode === 'bn' ? 'রিয়েল-টাইম ক্লাউড অ্যাক্টিভ' : 'Real-time cloud active'}
                </span>
                <button
                  onClick={() => setNotifications([])}
                  className="text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  {mode === 'bn' ? 'তালিকা পরিষ্কার করুন' : 'Clear all'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
