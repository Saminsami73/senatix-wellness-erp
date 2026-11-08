-- ============================================================================
-- SENATIX WELLNESS ERP - COMPLETE SUPABASE CLOUD DATABASE SCHEMA & SEED DATA
-- 100% Free Tier Compatible on Supabase (PostgreSQL 15+)
--
-- INSTRUCTIONS FOR BEGINNERS:
-- 1. Open your Supabase project dashboard at https://supabase.com/dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New query", paste this entire script, and click "Run" (or Ctrl + Enter)
-- 4. All tables, security policies, and initial medicine/staff data will be created!
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. STORAGE BUCKET FOR OPTIONAL IMAGES
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('senatix-media', 'senatix-media', true, 1048576, ARRAY['image/webp', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public View Senatix Media" ON storage.objects;
CREATE POLICY "Public View Senatix Media" ON storage.objects FOR SELECT USING (bucket_id = 'senatix-media');

DROP POLICY IF EXISTS "Allow All Upload Senatix Media" ON storage.objects;
CREATE POLICY "Allow All Upload Senatix Media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'senatix-media');

DROP POLICY IF EXISTS "Allow All Update Senatix Media" ON storage.objects;
CREATE POLICY "Allow All Update Senatix Media" ON storage.objects FOR UPDATE USING (bucket_id = 'senatix-media');

DROP POLICY IF EXISTS "Allow All Delete Senatix Media" ON storage.objects;
CREATE POLICY "Allow All Delete Senatix Media" ON storage.objects FOR DELETE USING (bucket_id = 'senatix-media');


-- ----------------------------------------------------------------------------
-- 2. MARKETS / TERRITORIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_code TEXT UNIQUE NOT NULL,
  name TEXT UNIQUE NOT NULL,
  area_zone TEXT NOT NULL DEFAULT 'Dhaka',
  delivery_days TEXT DEFAULT 'Everyday',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ----------------------------------------------------------------------------
-- 3. EMPLOYEES & MANAGEMENT (50+ Staff Capacity)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  emp_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  phone TEXT UNIQUE NOT NULL,
  designation TEXT NOT NULL DEFAULT 'Sales Officer',
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'executor', 'manager', 'accountant', 'store_keeper', 'sales_rep')) DEFAULT 'sales_rep',
  nid_number TEXT,
  joining_date DATE DEFAULT CURRENT_DATE,
  primary_market_id UUID REFERENCES markets(id) ON DELETE SET NULL,
  base_salary DECIMAL(10,2) DEFAULT 0.00,
  daily_ta_da DECIMAL(8,2) DEFAULT 0.00,
  commission_percent DECIMAL(5,2) DEFAULT 0.00,
  current_due_balance DECIMAL(12,2) DEFAULT 0.00,
  salary_advance_balance DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ----------------------------------------------------------------------------
-- 4. SUPPLIERS (Factories / Manufacturers)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  image_url TEXT,
  contact_person TEXT,
  phone TEXT,
  address TEXT,
  payable_balance DECIMAL(12,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ----------------------------------------------------------------------------
-- 5. PRODUCTS (Master Medicine Catalog)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku_code TEXT UNIQUE,
  name TEXT UNIQUE NOT NULL,
  image_url TEXT,
  generic_name TEXT,
  category TEXT NOT NULL DEFAULT 'Tablet',
  strength TEXT,
  pack_size TEXT NOT NULL DEFAULT '1 Box',
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  stock INTEGER DEFAULT 0,
  low_stock_alert_level INTEGER DEFAULT 50,
  cost_price_dp DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  trade_price_tp DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  mrp DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  bonus_buy_qty INTEGER DEFAULT 0,
  bonus_free_qty INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ----------------------------------------------------------------------------
-- 6. PRODUCT BATCHES (Expiry Tracking & Stock)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  batch_no TEXT NOT NULL,
  mfg_date DATE,
  exp_date DATE NOT NULL,
  cost_price_dp DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  trade_price_tp DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  mrp DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  warehouse_qty INTEGER NOT NULL DEFAULT 0 CHECK (warehouse_qty >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, batch_no)
);


-- ----------------------------------------------------------------------------
-- 7. PURCHASES (Factory Stock Receipt GRN)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receive_ref TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT,
  factory_challan_no TEXT,
  receive_date DATE DEFAULT CURRENT_DATE,
  total_cost_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(12,2) DEFAULT 0.00,
  due_amount DECIMAL(12,2) DEFAULT 0.00,
  notes TEXT,
  created_by_emp_id TEXT REFERENCES employees(emp_id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  batch_id UUID NOT NULL REFERENCES product_batches(id) ON DELETE RESTRICT,
  received_qty INTEGER NOT NULL CHECK (received_qty > 0),
  free_bonus_qty INTEGER DEFAULT 0,
  unit_cost_dp DECIMAL(10,2) NOT NULL,
  line_total_cost DECIMAL(12,2) NOT NULL
);


