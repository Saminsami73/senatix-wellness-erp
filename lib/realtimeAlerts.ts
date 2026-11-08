import { isSupabaseConfigured, supabase } from './supabase';

export interface RealtimeAlertPayload {
  type: 'invoice' | 'stock' | 'cash' | 'expense' | 'product' | 'doctor' | 'system';
  title: string;
  title_bn?: string;
  description?: string;
  description_bn?: string;
  message?: string;
}

/**
 * Broadcasts a live notification across the current browser window,
 * all open tabs (via storage events), and all remote connected devices
 * via Supabase Realtime WebSocket (100% free forever).
 */
export function broadcastLiveAlert(alert: RealtimeAlertPayload) {
  const normTitleBn = alert.title_bn || alert.title;
  const normDesc = alert.description || alert.message || '';
  const normDescBn = alert.description_bn || normDesc;

  const fullAlert = {
    type: alert.type,
    title: alert.title,
    title_bn: normTitleBn,
    description: normDesc,
    description_bn: normDescBn,
  };

  // 1. Dispatch custom event for the current window
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('senatix_live_alert', { detail: fullAlert }));
      localStorage.setItem(
        'senatix_last_broadcast',
        JSON.stringify({ ...fullAlert, broadcastId: Date.now() + Math.random().toString(36) })
      );
    } catch (e) {
      console.warn('Local broadcast dispatch error:', e);
    }
  }

  // 2. Broadcast via Supabase Realtime WebSocket for all remote phones & computers
  if (isSupabaseConfigured()) {
    try {
      const channel = supabase.channel('senatix_erp_live_channel');
      channel
        .send({
          type: 'broadcast',
          event: 'notification',
          payload: fullAlert,
        })
        .catch((err) => {
          console.warn('[Supabase Realtime] broadcast send error:', err);
        });
    } catch (e) {
      console.warn('[Supabase Realtime] channel error:', e);
    }
  }
}
