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


-- ============================================================================
-- 15. INITIAL SEED DATA FOR IMMEDIATE USE
-- Inserts initial medicines, employees, batches and doctors.
-- ============================================================================

-- A. Markets
INSERT INTO markets (id, market_code, name, area_zone, delivery_days) VALUES
('a0000000-0000-0000-0000-000000000001', 'MKT-01', 'Mirpur-10 Territory', 'Dhaka North', 'Sat, Mon, Wed'),
('a0000000-0000-0000-0000-000000000002', 'MKT-02', 'Dhanmondi Medical Zone', 'Dhaka South', 'Sun, Tue, Thu'),
('a0000000-0000-0000-0000-000000000003', 'MKT-03', 'Uttara Sector Route', 'Dhaka North', 'Everyday'),
('a0000000-0000-0000-0000-000000000004', 'MKT-04', 'Mohakhali & Gulshan', 'Dhaka North', 'Mon, Wed, Fri'),
('a0000000-0000-0000-0000-000000000005', 'MKT-05', 'Savar Pharma Belt', 'Dhaka Outskirts', 'Sun, Wed')
ON CONFLICT (market_code) DO NOTHING;

-- B. Employees
INSERT INTO employees (emp_id, name, phone, designation, role, base_salary, daily_ta_da, commission_percent, current_due_balance, primary_market_id) VALUES
('ADM-01', 'Samin Yeasar', '01711000001', 'Super Administrator', 'super_admin', 80000, 500, 2.0, 0, 'a0000000-0000-0000-0000-000000000001'),
('EXE-01', 'Dr. Rafiqul Islam', '01711000002', 'Managing Director', 'executor', 120000, 1000, 3.0, 0, 'a0000000-0000-0000-0000-000000000002'),
('STR-01', 'Belal Hossain', '01711000003', 'Store In-charge', 'store_keeper', 28000, 300, 0.0, 0, 'a0000000-0000-0000-0000-000000000001'),
('ACC-01', 'Nazmul Huda', '01711000004', 'Senior Accountant', 'accountant', 35000, 300, 0.0, 0, 'a0000000-0000-0000-0000-000000000001'),
('EMP-001', 'Tanvir Hossain', '01712000001', 'Senior Sales Officer', 'sales_rep', 24000, 400, 1.5, 4500, 'a0000000-0000-0000-0000-000000000001'),
('EMP-002', 'Shakib Al Hasan', '01712000002', 'Medical Sales Executive', 'sales_rep', 22000, 400, 1.5, 1200, 'a0000000-0000-0000-0000-000000000002'),
('EMP-003', 'Kamrul Hasan', '01712000003', 'Territory Officer', 'sales_rep', 20000, 350, 1.5, 0, 'a0000000-0000-0000-0000-000000000003'),
('DEL-01', 'Rubel Mia', '01713000001', 'Delivery Van Driver', 'sales_rep', 18000, 300, 0.0, 0, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (emp_id) DO NOTHING;

-- C. Suppliers
INSERT INTO suppliers (id, name, contact_person, phone, address) VALUES
('b0000000-0000-0000-0000-000000000001', 'Senatix Pharma Factory Unit-1', 'Engr. Mahbubul Alam', '01819000001', 'Tongi I/A, Gazipur'),
('b0000000-0000-0000-0000-000000000002', 'Square Formulations Lab', 'Dr. Saiful Islam', '01819000002', 'Pabna Plant'),
('b0000000-0000-0000-0000-000000000003', 'Apex Sterile Healthcare', 'Farhan Kabir', '01819000003', 'Bhaluka, Mymensingh')
ON CONFLICT (name) DO NOTHING;

-- D. Products
INSERT INTO products (id, sku_code, name, generic_name, category, strength, pack_size, cost_price_dp, trade_price_tp, mrp, stock, bonus_buy_qty, bonus_free_qty) VALUES
('c0000000-0000-0000-0000-000000000001', 'MED-001', 'Normopress 5mg', 'Amlodipine Besilate', 'Tablet', '5mg', '10 x 10 Strip Box', 120.00, 160.00, 200.00, 320, 10, 1),
('c0000000-0000-0000-0000-000000000002', 'MED-002', 'Senacal-D Plus', 'Calcium Orotate + Vit D3', 'Tablet', '400mg + 400IU', '3 x 10 Strip Box', 180.00, 240.00, 300.00, 210, 10, 1),
('c0000000-0000-0000-0000-000000000003', 'MED-003', 'Gastroloc 20mg', 'Esomeprazole Magnesium', 'Capsule', '20mg', '10 x 10 Alu-Alu Box', 210.00, 280.00, 350.00, 450, 20, 2),
('c0000000-0000-0000-0000-000000000004', 'MED-004', 'Ceftrix 1g IV/IM', 'Ceftriaxone Sodium', 'Injection', '1g', '1 Vial', 110.00, 150.00, 185.00, 95, 0, 0),
('c0000000-0000-0000-0000-000000000005', 'MED-005', 'Dermasil Ointment', 'Clobetasol Propionate', 'Ointment', '0.05% w/w', '20g Tube Box', 45.00, 65.00, 85.00, 160, 10, 1),
('c0000000-0000-0000-0000-000000000006', 'MED-006', 'Neurobex-M', 'Vit B1 + B6 + B12', 'Tablet', 'Standard', '10 x 10 Strip Box', 140.00, 190.00, 240.00, 280, 10, 1),
('c0000000-0000-0000-0000-000000000007', 'MED-007', 'Senatix Vitamin C 500mg', 'Ascorbic Acid', 'Chewable', '500mg', '10 x 10 Orange Chewable', 60.00, 85.00, 110.00, 520, 15, 2),
('c0000000-0000-0000-0000-000000000008', 'MED-008', 'Cardizem-SR 90', 'Diltiazem HCl', 'Capsule', '90mg', '3 x 10 Strip Box', 160.00, 220.00, 275.00, 140, 10, 1)
ON CONFLICT (name) DO NOTHING;

-- E. Batches
INSERT INTO product_batches (id, product_id, batch_no, mfg_date, exp_date, cost_price_dp, trade_price_tp, mrp, warehouse_qty) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'NP-25A01', '2025-01-10', '2027-01-09', 120.00, 160.00, 200.00, 220),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'NP-25B02', '2025-03-01', '2027-02-28', 120.00, 160.00, 200.00, 100),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'SC-24K11', '2024-11-15', '2026-11-14', 180.00, 240.00, 300.00, 210),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'GL-25C03', '2025-02-01', '2027-01-31', 210.00, 280.00, 350.00, 450),
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', 'CF-24J09', '2024-10-01', '2026-09-30', 110.00, 150.00, 185.00, 95),
('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000005', 'DM-24L02', '2024-12-01', '2026-11-30', 45.00, 65.00, 85.00, 160),
('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000006', 'NB-25B01', '2025-02-15', '2027-02-14', 140.00, 190.00, 240.00, 280),
('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000007', 'VC-25A05', '2025-01-05', '2026-12-31', 60.00, 85.00, 110.00, 520),
('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000008', 'CD-25A02', '2025-01-20', '2027-01-19', 160.00, 220.00, 275.00, 140)
ON CONFLICT (product_id, batch_no) DO NOTHING;

