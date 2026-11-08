import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://crszblgcsfrkwageuwig.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyc3pibGdjc2Zya3dhZ2V1d2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwODE2MDQsImV4cCI6MjEwOTY1NzYwNH0.8FesAN7dt1vS3-XpcYKUHtYfYKaiLzR48xOHnkjd0zo';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  const url = supabaseUrl;
  const key = supabaseAnonKey;
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

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isValidUUID(str: any): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Table schema allowed columns filter to prevent PostgREST PGRST204 errors
const TABLE_COLUMNS: Record<string, string[]> = {
  expenses: ['id', 'expense_date', 'category', 'title', 'amount', 'payment_method', 'entered_by_emp_id', 'created_at'],
  invoices: [
    'id', 'invoice_ref', 'order_status', 'stock_source', 'date_time', 'date_only',
    'emp_id', 'customer_name', 'customer_phone', 'customer_address', 'sub_total',
    'discount_percent', 'discount_amount', 'net_payable', 'paid_amount', 'due_amount',
    'total_factory_cost_dp', 'payment_status', 'payment_method', 'notes'
  ],
  sales: [
    'id', 'invoice_id', 'invoice_ref', 'date_time', 'date_only', 'emp_id',
    'product_id', 'batch_id', 'qty', 'bonus_qty', 'unit_cost_dp', 'unit_price',
    'discount_percent', 'total_price', 'payment_status'
  ],
  stock_transfers: [
    'id', 'transfer_ref', 'transfer_type', 'emp_id', 'product_id', 'batch_id',
    'qty', 'approved_by_emp_id', 'transfer_date', 'created_at'
  ],
  doctors: [
    'id', 'doctor_code', 'name', 'degrees', 'specialty', 'hospital_chamber',
    'phone', 'market_id', 'assigned_emp_id', 'prescriptions_written_monthly',
    'total_promotional_expense', 'prescribed_products', 'image_url', 'is_active', 'created_at'
  ],
  doctor_expenses: [
    'id', 'doctor_id', 'emp_id', 'expense_date', 'expense_type', 'title',
    'amount', 'prescriptions_written_count', 'notes', 'created_at'
  ],
  employees: [
    'emp_id', 'name', 'image_url', 'phone', 'designation', 'role',
    'nid_number', 'joining_date', 'primary_market_id', 'base_salary',
    'daily_ta_da', 'commission_percent', 'current_due_balance',
    'salary_advance_balance', 'is_active', 'created_at'
  ],
  products: [
    'id', 'sku_code', 'name', 'image_url', 'generic_name', 'category',
    'strength', 'pack_size', 'supplier_id', 'stock', 'low_stock_alert_level',
    'cost_price_dp', 'trade_price_tp', 'mrp', 'bonus_buy_qty', 'bonus_free_qty',
    'is_active', 'created_at'
  ],
  product_batches: [
    'id', 'product_id', 'batch_no', 'mfg_date', 'exp_date',
    'cost_price_dp', 'trade_price_tp', 'mrp', 'warehouse_qty', 'is_active', 'created_at'
  ],
  emp_stock: ['id', 'emp_id', 'product_id', 'batch_id', 'qty', 'updated_at'],
  attendance: ['id', 'emp_id', 'work_date', 'status', 'market_id', 'ta_da_amount_earned', 'marked_by_emp_id'],
  payroll: [
    'id', 'salary_month', 'emp_id', 'working_days', 'base_salary',
    'total_ta_da_earned', 'sales_commission_earned', 'festival_or_extra_bonus',
    'advance_salary_deducted', 'net_salary_payable', 'paid_amount',
    'payment_status', 'paid_date', 'payment_method'
  ],
  ledger: [
    'id', 'date_time', 'date_only', 'account_type', 'emp_id',
    'invoice_ref', 'payment_method', 'description', 'debit', 'credit', 'balance'
  ],
};

function sanitizeForCloud(tableName: string, record: any): any {
  if (!record || typeof record !== 'object') return null;

  const allowed = TABLE_COLUMNS[tableName];
  let clean: any = {};

  if (allowed) {
    for (const key of allowed) {
      if (record[key] !== undefined) {
        clean[key] = record[key];
      }
    }
  } else {
    clean = { ...record };
  }

  // Ensure UUID tables have a valid UUID for id
  if (tableName !== 'employees') {
    if (!clean.id || !isValidUUID(clean.id)) {
      clean.id = generateUUID();
    }
  }

  // Free-Tier Storage Optimization: prevent database ballooning from oversized base64 strings
  if (clean.image_url && typeof clean.image_url === 'string' && clean.image_url.startsWith('data:') && clean.image_url.length > 50000) {
    // If an uncompressed huge base64 is passed, avoid storing it in PostgreSQL text column
    // to preserve 500MB free tier quota
    clean.image_url = null;
  }

  // Nullify optional UUID foreign keys if they are not valid UUIDs
  const optionalUuidFields = ['supplier_id', 'market_id', 'batch_id', 'invoice_id'];
  for (const field of optionalUuidFields) {
    if (clean[field] !== undefined && !isValidUUID(clean[field])) {
      clean[field] = null;
    }
  }

  // Validate required UUID foreign keys
  const requiredUuidFields: Record<string, string[]> = {
    product_batches: ['product_id'],
    emp_stock: ['product_id', 'batch_id'],
    stock_transfers: ['product_id', 'batch_id'],
    doctor_expenses: ['doctor_id'],
    sales: ['product_id'],
  };

  const req = requiredUuidFields[tableName];
  if (req) {
    for (const field of req) {
      if (!isValidUUID(clean[field])) {
        // Skip syncing records with non-UUID mock relations
        return null;
      }
    }
  }

  return clean;
}

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
    const payload = sanitizeForCloud(tableName, record);
    if (!payload) {
      // Skipped due to invalid/mock foreign keys
      return false;
    }
    const { error } = await supabase.from(tableName).upsert(payload);
    if (error) {
      console.warn(`[Supabase] Failed to upsert into ${tableName}:`, error.message, error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Supabase] Exception upserting to ${tableName}:`, err);
    return false;
  }
}

export async function deleteRecordFromCloud(tableName: string, idField: string, idValue: any): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from(tableName).delete().eq(idField, idValue);
    if (error) {
      console.warn(`[Supabase] Failed to delete from ${tableName}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Supabase] Exception deleting from ${tableName}:`, err);
    return false;
  }
}
