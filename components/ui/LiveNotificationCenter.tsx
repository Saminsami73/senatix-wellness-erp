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
} from 'lucide-react';

export function LiveNotificationCenter() {
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="relative p-2 rounded-xl bg-[#1b1c20] border border-[#252628] text-zinc-400">
        <Bell className="size-4" />
      </div>
    );
  }

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
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAllAsRead();
        }}
        className="relative p-2 rounded-xl bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] text-zinc-300 hover:text-white transition-colors cursor-pointer"
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
                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
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
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
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
                onClick={clearAll}
                className="text-zinc-400 hover:text-white underline cursor-pointer"
              >
                {mode === 'bn' ? 'তালিকা পরিষ্কার করুন' : 'Clear all'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