-- F. Employee In-Hand Stock (Allocation)
INSERT INTO emp_stock (id, emp_id, product_id, batch_id, qty) VALUES
('e0000000-0000-0000-0000-000000000001', 'EMP-001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 25),
('e0000000-0000-0000-0000-000000000002', 'EMP-001', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', 15),
('e0000000-0000-0000-0000-000000000003', 'EMP-001', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 30),
('e0000000-0000-0000-0000-000000000004', 'EMP-002', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 20),
('e0000000-0000-0000-0000-000000000005', 'EMP-002', 'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000007', 15),
('e0000000-0000-0000-0000-000000000006', 'EMP-003', 'c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000008', 40)
ON CONFLICT (emp_id, product_id, batch_id) DO NOTHING;

-- G. Doctors
INSERT INTO doctors (id, doctor_code, name, degrees, specialty, hospital_chamber, phone, assigned_emp_id, prescriptions_written_monthly, total_promotional_expense, prescribed_products) VALUES
('f0000000-0000-0000-0000-000000000001', 'DOC-001', 'Prof. Dr. A. K. Azad', 'MBBS, FCPS, MD (Cardiology)', 'Cardiologist', 'National Heart Foundation, Mirpur', '01711223344', 'EMP-001', 145, 12500, ARRAY['Normopress 5mg', 'Cardizem-SR 90']),
('f0000000-0000-0000-0000-000000000002', 'DOC-002', 'Dr. Farzana Rahman', 'MBBS, DGO, MCPS', 'Gynecologist', 'Popular Diagnostic Center, Dhanmondi', '01711556677', 'EMP-002', 110, 8500, ARRAY['Senacal-D Plus', 'Neurobex-M']),
('f0000000-0000-0000-0000-000000000003', 'DOC-003', 'Dr. Mahmudul Hasan', 'MBBS, MD (Gastroenterology)', 'Gastroenterologist', 'Ibn Sina Medical, Dhanmondi', '01711889900', 'EMP-002', 180, 15000, ARRAY['Gastroloc 20mg']),
('f0000000-0000-0000-0000-000000000004', 'DOC-004', 'Dr. Nusrat Jahan', 'MBBS, DDV (Dermatology)', 'Dermatologist', 'Labaid Hospital, Uttara', '01711334455', 'EMP-003', 75, 4200, ARRAY['Dermasil Ointment'])
ON CONFLICT (doctor_code) DO NOTHING;

-- H. Initial Expenses
INSERT INTO expenses (id, expense_date, category, title, amount, payment_method, entered_by_emp_id) VALUES
('e1000000-0000-0000-0000-000000000001', CURRENT_DATE, 'Office_Warehouse_Rent', 'Mirpur Central Godown Rent', 35000, 'Bank', 'ADM-01'),
('e1000000-0000-0000-0000-000000000002', CURRENT_DATE, 'Electricity_Internet', 'DESCO Monthly Electric Bill & Fiber Net', 6800, 'bKash', 'ACC-01'),
('e1000000-0000-0000-0000-000000000003', CURRENT_DATE, 'Delivery_Van_Fuel', 'Delivery Van Fuel & CNG Refill', 3200, 'Cash', 'DEL-01'),
('e1000000-0000-0000-0000-000000000004', CURRENT_DATE, 'Staff_Tea_Entertainment', 'Weekly Staff Tea & Office Refreshments', 1450, 'Cash', 'STR-01')
ON CONFLICT (id) DO NOTHING;

