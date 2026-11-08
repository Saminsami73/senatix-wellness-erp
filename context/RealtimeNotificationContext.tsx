'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { erpStore } from '@/lib/erpStore';
import { useLanguage } from '@/context/LanguageContext';
import {
  Receipt,
  DollarSign,
  Package,
  AlertCircle,
  Sparkles,
  X,
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

interface NotificationContextType {
  notifications: LiveNotification[];
  unreadCount: number;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (notif: Omit<LiveNotification, 'id' | 'timestamp' | 'read'>) => void;
}

const RealtimeNotificationContext = createContext<NotificationContextType | null>(null);

// Gentle pleasant chime using Web Audio API (0 external assets, 100% free)
function playGentleChime() {
  try {
    if (typeof window === 'undefined') return;
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

export function RealtimeNotificationProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useLanguage();
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [activeToast, setActiveToast] = useState<LiveNotification | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addNotification = useCallback(
    (notif: Omit<LiveNotification, 'id' | 'timestamp' | 'read'>) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newNotif: LiveNotification = {
        ...notif,
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: timeStr,
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]); // Keep last 20

      // Show floating toast
      setActiveToast(newNotif);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 5500);

      // Play audio chime if enabled
      if (soundEnabled) {
        playGentleChime();
      }

      // Sync local erpStore
      erpStore.syncWithCloud().catch(() => {});
    },
    [soundEnabled]
  );

  // Single safe Supabase Realtime channel subscription
  useEffect(() => {
    if (!isMounted || !isSupabaseConfigured()) return;

    // Use a unique channel id to guarantee no collision across reloads or HMR
    const channelId = `senatix_realtime_${Date.now()}`;
    const channel = supabase.channel(channelId);

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'invoices' },
        (payload) => {
          const inv = payload.new;
          addNotification({
            type: 'invoice',
            title: 'New Sales Invoice Created',
            title_bn: 'নতুন বিক্রয় চালান তৈরি হয়েছে',
            description: `Invoice #${inv.invoice_ref || 'N/A'} for ৳${Number(inv.net_payable || 0).toLocaleString()} recorded.`,
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
      .subscribe((status, err) => {
        if (err) {
          console.warn('[Supabase Realtime] Subscription status:', status, err);
        }
      });

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // Safe channel cleanup
      }
    };
  }, [isMounted, addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

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
    <RealtimeNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        soundEnabled,
        setSoundEnabled,
        markAllAsRead,
        clearAll,
        addNotification,
      }}
    >
      {children}

      {/* Global Floating Toast (only renders on client after mount) */}
      {isMounted && activeToast && (
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
              className="text-zinc-400 hover:text-white p-1 rounded-lg shrink-0 cursor-pointer"
              aria-label="Close notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </RealtimeNotificationContext.Provider>
  );
}

export function useRealtimeNotifications() {
  const context = useContext(RealtimeNotificationContext);
  if (!context) {
    throw new Error('useRealtimeNotifications must be used within RealtimeNotificationProvider');
  }
  return context;
}
