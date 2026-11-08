import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-senatix-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    url.startsWith('https://') &&
    url.includes('.supabase.co')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'Supabase credentials are not set in environment variables.' };
  }
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, message: 'Connected to Supabase PostgreSQL database.' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Connection failed.' };
  }
}

export async function fetchFromCloud<T>(tableName: string): Promise<T[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      console.warn(`[Supabase] Error reading table ${tableName}:`, error.message);
      return null;
    }
    return (data as T[]) || null;
  } catch (err) {
    console.warn(`[Supabase] Network exception fetching ${tableName}:`, err);
    return null;
  }
}

export async function syncRecordToCloud(tableName: string, record: any): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from(tableName).upsert(record);
    if (error) {
      console.warn(`[Supabase] Failed to upsert into ${tableName}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Supabase] Exception upserting to ${tableName}:`, err);
    return false;
  }
}