-- ----------------------------------------------------------------------------
-- 8. EMPLOYEE IN-HAND STOCK & STOCK TRANSFERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emp_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emp_id TEXT NOT NULL REFERENCES employees(emp_id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  batch_id UUID NOT NULL REFERENCES product_batches(id) ON DELETE RESTRICT,
  qty INTEGER NOT NULL DEFAULT 0 CHECK (qty >= 0),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(emp_id, product_id, batch_id)
);

CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_ref TEXT NOT NULL,
  transfer_type TEXT CHECK (transfer_type IN ('Warehouse_To_Employee', 'Employee_Return_To_Warehouse')) DEFAULT 'Warehouse_To_Employee',
  emp_id TEXT NOT NULL REFERENCES employees(emp_id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  batch_id UUID NOT NULL REFERENCES product_batches(id) ON DELETE RESTRICT,
  qty INTEGER NOT NULL CHECK (qty > 0),
  approved_by_emp_id TEXT REFERENCES employees(emp_id),
  transfer_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ----------------------------------------------------------------------------
-- 9. INVOICES & SALES LINE ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_ref TEXT UNIQUE NOT NULL,
  order_status TEXT CHECK (order_status IN ('Order_Booked', 'Packed_Ready', 'Delivered_Final', 'Cancelled')) DEFAULT 'Delivered_Final',
  stock_source TEXT CHECK (stock_source IN ('Employee_Stock', 'Warehouse_Direct')) DEFAULT 'Employee_Stock',
  date_time TIMESTAMPTZ DEFAULT now(),
  date_only DATE DEFAULT CURRENT_DATE,
  emp_id TEXT NOT NULL REFERENCES employees(emp_id) ON DELETE RESTRICT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  sub_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  discount_percent DECIMAL(5,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  net_payable DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  due_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_factory_cost_dp DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_status TEXT CHECK (payment_status IN ('Paid', 'Partial', 'Due', 'Cancelled')) DEFAULT 'Paid',
  payment_method TEXT DEFAULT 'Cash',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  invoice_ref TEXT NOT NULL,
  date_time TIMESTAMPTZ DEFAULT now(),
  date_only DATE DEFAULT CURRENT_DATE,
  emp_id TEXT NOT NULL REFERENCES employees(emp_id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES product_batches(id) ON DELETE RESTRICT,
  qty INTEGER NOT NULL CHECK (qty > 0),
  bonus_qty INTEGER DEFAULT 0 CHECK (bonus_qty >= 0),
  unit_cost_dp DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0.00,
  total_price DECIMAL(12,2) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('Paid', 'Partial', 'Due', 'Cancelled')) DEFAULT 'Paid'
);


-- ----------------------------------------------------------------------------
-- 10. EXPENSES & FINANCIAL LEDGER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_date DATE DEFAULT CURRENT_DATE,
  category TEXT CHECK (category IN (
    'Office_Warehouse_Rent',
    'Delivery_Van_Fuel',
    'Electricity_Internet',
    'Staff_Tea_Entertainment',
    'Packaging_Printing',
    'Salary_Payout',
    'Doctor_Gift',
    'Other_Expense'
  )) DEFAULT 'Other_Expense',
  title TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT DEFAULT 'Cash',
  entered_by_emp_id TEXT REFERENCES employees(emp_id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_time TIMESTAMPTZ DEFAULT now(),
  date_only DATE DEFAULT CURRENT_DATE,
  account_type TEXT CHECK (account_type IN ('Customer', 'Employee', 'Supplier')) DEFAULT 'Employee',
  emp_id TEXT REFERENCES employees(emp_id) ON DELETE RESTRICT,
  invoice_ref TEXT,
  payment_method TEXT DEFAULT 'Cash',
  description TEXT NOT NULL,
  debit DECIMAL(12,2) DEFAULT 0.00,
  credit DECIMAL(12,2) DEFAULT 0.00,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00
);


-- ----------------------------------------------------------------------------
-- 11. ATTENDANCE & PAYROLL
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emp_id TEXT NOT NULL REFERENCES employees(emp_id) ON DELETE CASCADE,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('Present_Office', 'Present_Market_Duty', 'Leave', 'Absent', 'Holiday')) NOT NULL,
  market_id UUID REFERENCES markets(id) ON DELETE SET NULL,
  ta_da_amount_earned DECIMAL(8,2) DEFAULT 0.00,
  marked_by_emp_id TEXT REFERENCES employees(emp_id),
  UNIQUE(emp_id, work_date)
);

CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salary_month TEXT NOT NULL,
  emp_id TEXT NOT NULL REFERENCES employees(emp_id) ON DELETE RESTRICT,
  working_days INTEGER DEFAULT 0,
  base_salary DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_ta_da_earned DECIMAL(10,2) DEFAULT 0.00,
  sales_commission_earned DECIMAL(10,2) DEFAULT 0.00,
  festival_or_extra_bonus DECIMAL(10,2) DEFAULT 0.00,
  advance_salary_deducted DECIMAL(10,2) DEFAULT 0.00,
  net_salary_payable DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_status TEXT CHECK (payment_status IN ('Unpaid', 'Paid')) DEFAULT 'Unpaid',
  paid_date DATE,
  payment_method TEXT DEFAULT 'Cash',
  UNIQUE(salary_month, emp_id)
);


-- ----------------------------------------------------------------------------
-- 12. DOCTORS DIRECTORY & PROMOTIONAL GIFTS/SAMPLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  degrees TEXT NOT NULL,
  specialty TEXT NOT NULL DEFAULT 'General Physician',
  hospital_chamber TEXT NOT NULL,
  phone TEXT NOT NULL,
  market_id UUID REFERENCES markets(id) ON DELETE SET NULL,
  assigned_emp_id TEXT REFERENCES employees(emp_id) ON DELETE SET NULL,
  prescriptions_written_monthly INTEGER DEFAULT 0,
  total_promotional_expense DECIMAL(12,2) DEFAULT 0.00,
  prescribed_products TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS doctor_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  emp_id TEXT NOT NULL REFERENCES employees(emp_id) ON DELETE RESTRICT,
  expense_date DATE DEFAULT CURRENT_DATE,
  expense_type TEXT CHECK (expense_type IN ('Sample_Medicine', 'Gift_Item', 'Cash_Honorarium', 'Dinner_Conference')) NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  prescriptions_written_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ----------------------------------------------------------------------------
-- 13. AUTOMATIC TRIGGER: SYNC WAREHOUSE BATCH STOCK TO PRODUCTS.STOCK
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_sync_product_total_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = COALESCE((
    SELECT SUM(warehouse_qty)
    FROM product_batches
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
      AND is_active = true
      AND exp_date >= CURRENT_DATE
  ), 0)
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_product_stock ON product_batches;
CREATE TRIGGER trg_sync_product_stock
AFTER INSERT OR UPDATE OR DELETE ON product_batches
FOR EACH ROW EXECUTE FUNCTION fn_sync_product_total_stock();


-- ----------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (PERMISSIVE FOR ANON & AUTHENTICATED ACCESS)
-- Allows the Next.js frontend to read and write without authentication blockers.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'markets', 'employees', 'suppliers', 'products', 'product_batches',
    'purchases', 'purchase_items', 'emp_stock', 'stock_transfers',
    'invoices', 'sales', 'expenses', 'ledger', 'attendance', 'payroll',
    'doctors', 'doctor_expenses'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow All %I" ON %I;', t, t);
    EXECUTE format('CREATE POLICY "Allow All %I" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', t, t);
  END LOOP;
END $$;


-- ----------------------------------------------------------------------------
-- 14B. ENABLE SUPABASE REALTIME WEBSOCKET REPLICATION (100% FREE)
-- Broadcasts live inserts/updates to all connected browsers and phones.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH t IN ARRAY ARRAY['invoices', 'ledger', 'emp_stock', 'stock_transfers', 'expenses', 'products', 'product_batches']
    LOOP
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I;', t);
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END LOOP;
  END IF;
END $$;


-- ============================================================================
-- 15. INITIAL ADMINISTRATIVE ACCOUNTS FOR PRODUCTION USE
-- Only official executive & administrator profiles are provisioned.
-- All medicine catalogs, batches, expenses, and doctors are kept 100% clean
-- for authentic commercial additions.
-- ============================================================================

INSERT INTO employees (emp_id, name, phone, designation, role, base_salary, daily_ta_da, commission_percent, current_due_balance) VALUES
('ADM-01', 'Samin Yeasar', '+8801770578142', 'Chief Executive Officer & Super Admin', 'super_admin', 80000, 500, 2.0, 0),
('EXE-01', 'Dr. Rafiqul Islam', '+8801711000002', 'Managing Director', 'executor', 120000, 1000, 3.0, 0),
('MGR-01', 'Farhan Ahmed', '+8801711000005', 'Chief Operations Manager', 'manager', 60000, 400, 1.5, 0),
('ACC-01', 'Nazmul Huda', '+8801711000004', 'Chief Financial Accountant', 'accountant', 45000, 300, 0.0, 0),
('STR-01', 'Belal Hossain', '+8801711000003', 'Central Godown & Store In-charge', 'store_keeper', 32000, 300, 0.0, 0)
ON CONFLICT (emp_id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  designation = EXCLUDED.designation,
  role = EXCLUDED.role;

