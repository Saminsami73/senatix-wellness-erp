import {
  Market,
  Employee,
  Customer,
  Supplier,
  Product,
  ProductBatch,
  Purchase,
  EmpStock,
  StockTransfer,
  Invoice,
  SalesReturn,
  DamagedExpiredStock,
  LedgerEntry,
  Expense,
  Attendance,
  EmployeeTarget,
  Payroll,
  UserRole,
  Doctor,
  DoctorExpense,
} from '@/types/erp';
import { isSupabaseConfigured, fetchFromCloud, syncRecordToCloud, deleteRecordFromCloud, generateUUID, supabase } from '@/lib/supabase';

// SEED DATA FOR IMMEDIATE OUT-OF-THE-BOX OPERATION
const initialMarkets: Market[] = [
  { id: 'mkt-1', market_code: 'MKT-01', name: 'Mirpur-10 Territory', area_zone: 'Dhaka North', delivery_days: 'Sat, Mon, Wed', is_active: true },
  { id: 'mkt-2', market_code: 'MKT-02', name: 'Dhanmondi Medical Zone', area_zone: 'Dhaka South', delivery_days: 'Sun, Tue, Thu', is_active: true },
  { id: 'mkt-3', market_code: 'MKT-03', name: 'Uttara Sector Route', area_zone: 'Dhaka North', delivery_days: 'Everyday', is_active: true },
  { id: 'mkt-4', market_code: 'MKT-04', name: 'Mohakhali & Gulshan', area_zone: 'Dhaka North', delivery_days: 'Mon, Wed, Fri', is_active: true },
  { id: 'mkt-5', market_code: 'MKT-05', name: 'Savar Pharma Belt', area_zone: 'Dhaka Outskirts', delivery_days: 'Sun, Wed', is_active: true },
];

const initialEmployees: Employee[] = [
  {
    emp_id: 'ADM-01',
    name: 'Samin Yeasar',
    image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '01711000001',
    designation: 'Super Administrator',
    role: 'super_admin',
    joining_date: '2023-01-01',
    primary_market_id: 'mkt-1',
    base_salary: 80000,
    daily_ta_da: 500,
    commission_percent: 2.0,
    current_due_balance: 0,
    salary_advance_balance: 0,
    is_active: true,
  },
  {
    emp_id: 'EXE-01',
    name: 'Dr. Rafiqul Islam',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '01711000002',
    designation: 'Managing Director / Executor',
    role: 'executor',
    joining_date: '2023-01-01',
    primary_market_id: 'mkt-2',
    base_salary: 95000,
    daily_ta_da: 600,
    commission_percent: 3.0,
    current_due_balance: 0,
    salary_advance_balance: 0,
    is_active: true,
  },
  {
    emp_id: 'MGR-01',
    name: 'Farhan Ahmed',
    image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '01711000003',
    designation: 'General Operations Manager',
    role: 'manager',
    joining_date: '2023-03-15',
    primary_market_id: 'mkt-3',
    base_salary: 60000,
    daily_ta_da: 400,
    commission_percent: 1.5,
    current_due_balance: 0,
    salary_advance_balance: 5000,
    is_active: true,
  },
  {
    emp_id: 'ACC-01',
    name: 'Nazrul Islam',
    image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '01711000004',
    designation: 'Chief Accountant',
    role: 'accountant',
    joining_date: '2023-04-01',
    primary_market_id: null,
    base_salary: 50000,
    daily_ta_da: 300,
    commission_percent: 0,
    current_due_balance: 0,
    salary_advance_balance: 0,
    is_active: true,
  },
  {
    emp_id: 'STR-01',
    name: 'Tariqul Hasan',
    image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    phone: '01711000005',
    designation: 'Store & Warehouse Keeper',
    role: 'store_keeper',
    joining_date: '2023-05-10',
    primary_market_id: null,
    base_salary: 35000,
    daily_ta_da: 250,
    commission_percent: 0,
    current_due_balance: 0,
    salary_advance_balance: 0,
    is_active: true,
  },
  {
    emp_id: 'EMP-001',
    name: 'Tanvir Hossain',
    image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    phone: '01711000010',
    designation: 'Senior Sales Officer (MPO)',
    role: 'sales_rep',
    joining_date: '2023-06-01',
    primary_market_id: 'mkt-1',
    base_salary: 28000,
    daily_ta_da: 350,
    commission_percent: 2.5,
    current_due_balance: 14200,
    salary_advance_balance: 2000,
    is_active: true,
  },
  {
    emp_id: 'EMP-002',
    name: 'Shakib Al Hasan',
    image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    phone: '01711000011',
    designation: 'Territory Sales Officer',
    role: 'sales_rep',
    joining_date: '2023-07-15',
    primary_market_id: 'mkt-2',
    base_salary: 26000,
    daily_ta_da: 350,
    commission_percent: 2.0,
    current_due_balance: 8500,
    salary_advance_balance: 0,
    is_active: true,
  },
  {
    emp_id: 'EMP-003',
    name: 'Mehedi Hasan',
    image_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    phone: '01711000012',
    designation: 'Field Sales Representative',
    role: 'sales_rep',
    joining_date: '2023-08-01',
    primary_market_id: 'mkt-3',
    base_salary: 25000,
    daily_ta_da: 350,
    commission_percent: 2.0,
    current_due_balance: 6200,
    salary_advance_balance: 0,
    is_active: true,
  },
  {
    emp_id: 'EMP-004',
    name: 'Rakibul Islam',
    image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    phone: '01711000013',
    designation: 'Field Sales Representative',
    role: 'sales_rep',
    joining_date: '2023-09-01',
    primary_market_id: 'mkt-4',
    base_salary: 25000,
    daily_ta_da: 350,
    commission_percent: 2.0,
    current_due_balance: 11400,
    salary_advance_balance: 1500,
    is_active: true,
  },
  {
    emp_id: 'EMP-005',
    name: 'Ashikur Rahman',
    image_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    phone: '01711000014',
    designation: 'Van Delivery Incharge',
    role: 'sales_rep',
    joining_date: '2023-10-01',
    primary_market_id: 'mkt-5',
    base_salary: 24000,
    daily_ta_da: 350,
    commission_percent: 1.5,
    current_due_balance: 4100,
    salary_advance_balance: 0,
    is_active: true,
  },
];

const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    customer_code: 'PHARM-1001',
    shop_name: 'Popular Medicine Corner',
    owner_name: 'Haji Mohammad Younus',
    image_url: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=150&auto=format&fit=crop&q=80',
    phone: '01819000101',
    address: 'Plot 12, Main Road, Mirpur-10, Dhaka',
    drug_license_no: 'DL-DHK-48291',
    market_id: 'mkt-1',
    assigned_emp_id: 'EMP-001',
    credit_limit: 80000,
    current_due_balance: 18500,
    is_active: true,
  },
  {
    id: 'cust-2',
    customer_code: 'PHARM-1002',
    shop_name: 'Al-Madina Pharmacy & Surgicals',
    owner_name: 'Kabir Hossain',
    image_url: 'https://images.unsplash.com/photo-1586015555751-63c299c85583?w=150&auto=format&fit=crop&q=80',
    phone: '01819000102',
    address: 'Road 7/A, Dhanmondi, Dhaka',
    drug_license_no: 'DL-DHK-39102',
    market_id: 'mkt-2',
    assigned_emp_id: 'EMP-002',
    credit_limit: 60000,
    current_due_balance: 9200,
    is_active: true,
  },
  {
    id: 'cust-3',
    customer_code: 'PHARM-1003',
    shop_name: 'Care Chemists & Wellness',
    owner_name: 'Dr. Shahinur Alam',
    phone: '01819000103',
    address: 'Sector 3, Jashimuddin Ave, Uttara, Dhaka',
    drug_license_no: 'DL-DHK-91283',
    market_id: 'mkt-3',
    assigned_emp_id: 'EMP-003',
    credit_limit: 100000,
    current_due_balance: 24000,
    is_active: true,
  },
  {
    id: 'cust-4',
    customer_code: 'PHARM-1004',
    shop_name: 'Labaid Central Drug House',
    owner_name: 'Mahbubur Rahman',
    phone: '01819000104',
    address: 'Wireless Gate, Mohakhali, Dhaka',
    drug_license_no: 'DL-DHK-81726',
    market_id: 'mkt-4',
    assigned_emp_id: 'EMP-004',
    credit_limit: 75000,
    current_due_balance: 14500,
    is_active: true,
  },
  {
    id: 'cust-5',
    customer_code: 'PHARM-1005',
    shop_name: 'Green Life Dispensary',
    owner_name: 'Jahirul Islam',
    phone: '01819000105',
    address: 'Savar Bus Stand Market, Savar, Dhaka',
    drug_license_no: 'DL-DHK-19283',
    market_id: 'mkt-5',
    assigned_emp_id: 'EMP-005',
    credit_limit: 50000,
    current_due_balance: 7800,
    is_active: true,
  },
];

const initialSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Beximco Pharmaceuticals Ltd.', contact_person: 'Md. Saifullah', phone: '01713000011', address: 'Tongi, Gazipur', payable_balance: 45000, is_active: true },
  { id: 'sup-2', name: 'Square Healthcare Ltd.', contact_person: 'Azizul Haque', phone: '01713000012', address: 'Salgaria, Pabna', payable_balance: 28000, is_active: true },
  { id: 'sup-3', name: 'Incepta Formulations Ltd.', contact_person: 'Rezaul Karim', phone: '01713000013', address: 'Zirabo, Savar', payable_balance: 15000, is_active: true },
  { id: 'sup-4', name: 'Renata Distribution Ltd.', contact_person: 'Shamsul Alam', phone: '01713000014', address: 'Mirpur, Dhaka', payable_balance: 32000, is_active: true },
];

const initialDoctors: Doctor[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    doctor_code: 'DOC-001',
    name: 'Prof. Dr. A. K. Azad',
    degrees: 'MBBS, FCPS, MD (Cardiology)',
    specialty: 'Cardiologist',
    hospital_chamber: 'National Heart Foundation, Mirpur',
    phone: '01711223344',
    assigned_emp_id: 'EMP-001',
    prescriptions_written_monthly: 145,
    total_promotional_expense: 12500,
    prescribed_products: ['Normopress 5mg', 'Cardizem-SR 90'],
    is_active: true,
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    doctor_code: 'DOC-002',
    name: 'Dr. Farzana Rahman',
    degrees: 'MBBS, DGO, MCPS',
    specialty: 'Gynecologist',
    hospital_chamber: 'Popular Diagnostic Center, Dhanmondi',
    phone: '01711556677',
    assigned_emp_id: 'EMP-002',
    prescriptions_written_monthly: 110,
    total_promotional_expense: 8500,
    prescribed_products: ['Senacal-D Plus', 'Neurobex-M'],
    is_active: true,
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    doctor_code: 'DOC-003',
    name: 'Dr. Mahmudul Hasan',
    degrees: 'MBBS, MD (Gastroenterology)',
    specialty: 'Gastroenterologist',
    hospital_chamber: 'Ibn Sina Medical, Dhanmondi',
    phone: '01711889900',
    assigned_emp_id: 'EMP-002',
    prescriptions_written_monthly: 180,
    total_promotional_expense: 15000,
    prescribed_products: ['Gastroloc 20mg'],
    is_active: true,
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    doctor_code: 'DOC-004',
    name: 'Dr. Nusrat Jahan',
    degrees: 'MBBS, DDV (Dermatology)',
    specialty: 'Dermatologist',
    hospital_chamber: 'Labaid Hospital, Uttara',
    phone: '01711334455',
    assigned_emp_id: 'EMP-003',
    prescriptions_written_monthly: 75,
    total_promotional_expense: 4200,
    prescribed_products: ['Dermasil Ointment'],
    is_active: true,
  },
];

const initialDoctorExpenses: DoctorExpense[] = [];

const initialProducts: Product[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    sku_code: 'MED-001',
    name: 'Normopress 5mg',
    generic_name: 'Amlodipine Besilate',
    category: 'Tablet',
    strength: '5mg',
    pack_size: '10 x 10 Strip Box',
    stock: 320,
    low_stock_alert_level: 50,
    cost_price_dp: 120.00,
    trade_price_tp: 160.00,
    mrp: 200.00,
    bonus_buy_qty: 10,
    bonus_free_qty: 1,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    sku_code: 'MED-002',
    name: 'Senacal-D Plus',
    generic_name: 'Calcium Orotate + Vit D3',
    category: 'Tablet',
    strength: '400mg + 400IU',
    pack_size: '3 x 10 Strip Box',
    stock: 210,
    low_stock_alert_level: 40,
    cost_price_dp: 180.00,
    trade_price_tp: 240.00,
    mrp: 300.00,
    bonus_buy_qty: 10,
    bonus_free_qty: 1,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    sku_code: 'MED-003',
    name: 'Gastroloc 20mg',
    generic_name: 'Esomeprazole Magnesium',
    category: 'Capsule',
    strength: '20mg',
    pack_size: '10 x 10 Alu-Alu Box',
    stock: 450,
    low_stock_alert_level: 100,
    cost_price_dp: 210.00,
    trade_price_tp: 280.00,
    mrp: 350.00,
    bonus_buy_qty: 20,
    bonus_free_qty: 2,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    sku_code: 'MED-004',
    name: 'Ceftrix 1g IV/IM',
    generic_name: 'Ceftriaxone Sodium',
    category: 'Injection',
    strength: '1g',
    pack_size: '1 Vial',
    stock: 95,
    low_stock_alert_level: 30,
    cost_price_dp: 110.00,
    trade_price_tp: 150.00,
    mrp: 185.00,
    bonus_buy_qty: 0,
    bonus_free_qty: 0,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    sku_code: 'MED-005',
    name: 'Dermasil Ointment',
    generic_name: 'Clobetasol Propionate',
    category: 'Ointment',
    strength: '0.05% w/w',
    pack_size: '20g Tube Box',
    stock: 160,
    low_stock_alert_level: 30,
    cost_price_dp: 45.00,
    trade_price_tp: 65.00,
    mrp: 85.00,
    bonus_buy_qty: 10,
    bonus_free_qty: 1,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    sku_code: 'MED-006',
    name: 'Neurobex-M',
    generic_name: 'Vit B1 + B6 + B12',
    category: 'Tablet',
    strength: 'Standard',
    pack_size: '10 x 10 Strip Box',
    stock: 280,
    low_stock_alert_level: 50,
    cost_price_dp: 140.00,
    trade_price_tp: 190.00,
    mrp: 240.00,
    bonus_buy_qty: 10,
    bonus_free_qty: 1,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000007',
    sku_code: 'MED-007',
    name: 'Senatix Vitamin C 500mg',
    generic_name: 'Ascorbic Acid',
    category: 'Chewable',
    strength: '500mg',
    pack_size: '10 x 10 Orange Chewable',
    stock: 520,
    low_stock_alert_level: 80,
    cost_price_dp: 60.00,
    trade_price_tp: 85.00,
    mrp: 110.00,
    bonus_buy_qty: 15,
    bonus_free_qty: 2,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000008',
    sku_code: 'MED-008',
    name: 'Cardizem-SR 90',
    generic_name: 'Diltiazem HCl',
    category: 'Capsule',
    strength: '90mg',
    pack_size: '3 x 10 Strip Box',
    stock: 140,
    low_stock_alert_level: 30,
    cost_price_dp: 160.00,
    trade_price_tp: 220.00,
    mrp: 275.00,
    bonus_buy_qty: 10,
    bonus_free_qty: 1,
    is_active: true,
  },
];

const initialBatches: ProductBatch[] = [
  { id: 'd0000000-0000-0000-0000-000000000001', product_id: 'c0000000-0000-0000-0000-000000000001', batch_no: 'NP-25A01', mfg_date: '2025-01-10', exp_date: '2027-01-09', cost_price_dp: 120, trade_price_tp: 160, mrp: 200, warehouse_qty: 220, is_active: true },
  { id: 'd0000000-0000-0000-0000-000000000002', product_id: 'c0000000-0000-0000-0000-000000000001', batch_no: 'NP-25B02', mfg_date: '2025-03-01', exp_date: '2027-02-28', cost_price_dp: 120, trade_price_tp: 160, mrp: 200, warehouse_qty: 100, is_active: true },
  { id: 'd0000000-0000-0000-0000-000000000003', product_id: 'c0000000-0000-0000-0000-000000000002', batch_no: 'SC-24K11', mfg_date: '2024-11-15', exp_date: '2026-11-14', cost_price_dp: 180, trade_price_tp: 240, mrp: 300, warehouse_qty: 210, is_active: true },
  { id: 'd0000000-0000-0000-0000-000000000004', product_id: 'c0000000-0000-0000-0000-000000000003', batch_no: 'GL-25C03', mfg_date: '2025-02-01', exp_date: '2027-01-31', cost_price_dp: 210, trade_price_tp: 280, mrp: 350, warehouse_qty: 450, is_active: true },
  { id: 'd0000000-0000-0000-0000-000000000005', product_id: 'c0000000-0000-0000-0000-000000000004', batch_no: 'CF-24J09', mfg_date: '2024-10-01', exp_date: '2026-09-30', cost_price_dp: 110, trade_price_tp: 150, mrp: 185, warehouse_qty: 95, is_active: true },
  { id: 'd0000000-0000-0000-0000-000000000006', product_id: 'c0000000-0000-0000-0000-000000000005', batch_no: 'DM-24L02', mfg_date: '2024-12-01', exp_date: '2026-11-30', cost_price_dp: 45, trade_price_tp: 65, mrp: 85, warehouse_qty: 160, is_active: true },
  { id: 'd0000000-0000-0000-0000-000000000007', product_id: 'c0000000-0000-0000-0000-000000000006', batch_no: 'NB-25B01', mfg_date: '2025-02-15', exp_date: '2027-02-14', cost_price_dp: 140, trade_price_tp: 190, mrp: 240, warehouse_qty: 280, is_active: true },
  { id: 'd0000000-0000-0000-0000-000000000008', product_id: 'c0000000-0000-0000-0000-000000000007', batch_no: 'VC-25A05', mfg_date: '2025-01-05', exp_date: '2026-12-31', cost_price_dp: 60, trade_price_tp: 85, mrp: 110, warehouse_qty: 520, is_active: true },
  { id: 'd0000000-0000-0000-0000-000000000009', product_id: 'c0000000-0000-0000-0000-000000000008', batch_no: 'CD-25A02', mfg_date: '2025-01-20', exp_date: '2027-01-19', cost_price_dp: 160, trade_price_tp: 220, mrp: 275, warehouse_qty: 140, is_active: true },
];

const initialEmpStock: EmpStock[] = [
  { id: 'e0000000-0000-0000-0000-000000000001', emp_id: 'EMP-001', product_id: 'c0000000-0000-0000-0000-000000000001', batch_id: 'd0000000-0000-0000-0000-000000000001', qty: 25 },
  { id: 'e0000000-0000-0000-0000-000000000002', emp_id: 'EMP-001', product_id: 'c0000000-0000-0000-0000-000000000002', batch_id: 'd0000000-0000-0000-0000-000000000003', qty: 15 },
  { id: 'e0000000-0000-0000-0000-000000000003', emp_id: 'EMP-001', product_id: 'c0000000-0000-0000-0000-000000000003', batch_id: 'd0000000-0000-0000-0000-000000000004', qty: 30 },
  { id: 'e0000000-0000-0000-0000-000000000004', emp_id: 'EMP-002', product_id: 'c0000000-0000-0000-0000-000000000001', batch_id: 'd0000000-0000-0000-0000-000000000001', qty: 20 },
  { id: 'e0000000-0000-0000-0000-000000000005', emp_id: 'EMP-002', product_id: 'c0000000-0000-0000-0000-000000000006', batch_id: 'd0000000-0000-0000-0000-000000000007', qty: 15 },
  { id: 'e0000000-0000-0000-0000-000000000006', emp_id: 'EMP-003', product_id: 'c0000000-0000-0000-0000-000000000007', batch_id: 'd0000000-0000-0000-0000-000000000008', qty: 40 },
];

const initialInvoices: Invoice[] = [];

const initialLedger: LedgerEntry[] = [];

const initialExpenses: Expense[] = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    expense_date: new Date().toISOString().split('T')[0],
    category: 'Office_Warehouse_Rent',
    title: 'Mirpur Central Godown Rent',
    amount: 35000,
    payment_method: 'Bank',
    entered_by_emp_id: 'ADM-01',
    entered_by_name: 'Samin Yeasar',
  },
  {
    id: 'e1000000-0000-0000-0000-000000000002',
    expense_date: new Date().toISOString().split('T')[0],
    category: 'Electricity_Internet',
    title: 'DESCO Monthly Electric Bill & Fiber Net',
    amount: 6800,
    payment_method: 'bKash',
    entered_by_emp_id: 'ACC-01',
    entered_by_name: 'Nazrul Islam',
  },
  {
    id: 'e1000000-0000-0000-0000-000000000003',
    expense_date: new Date().toISOString().split('T')[0],
    category: 'Delivery_Van_Fuel',
    title: 'Delivery Van Fuel & CNG Refill',
    amount: 3200,
    payment_method: 'Cash',
    entered_by_emp_id: 'DEL-01',
    entered_by_name: 'Sohel Rana',
  },
  {
    id: 'e1000000-0000-0000-0000-000000000004',
    expense_date: new Date().toISOString().split('T')[0],
    category: 'Staff_Tea_Entertainment',
    title: 'Weekly Staff Tea & Office Refreshments',
    amount: 1450,
    payment_method: 'Cash',
    entered_by_emp_id: 'STR-01',
    entered_by_name: 'Abdur Rahim',
  },
];

const initialAttendance: Attendance[] = [
  { id: 'att-1', emp_id: 'ADM-01', work_date: '2026-11-03', status: 'Present_Office', ta_da_amount_earned: 500, employee_name: 'Samin Yeasar' },
  { id: 'att-2', emp_id: 'EXE-01', work_date: '2026-11-03', status: 'Present_Office', ta_da_amount_earned: 600, employee_name: 'Dr. Rafiqul Islam' },
  { id: 'att-3', emp_id: 'EMP-001', work_date: '2026-11-03', status: 'Present_Market_Duty', market_id: 'mkt-1', ta_da_amount_earned: 350, employee_name: 'Tanvir Hossain', market_name: 'Mirpur-10' },
  { id: 'att-4', emp_id: 'EMP-002', work_date: '2026-11-03', status: 'Present_Market_Duty', market_id: 'mkt-2', ta_da_amount_earned: 350, employee_name: 'Shakib Al Hasan', market_name: 'Dhanmondi' },
  { id: 'att-5', emp_id: 'EMP-003', work_date: '2026-11-03', status: 'Present_Market_Duty', market_id: 'mkt-3', ta_da_amount_earned: 350, employee_name: 'Mehedi Hasan', market_name: 'Uttara' },
  { id: 'att-6', emp_id: 'EMP-004', work_date: '2026-11-03', status: 'Leave', ta_da_amount_earned: 0, employee_name: 'Rakibul Islam' },
];

const initialTargets: EmployeeTarget[] = [
  { id: 'tar-1', emp_id: 'EMP-001', month_year: '2026-11', target_sales_amount: 350000, achieved_sales_amount: 145000, target_collection_amount: 320000, achieved_collection_amount: 128000, employee_name: 'Tanvir Hossain' },
  { id: 'tar-2', emp_id: 'EMP-002', month_year: '2026-11', target_sales_amount: 300000, achieved_sales_amount: 110000, target_collection_amount: 280000, achieved_collection_amount: 95000, employee_name: 'Shakib Al Hasan' },
  { id: 'tar-3', emp_id: 'EMP-003', month_year: '2026-11', target_sales_amount: 280000, achieved_sales_amount: 84000, target_collection_amount: 260000, achieved_collection_amount: 72000, employee_name: 'Mehedi Hasan' },
];

const initialPayroll: Payroll[] = [
  { id: 'pay-1', salary_month: '2026-10', emp_id: 'EMP-001', working_days: 26, base_salary: 28000, total_ta_da_earned: 9100, sales_commission_earned: 7500, festival_or_extra_bonus: 0, advance_salary_deducted: 2000, net_salary_payable: 42600, paid_amount: 42600, payment_status: 'Paid', paid_date: '2026-11-01', payment_method: 'Bank', employee_name: 'Tanvir Hossain', designation: 'Senior Sales Officer (MPO)' },
  { id: 'pay-2', salary_month: '2026-10', emp_id: 'EMP-002', working_days: 25, base_salary: 26000, total_ta_da_earned: 8750, sales_commission_earned: 5400, festival_or_extra_bonus: 0, advance_salary_deducted: 0, net_salary_payable: 40150, paid_amount: 40150, payment_status: 'Paid', paid_date: '2026-11-01', payment_method: 'Bank', employee_name: 'Shakib Al Hasan', designation: 'Territory Sales Officer' },
];

// IN-BROWSER PERSISTENT STORE CLASS
class ERPStore {
  private markets: Market[] = initialMarkets;
  private employees: Employee[] = initialEmployees;
  private customers: Customer[] = initialCustomers;
  private suppliers: Supplier[] = initialSuppliers;
  private products: Product[] = initialProducts;
  private batches: ProductBatch[] = initialBatches;
  private empStock: EmpStock[] = initialEmpStock;
  private stockTransfers: StockTransfer[] = [];
  private invoices: Invoice[] = initialInvoices;
  private purchases: Purchase[] = [];
  private returns: SalesReturn[] = [];
  private damagedStock: DamagedExpiredStock[] = [];
  private ledger: LedgerEntry[] = initialLedger;
  private expenses: Expense[] = initialExpenses;
  private attendance: Attendance[] = initialAttendance;
  private targets: EmployeeTarget[] = initialTargets;
  private payroll: Payroll[] = initialPayroll;
  private doctors: Doctor[] = initialDoctors;
  private doctorExpenses: DoctorExpense[] = initialDoctorExpenses;
  private activePortal: 'hq' | 'field' = 'hq';

  private currentUser: Employee = initialEmployees[0]; // Default Super Admin for instant preview
  private listeners: Set<() => void> = new Set();
  private initialized = false;
  private isSyncingWithCloud = false;
  private lastCloudSyncTime: Date | null = null;
  private cloudSyncError: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      if (isSupabaseConfigured()) {
        setTimeout(() => {
          this.syncWithCloud();
        }, 1200);
      }
    }
  }

  public async syncWithCloud(): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase is not configured yet. Operating in local storage mode.' };
    }
    this.isSyncingWithCloud = true;
    try {
      const [
        cloudProducts,
        cloudEmployees,
        cloudBatches,
        cloudEmpStock,
        cloudInvoices,
        cloudExpenses,
        cloudDoctors,
        cloudDoctorExpenses,
        cloudAttendance,
        cloudPayroll,
        cloudLedger,
      ] = await Promise.all([
        fetchFromCloud<Product>('products'),
        fetchFromCloud<Employee>('employees'),
        fetchFromCloud<ProductBatch>('product_batches'),
        fetchFromCloud<EmpStock>('emp_stock'),
        fetchFromCloud<Invoice>('invoices'),
        fetchFromCloud<Expense>('expenses'),
        fetchFromCloud<Doctor>('doctors'),
        fetchFromCloud<DoctorExpense>('doctor_expenses'),
        fetchFromCloud<Attendance>('attendance'),
        fetchFromCloud<Payroll>('payroll'),
        fetchFromCloud<LedgerEntry>('ledger'),
      ]);

      let updatedAny = false;

      if (cloudProducts && cloudProducts.length > 0) {
        this.products = cloudProducts;
        updatedAny = true;
      }
      if (cloudEmployees && cloudEmployees.length > 0) {
        this.employees = cloudEmployees;
        updatedAny = true;
      }
      if (cloudBatches && cloudBatches.length > 0) {
        this.batches = cloudBatches;
        updatedAny = true;
      }
      if (cloudEmpStock && cloudEmpStock.length > 0) {
        this.empStock = cloudEmpStock;
        updatedAny = true;
      }
      if (cloudInvoices && cloudInvoices.length > 0) {
        this.invoices = cloudInvoices;
        updatedAny = true;
      }
      if (cloudExpenses && cloudExpenses.length > 0) {
        this.expenses = cloudExpenses;
        updatedAny = true;
      }
      if (cloudDoctors && cloudDoctors.length > 0) {
        this.doctors = cloudDoctors;
        updatedAny = true;
      }
      if (cloudDoctorExpenses && cloudDoctorExpenses.length > 0) {
        this.doctorExpenses = cloudDoctorExpenses;
        updatedAny = true;
      }
      if (cloudAttendance && cloudAttendance.length > 0) {
        this.attendance = cloudAttendance;
        updatedAny = true;
      }
      if (cloudPayroll && cloudPayroll.length > 0) {
        this.payroll = cloudPayroll;
        updatedAny = true;
      }
      if (cloudLedger && cloudLedger.length > 0) {
        this.ledger = cloudLedger;
        updatedAny = true;
      }

      this.lastCloudSyncTime = new Date();
      this.cloudSyncError = null;

      if (updatedAny) {
        this.saveToStorage();
        this.notify();
      }

      return { success: true, message: 'Cloud database synchronized successfully.' };
    } catch (err: any) {
      this.cloudSyncError = err?.message || 'Cloud sync failed';
      return { success: false, message: this.cloudSyncError || 'Sync error' };
    } finally {
      this.isSyncingWithCloud = false;
      this.notify();
    }
  }

  public getCloudStatus() {
    return {
      isConfigured: isSupabaseConfigured(),
      isSyncing: this.isSyncingWithCloud,
      lastSynced: this.lastCloudSyncTime,
      error: this.cloudSyncError,
    };
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('senatix_erp_markets', JSON.stringify(this.markets));
      localStorage.setItem('senatix_erp_employees', JSON.stringify(this.employees));
      localStorage.setItem('senatix_erp_customers', JSON.stringify(this.customers));
      localStorage.setItem('senatix_erp_suppliers', JSON.stringify(this.suppliers));
      localStorage.setItem('senatix_erp_products', JSON.stringify(this.products));
      localStorage.setItem('senatix_erp_batches', JSON.stringify(this.batches));
      localStorage.setItem('senatix_erp_emp_stock', JSON.stringify(this.empStock));
      localStorage.setItem('senatix_erp_invoices', JSON.stringify(this.invoices));
      localStorage.setItem('senatix_erp_ledger', JSON.stringify(this.ledger));
      localStorage.setItem('senatix_erp_expenses', JSON.stringify(this.expenses));
      localStorage.setItem('senatix_erp_attendance', JSON.stringify(this.attendance));
      localStorage.setItem('senatix_erp_payroll', JSON.stringify(this.payroll));
      localStorage.setItem('senatix_erp_doctors', JSON.stringify(this.doctors));
      localStorage.setItem('senatix_erp_doctor_expenses', JSON.stringify(this.doctorExpenses));
      localStorage.setItem('senatix_erp_portal', this.activePortal);
      localStorage.setItem('senatix_erp_user', JSON.stringify(this.currentUser));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
    this.notify();
  }

  private loadFromStorage() {
    if (this.initialized) return;
    try {
      const get = (key: string) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      };

      this.markets = get('senatix_erp_markets') || initialMarkets;
      this.employees = get('senatix_erp_employees') || initialEmployees;
      this.customers = get('senatix_erp_customers') || initialCustomers;
      this.suppliers = get('senatix_erp_suppliers') || initialSuppliers;
      this.products = get('senatix_erp_products') || initialProducts;
      this.batches = get('senatix_erp_batches') || initialBatches;
      this.empStock = get('senatix_erp_emp_stock') || initialEmpStock;
      this.invoices = get('senatix_erp_invoices') || initialInvoices;
      this.ledger = get('senatix_erp_ledger') || initialLedger;
      this.expenses = get('senatix_erp_expenses') || initialExpenses;
      this.attendance = get('senatix_erp_attendance') || initialAttendance;
      this.payroll = get('senatix_erp_payroll') || initialPayroll;
      this.doctors = get('senatix_erp_doctors') || initialDoctors;
      this.doctorExpenses = get('senatix_erp_doctor_expenses') || initialDoctorExpenses;
      this.activePortal = (localStorage.getItem('senatix_erp_portal') as 'hq' | 'field') || 'hq';
      this.currentUser = get('senatix_erp_user') || initialEmployees[0];
      this.initialized = true;
    } catch (e) {
      console.warn('Storage load error:', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // AUTH & USER
  public getCurrentUser(): Employee {
    return this.currentUser;
  }

  public setCurrentUser(emp: Employee) {
    this.currentUser = emp;
    this.saveToStorage();
  }

  public getActivePortal(): 'hq' | 'field' {
    return this.activePortal;
  }

  public setActivePortal(portal: 'hq' | 'field') {
    this.activePortal = portal;
    this.saveToStorage();
  }

  public async loginWithCredentials(
    identifier: string,
    secret: string
  ): Promise<{ success: boolean; user?: Employee; message?: string }> {
    const cleanId = identifier.trim().toLowerCase().replace('@senatix.local', '');
    const cleanSecret = secret.trim();

    if (!cleanId || !cleanSecret) {
      return {
        success: false,
        message: 'অনুগ্রহ করে আইডি এবং পাসওয়ার্ড উভয় তথ্যই প্রদান করুন।',
      };
    }

    // Master/standard passwords accepted across the system
    const validMasterPasswords = [
      'senatix1234@',
      'saminsami1234',
      'senatix2026@',
      'senatixadmin2026!',
    ];

    // STEP 1: Attempt Authentication via Supabase Auth (for customized email/password users created in Supabase Dashboard)
    if (isSupabaseConfigured() && cleanId.includes('@')) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password: cleanSecret,
        });

        if (!authError && authData?.user) {
          const userEmail = (authData.user.email || cleanId).toLowerCase();

          // Refresh employees from database to get latest records
          try {
            const { data: cloudEmp } = await supabase.from('employees').select('*');
            if (cloudEmp && cloudEmp.length > 0) {
              this.employees = cloudEmp;
            }
          } catch (e) {}

          let matched = this.employees.find(
            (e) =>
              e.emp_id.toLowerCase() === userEmail ||
              e.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')
          );

          if (!matched) {
            // First time customized Supabase Auth user: automatically create active administrator profile
            matched = {
              emp_id: `ADM-${authData.user.id.substring(0, 6).toUpperCase()}`,
              name: authData.user.user_metadata?.name || userEmail.split('@')[0] || 'Administrator',
              phone: authData.user.phone || '01711000000',
              designation: 'System Administrator',
              role: 'super_admin',
              is_active: true,
              base_salary: 0,
              daily_ta_da: 0,
              commission_percent: 0,
              current_due_balance: 0,
              salary_advance_balance: 0,
            };
            this.employees.unshift(matched);
            syncRecordToCloud('employees', matched);
          }

          this.currentUser = matched;
          this.activePortal = 'hq';
          this.saveToStorage();
          return { success: true, user: matched };
        }
      } catch (err) {
        // Fall through to database / employee lookup
      }
    }

    // STEP 2: Fetch latest employees from Supabase database (in case new staff were added)
    if (isSupabaseConfigured()) {
      try {
        const { data: cloudEmp } = await supabase.from('employees').select('*');
        if (cloudEmp && cloudEmp.length > 0) {
          this.employees = cloudEmp;
        }
      } catch (err) {}
    }

    // STEP 3: Match Employee by ID, Email or Phone
    const isSuperAdminIdentifier =
      cleanId === 'adm-01' ||
      cleanId === 'senatixwellness@gmail.com' ||
      cleanId === 'saminsami73@gmail.com' ||
      cleanId === '01711000001' ||
      cleanId === 'samin' ||
      cleanId === 'admin';

    const isManagingDirector =
      cleanId === 'exe-01' ||
      cleanId === '01711000002' ||
      cleanId === '01819000002';

    let found: Employee | undefined;
    if (isSuperAdminIdentifier) {
      found = this.employees.find((e) => e.role === 'super_admin') || this.employees[0];
    } else if (isManagingDirector) {
      found = this.employees.find((e) => e.role === 'executor') || this.employees[1];
    } else {
      found = this.employees.find(
        (e) =>
          e.emp_id.toLowerCase() === cleanId ||
          e.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')
      );
    }

    if (!found) {
      return {
        success: false,
        message: 'প্রদত্ত আইডি বা ইমেইল পাওয়া যায়নি। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।',
      };
    }

    // STEP 4: Password Verification
    const isMasterPassword = validMasterPasswords.includes(cleanSecret.toLowerCase());
    if (!isMasterPassword) {
      // If the password doesn't match master passwords, check Supabase Auth for this user's email if available
      let authVerified = false;
      if (isSupabaseConfigured()) {
        try {
          const tryEmail = cleanId.includes('@') ? cleanId : `${cleanId}@senatix.local`;
          const { data } = await supabase.auth.signInWithPassword({
            email: tryEmail,
            password: cleanSecret,
          });
          if (data?.user) {
            authVerified = true;
          }
        } catch (e) {}
      }

      if (!authVerified) {
        return {
          success: false,
          message: 'পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।',
        };
      }
    }

    // STEP 5: Strict Role Control (Admins, Executives, Managers, Accountants, Store Keepers)
    const allowedRoles = ['super_admin', 'executor', 'manager', 'accountant', 'store_keeper'];
    if (!allowedRoles.includes(found.role)) {
      return {
        success: false,
        message: 'অননুমোদিত প্রবেশাধিকার: এই সিস্টেমটি শুধুমাত্র ব্যবস্থাপনা কর্তৃপক্ষ ও এডমিনদের জন্য সংরক্ষিত।',
      };
    }

    this.currentUser = found;
    this.activePortal = 'hq';
    this.saveToStorage();
    return { success: true, user: found };
  }

  // MARKETS
  public getMarkets(): Market[] {
    return this.markets;
  }

  public addMarket(m: Omit<Market, 'id'>) {
    const newMarket: Market = {
      ...m,
      id: `mkt-${Date.now()}`,
    };
    this.markets.push(newMarket);
    this.saveToStorage();
    return newMarket;
  }

  // EMPLOYEES
  public getEmployees(): Employee[] {
    return this.employees.map((e) => {
      const mkt = this.markets.find((m) => m.id === e.primary_market_id);
      return { ...e, market_name: mkt?.name };
    });
  }

  public addEmployee(emp: Employee) {
    this.employees.push(emp);
    this.saveToStorage();
    syncRecordToCloud('employees', emp);
    return emp;
  }

  public updateEmployee(emp_id: string, updates: Partial<Employee>) {
    this.employees = this.employees.map((e) => (e.emp_id === emp_id ? { ...e, ...updates } : e));
    if (this.currentUser.emp_id === emp_id) {
      this.currentUser = { ...this.currentUser, ...updates };
    }
    this.saveToStorage();
    const updated = this.employees.find((e) => e.emp_id === emp_id);
    if (updated) {
      syncRecordToCloud('employees', updated);
    }
  }

  public collectEmployeeCashDue(params: {
    emp_id: string;
    amount: number;
    payment_method: 'Cash' | 'bKash' | 'Bank';
    notes?: string;
  }): { success: boolean; balanceRemaining: number; voucherRef: string } {
    const emp = this.employees.find((e) => e.emp_id === params.emp_id);
    if (!emp) {
      throw new Error('Employee not found');
    }
    if (params.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    emp.current_due_balance = Math.max(0, emp.current_due_balance - params.amount);

    const voucherRef = `VCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newLedger: LedgerEntry = {
      id: generateUUID(),
      date_time: new Date().toISOString(),
      date_only: new Date().toISOString().split('T')[0],
      account_type: 'Employee',
      emp_id: emp.emp_id,
      invoice_ref: voucherRef,
      payment_method: params.payment_method,
      description: `ফিল্ড বিক্রয় ক্যাশ জমা: ${emp.name} (${params.notes || 'ক্যাশ ভাউচার'})`,
      debit: 0,
      credit: params.amount,
      balance: emp.current_due_balance,
      party_name: emp.name,
    };

    this.ledger.unshift(newLedger);
    this.saveToStorage();

    syncRecordToCloud('employees', emp);
    syncRecordToCloud('ledger', newLedger);

    return {
      success: true,
      balanceRemaining: emp.current_due_balance,
      voucherRef,
    };
  }

  // CUSTOMERS
  public getCustomers(): Customer[] {
    return this.customers.map((c) => {
      const mkt = this.markets.find((m) => m.id === c.market_id);
      const emp = this.employees.find((e) => e.emp_id === c.assigned_emp_id);
      return {
        ...c,
        market_name: mkt?.name,
        assigned_emp_name: emp?.name,
      };
    });
  }

  public addCustomer(cust: Omit<Customer, 'id' | 'current_due_balance'>) {
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      current_due_balance: 0,
    };
    this.customers.push(newCust);
    this.saveToStorage();
    return newCust;
  }

  public collectCustomerDue(customerId: string, amount: number, method: string, note?: string) {
    const cust = this.customers.find((c) => c.id === customerId);
    if (!cust) return;

    cust.current_due_balance = Math.max(0, cust.current_due_balance - amount);

    // Add to ledger
    const newLedger: LedgerEntry = {
      id: generateUUID(),
      date_time: new Date().toISOString(),
      date_only: new Date().toISOString().split('T')[0],
      account_type: 'Customer',
      customer_id: cust.id,
      emp_id: this.currentUser.emp_id,
      payment_method: method,
      description: `Baki Collection: ${cust.shop_name} (${note || 'Field Receipt'})`,
      debit: 0,
      credit: amount,
      balance: cust.current_due_balance,
      party_name: cust.shop_name,
    };
    this.ledger.unshift(newLedger);
    this.saveToStorage();
    syncRecordToCloud('ledger', newLedger);
  }

  // SUPPLIERS
  public getSuppliers(): Supplier[] {
    return this.suppliers;
  }

  public addSupplier(s: Omit<Supplier, 'id' | 'payable_balance'>) {
    const newSup: Supplier = {
      ...s,
      id: `sup-${Date.now()}`,
      payable_balance: 0,
    };
    this.suppliers.push(newSup);
    this.saveToStorage();
    return newSup;
  }

  // DOCTORS & PRESCRIBERS
  public getDoctors(marketId?: string, empId?: string): Doctor[] {
    let list = this.doctors.map((d) => {
      const mkt = this.markets.find((m) => m.id === d.market_id);
      const emp = this.employees.find((e) => e.emp_id === d.assigned_emp_id);
      return {
        ...d,
        market_name: mkt?.name,
        assigned_emp_name: emp?.name,
      };
    });

    if (marketId && marketId !== 'all') {
      list = list.filter((d) => d.market_id === marketId);
    }
    if (empId && empId !== 'all') {
      list = list.filter((d) => d.assigned_emp_id === empId);
    }
    return list;
  }

  public getDoctorById(id: string): Doctor | undefined {
    return this.getDoctors().find((d) => d.id === id);
  }

  public addDoctor(doc: Omit<Doctor, 'id' | 'created_at'>): Doctor {
    const newDoc: Doctor = {
      ...doc,
      id: generateUUID(),
      doctor_code: doc.doctor_code || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      prescriptions_written_monthly: doc.prescriptions_written_monthly || 0,
      total_promotional_expense: doc.total_promotional_expense || 0,
      is_active: doc.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    this.doctors.unshift(newDoc);
    this.saveToStorage();
    syncRecordToCloud('doctors', newDoc);
    return newDoc;
  }

  public updateDoctor(id: string, updates: Partial<Doctor>): Doctor | null {
    const idx = this.doctors.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.doctors[idx] = { ...this.doctors[idx], ...updates };
    this.saveToStorage();
    syncRecordToCloud('doctors', this.doctors[idx]);
    return this.doctors[idx];
  }

  public deleteDoctor(id: string): boolean {
    const initialLen = this.doctors.length;
    this.doctors = this.doctors.filter((d) => d.id !== id);
    if (this.doctors.length !== initialLen) {
      this.saveToStorage();
      deleteRecordFromCloud('doctors', 'id', id);
      return true;
    }
    return false;
  }

  // DOCTOR PROMOTIONAL EXPENSES & PRESCRIPTIONS
  public getDoctorExpenses(doctorId?: string, empId?: string): DoctorExpense[] {
    let list = this.doctorExpenses.map((exp) => {
      const doc = this.doctors.find((d) => d.id === exp.doctor_id);
      const emp = this.employees.find((e) => e.emp_id === exp.emp_id);
      return {
        ...exp,
        doctor_name: doc?.name || 'Unknown Doctor',
        employee_name: emp?.name || 'Field Officer',
      };
    });

    if (doctorId && doctorId !== 'all') {
      list = list.filter((e) => e.doctor_id === doctorId);
    }
    if (empId && empId !== 'all') {
      list = list.filter((e) => e.emp_id === empId);
    }
    return list.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
  }

  public addDoctorExpense(exp: Omit<DoctorExpense, 'id' | 'created_at'>): DoctorExpense {
    const newExpense: DoctorExpense = {
      ...exp,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    this.doctorExpenses.unshift(newExpense);

    // Update doctor's cumulative totals automatically:
    const doc = this.doctors.find((d) => d.id === exp.doctor_id);
    if (doc) {
      doc.total_promotional_expense = (doc.total_promotional_expense || 0) + Number(exp.amount || 0);
      if (exp.prescriptions_written_count && exp.prescriptions_written_count > 0) {
        doc.prescriptions_written_monthly = (doc.prescriptions_written_monthly || 0) + Number(exp.prescriptions_written_count);
      }
      syncRecordToCloud('doctors', doc);
    }

    // Auto-record under company operational expenses if financial cost occurred
    if (exp.amount > 0) {
      const promoExp: Expense = {
        id: generateUUID(),
        expense_date: exp.expense_date,
        category: 'Doctor_Gift',
        title: `Doctor Promo: ${doc?.name || 'Doctor'} - ${exp.title}`,
        amount: exp.amount,
        payment_method: 'Cash',
        entered_by_emp_id: exp.emp_id,
        entered_by_name: this.currentUser.name,
      };
      this.expenses.unshift(promoExp);
      syncRecordToCloud('expenses', promoExp);
    }

    this.saveToStorage();
    syncRecordToCloud('doctor_expenses', newExpense);
    return newExpense;
  }

  // PRODUCTS & BATCHES
  public getProducts(): Product[] {
    return this.products.map((p) => {
      const sup = this.suppliers.find((s) => s.id === p.supplier_id);
      const pBatches = this.batches.filter((b) => b.product_id === p.id && b.is_active);
      const totalWarehouseStock = pBatches.reduce((acc, b) => acc + b.warehouse_qty, 0);
      return {
        ...p,
        stock: totalWarehouseStock,
        supplier_name: sup?.name,
        batches: pBatches,
      };
    });
  }

  public addProduct(prod: Omit<Product, 'id' | 'stock'>) {
    const newProd: Product = {
      ...prod,
      id: generateUUID(),
      stock: 0,
    };
    this.products.push(newProd);
    this.saveToStorage();
    syncRecordToCloud('products', newProd);
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>) {
    this.products = this.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    this.saveToStorage();
    const updated = this.products.find((p) => p.id === id);
    if (updated) {
      syncRecordToCloud('products', updated);
    }
  }

  public getProductBatches(): ProductBatch[] {
    const today = new Date();
    return this.batches.map((b) => {
      const prod = this.products.find((p) => p.id === b.product_id);
      const expDate = new Date(b.exp_date);
      const diffTime = expDate.getTime() - today.getTime();
      const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...b,
        product_name: prod?.name,
        days_to_expiry: daysToExpiry,
      };
    });
  }

  public addBatch(batch: Omit<ProductBatch, 'id'>) {
    const newBatch: ProductBatch = {
      ...batch,
      id: generateUUID(),
    };
    this.batches.push(newBatch);
    this.saveToStorage();
    syncRecordToCloud('product_batches', newBatch);
    return newBatch;
  }

  public moveBatchToQuarantine(batchId: string, qty: number, reason: string) {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch) return;

    const actualQty = Math.min(qty, batch.warehouse_qty);
    batch.warehouse_qty -= actualQty;

    const prod = this.products.find((p) => p.id === batch.product_id);
    const lossAmount = actualQty * batch.cost_price_dp;

    const entry: DamagedExpiredStock = {
      id: `dmg-${Date.now()}`,
      product_id: batch.product_id,
      batch_id: batch.id,
      qty: actualQty,
      reason: reason as any,
      loss_amount_at_dp: lossAmount,
      reported_by_emp_id: this.currentUser.emp_id,
      status: 'Kept_In_Quarantine',
      date_logged: new Date().toISOString().split('T')[0],
      product_name: prod?.name,
      batch_no: batch.batch_no,
    };

    this.damagedStock.push(entry);
    this.saveToStorage();
  }

  // EMPLOYEE VAN STOCK & TRANSFERS
  public getEmpStock(empId?: string): EmpStock[] {
    let list = this.empStock;
    if (empId) {
      list = list.filter((e) => e.emp_id === empId);
    }
    return list.map((es) => {
      const prod = this.products.find((p) => p.id === es.product_id);
      const batch = this.batches.find((b) => b.id === es.batch_id);
      return {
        ...es,
        product_name: prod?.name,
        batch_no: batch?.batch_no,
        tp: prod?.trade_price_tp,
      };
    });
  }

  public transferStockToEmployee(empId: string, productId: string, batchId: string, qty: number) {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch || batch.warehouse_qty < qty) {
      throw new Error('Not enough warehouse stock available in this batch');
    }

    batch.warehouse_qty -= qty;

    const existing = this.empStock.find(
      (e) => e.emp_id === empId && e.product_id === productId && e.batch_id === batchId
    );

    let targetEmpStock: EmpStock;
    if (existing) {
      existing.qty += qty;
      targetEmpStock = existing;
    } else {
      targetEmpStock = {
        id: generateUUID(),
        emp_id: empId,
        product_id: productId,
        batch_id: batchId,
        qty,
      };
      this.empStock.push(targetEmpStock);
    }

    const newTransfer = {
      id: generateUUID(),
      transfer_ref: `TRF-${Date.now().toString().slice(-6)}`,
      transfer_type: 'Warehouse_To_Employee' as const,
      emp_id: empId,
      product_id: productId,
      batch_id: batchId,
      qty,
      approved_by_emp_id: this.currentUser.emp_id,
      transfer_date: new Date().toISOString().split('T')[0],
    };
    this.stockTransfers.push(newTransfer);

    this.saveToStorage();
    syncRecordToCloud('product_batches', batch);
    syncRecordToCloud('emp_stock', targetEmpStock);
    syncRecordToCloud('stock_transfers', newTransfer);
  }

  public transferStockBackToWarehouse(empId: string, productId: string, batchId: string, qty: number) {
    const existing = this.empStock.find(
      (e) => e.emp_id === empId && e.product_id === productId && e.batch_id === batchId
    );
    if (!existing || existing.qty < qty) {
      throw new Error('Employee does not hold this much stock');
    }

    existing.qty -= qty;
    const batch = this.batches.find((b) => b.id === batchId);
    if (batch) {
      batch.warehouse_qty += qty;
    }

    const newTransfer = {
      id: generateUUID(),
      transfer_ref: `RTN-${Date.now().toString().slice(-6)}`,
      transfer_type: 'Employee_Return_To_Warehouse' as const,
      emp_id: empId,
      product_id: productId,
      batch_id: batchId,
      qty,
      approved_by_emp_id: this.currentUser.emp_id,
      transfer_date: new Date().toISOString().split('T')[0],
    };
    this.stockTransfers.push(newTransfer);

    this.saveToStorage();
    syncRecordToCloud('emp_stock', existing);
    if (batch) syncRecordToCloud('product_batches', batch);
    syncRecordToCloud('stock_transfers', newTransfer);
  }

  // POS BILLING & ORDERS (ATOMIC TRANSACTION)
  public completeSaleOrOrder(params: {
    customer_id?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    emp_id: string;
    stock_source: 'Employee_Stock' | 'Warehouse_Direct';
    order_status: 'Order_Booked' | 'Delivered_Final';
    items: {
      product_id: string;
      batch_id: string;
      qty: number;
      bonus_qty: number;
      unit_cost_dp: number;
      unit_price: number;
      discount_percent: number;
      total_price: number;
    }[];
    sub_total: number;
    discount_percent: number;
    discount_amount: number;
    net_payable: number;
    paid_amount: number;
    payment_method: any;
    notes?: string;
  }): Invoice {
    const cust = params.customer_id ? this.customers.find((c) => c.id === params.customer_id) : null;
    const emp = this.employees.find((e) => e.emp_id === params.emp_id);
    const mkt = cust ? this.markets.find((m) => m.id === cust.market_id) : null;

    const due_amount = Math.max(0, params.net_payable - params.paid_amount);
    const total_factory_cost = params.items.reduce(
      (acc, it) => acc + (it.qty + it.bonus_qty) * it.unit_cost_dp,
      0
    );

    const invoiceRef = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    // Format line items with names
    const fullItems = params.items.map((it) => {
      const prod = this.products.find((p) => p.id === it.product_id);
      const b = this.batches.find((batch) => batch.id === it.batch_id);
      return {
        ...it,
        product_name: prod?.name || 'Medicine',
        batch_no: b?.batch_no || 'Standard',
      };
    });

    const resolvedCustomerName = params.customer_name || cust?.shop_name || 'সাধারণ ক্রেতা';
    const resolvedCustomerPhone = params.customer_phone || cust?.phone || '';
    const resolvedCustomerAddress = params.customer_address || cust?.address || '';

    const newInvoice: Invoice = {
      id: generateUUID(),
      invoice_ref: invoiceRef,
      order_status: params.order_status,
      stock_source: params.stock_source,
      date_time: new Date().toISOString(),
      date_only: new Date().toISOString().split('T')[0],
      emp_id: params.emp_id,
      customer_id: params.customer_id || 'direct-customer',
      market_id: cust?.market_id || null,
      sub_total: params.sub_total,
      discount_percent: params.discount_percent,
      discount_amount: params.discount_amount,
      net_payable: params.net_payable,
      paid_amount: params.paid_amount,
      due_amount: due_amount,
      total_factory_cost_dp: total_factory_cost,
      payment_status: due_amount === 0 ? 'Paid' : params.paid_amount > 0 ? 'Partial' : 'Due',
      payment_method: params.payment_method,
      notes: params.notes,
      customer_name: resolvedCustomerName,
      customer_phone: resolvedCustomerPhone,
      customer_address: resolvedCustomerAddress,
      employee_name: emp?.name,
      market_name: mkt?.name || 'সরাসরি বিক্রয়',
      items: fullItems,
    };

    // Deduct stock if Delivered_Final
    if (params.order_status === 'Delivered_Final') {
      params.items.forEach((item) => {
        const totalDeduct = item.qty + item.bonus_qty;
        if (params.stock_source === 'Employee_Stock') {
          const es = this.empStock.find(
            (e) => e.emp_id === params.emp_id && e.product_id === item.product_id && e.batch_id === item.batch_id
          );
          if (es) {
            es.qty = Math.max(0, es.qty - totalDeduct);
            syncRecordToCloud('emp_stock', es);
          } else {
            // If employee sold from available batch, also deduct from batch if not in bag
            const batch = this.batches.find((b) => b.id === item.batch_id);
            if (batch) {
              batch.warehouse_qty = Math.max(0, batch.warehouse_qty - totalDeduct);
              syncRecordToCloud('product_batches', batch);
            }
          }
        } else {
          const batch = this.batches.find((b) => b.id === item.batch_id);
          if (batch) {
            batch.warehouse_qty = Math.max(0, batch.warehouse_qty - totalDeduct);
            syncRecordToCloud('product_batches', batch);
          }
        }
      });
    }

    // Update Customer Baki Balance
    if (cust) {
      cust.current_due_balance += due_amount;
    }

    // Ledger Entry for Billed Amount
    this.ledger.unshift({
      id: `led-${Date.now()}-1`,
      date_time: new Date().toISOString(),
      date_only: new Date().toISOString().split('T')[0],
      account_type: 'Customer',
      customer_id: cust?.id,
      emp_id: params.emp_id,
      invoice_ref: invoiceRef,
      payment_method: params.payment_method,
      description: `New Bill Issued (${invoiceRef})`,
      debit: params.net_payable,
      credit: 0,
      balance: cust?.current_due_balance || 0,
      party_name: cust?.shop_name,
    });

    // Ledger Entry for Payment Received (if any)
    if (params.paid_amount > 0) {
      this.ledger.unshift({
        id: `led-${Date.now()}-2`,
        date_time: new Date().toISOString(),
        date_only: new Date().toISOString().split('T')[0],
        account_type: 'Customer',
        customer_id: cust?.id,
        emp_id: params.emp_id,
        invoice_ref: invoiceRef,
        payment_method: params.payment_method,
        description: `Payment Received on Bill (${invoiceRef})`,
        debit: 0,
        credit: params.paid_amount,
        balance: cust?.current_due_balance || 0,
        party_name: cust?.shop_name,
      });
    }

    this.invoices.unshift(newInvoice);
    this.saveToStorage();
    syncRecordToCloud('invoices', {
      id: newInvoice.id,
      invoice_ref: newInvoice.invoice_ref,
      order_status: newInvoice.order_status,
      stock_source: newInvoice.stock_source,
      date_time: newInvoice.date_time,
      date_only: newInvoice.date_only,
      emp_id: newInvoice.emp_id,
      customer_name: newInvoice.customer_name,
      customer_phone: newInvoice.customer_phone,
      customer_address: newInvoice.customer_address,
      sub_total: newInvoice.sub_total,
      discount_percent: newInvoice.discount_percent,
      discount_amount: newInvoice.discount_amount,
      net_payable: newInvoice.net_payable,
      paid_amount: newInvoice.paid_amount,
      due_amount: newInvoice.due_amount,
      total_factory_cost_dp: newInvoice.total_factory_cost_dp,
      payment_status: newInvoice.payment_status,
      payment_method: newInvoice.payment_method,
      notes: newInvoice.notes,
    });

    fullItems.forEach((item) => {
      syncRecordToCloud('sales', {
        id: generateUUID(),
        invoice_id: newInvoice.id,
        invoice_ref: newInvoice.invoice_ref,
        date_time: newInvoice.date_time,
        date_only: newInvoice.date_only,
        emp_id: newInvoice.emp_id,
        product_id: item.product_id,
        batch_id: item.batch_id,
        qty: item.qty,
        bonus_qty: item.bonus_qty,
        unit_cost_dp: item.unit_cost_dp,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        total_price: item.total_price,
        payment_status: newInvoice.payment_status,
      });
    });

    return newInvoice;
  }

  public getInvoices(): Invoice[] {
    return this.invoices;
  }

  public updateOrderStatus(invoiceId: string, newStatus: 'Packed_Ready' | 'Delivered_Final' | 'Cancelled') {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    const oldStatus = inv.order_status;
    inv.order_status = newStatus;

    // If transitioning to Delivered_Final from Order_Booked/Packed_Ready, deduct warehouse stock
    if (newStatus === 'Delivered_Final' && oldStatus !== 'Delivered_Final') {
      inv.items?.forEach((item) => {
        const batch = this.batches.find((b) => b.id === item.batch_id);
        if (batch) {
          batch.warehouse_qty = Math.max(0, batch.warehouse_qty - (item.qty + item.bonus_qty));
          syncRecordToCloud('product_batches', batch);
        }
      });
    }

    this.saveToStorage();
    syncRecordToCloud('invoices', inv);
  }

  // PURCHASES (GRN)
  public getPurchases(): Purchase[] {
    return this.purchases;
  }

  public addPurchaseGRN(params: {
    supplier_id: string;
    factory_challan_no: string;
    items: {
      product_id: string;
      batch_no: string;
      exp_date: string;
      mfg_date?: string;
      received_qty: number;
      free_bonus_qty: number;
      unit_cost_dp: number;
      trade_price_tp: number;
      mrp: number;
    }[];
    paid_amount: number;
    notes?: string;
  }) {
    const sup = this.suppliers.find((s) => s.id === params.supplier_id);
    const receiveRef = `RCV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    let totalCost = 0;
    const purchaseItems: any[] = [];

    params.items.forEach((item) => {
      const lineCost = item.received_qty * item.unit_cost_dp;
      totalCost += lineCost;

      // Check if batch exists, or create new batch
      let batch = this.batches.find(
        (b) => b.product_id === item.product_id && b.batch_no.toLowerCase() === item.batch_no.toLowerCase()
      );

      if (batch) {
        batch.warehouse_qty += item.received_qty + item.free_bonus_qty;
        batch.exp_date = item.exp_date;
        syncRecordToCloud('product_batches', batch);
      } else {
        batch = {
          id: generateUUID(),
          product_id: item.product_id,
          batch_no: item.batch_no,
          mfg_date: item.mfg_date || null,
          exp_date: item.exp_date,
          cost_price_dp: item.unit_cost_dp,
          trade_price_tp: item.trade_price_tp,
          mrp: item.mrp,
          warehouse_qty: item.received_qty + item.free_bonus_qty,
          is_active: true,
        };
        this.batches.push(batch);
        syncRecordToCloud('product_batches', batch);
      }

      purchaseItems.push({
        id: `pi-${Date.now()}-${Math.random()}`,
        product_id: item.product_id,
        batch_id: batch.id,
        received_qty: item.received_qty,
        free_bonus_qty: item.free_bonus_qty,
        unit_cost_dp: item.unit_cost_dp,
        line_total_cost: lineCost,
      });
    });

    const dueAmount = Math.max(0, totalCost - params.paid_amount);
    if (sup) {
      sup.payable_balance += dueAmount;
    }

    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      receive_ref: receiveRef,
      supplier_id: params.supplier_id,
      factory_challan_no: params.factory_challan_no,
      receive_date: new Date().toISOString().split('T')[0],
      total_cost_amount: totalCost,
      paid_amount: params.paid_amount,
      due_amount: dueAmount,
      notes: params.notes,
      created_by_emp_id: this.currentUser.emp_id,
      supplier_name: sup?.name,
      items: purchaseItems,
    };

    this.purchases.unshift(newPurchase);
    this.saveToStorage();
    return newPurchase;
  }

  // RETURNS & QUARANTINE
  public getReturns(): SalesReturn[] {
    return this.returns;
  }

  public getDamagedStock(): DamagedExpiredStock[] {
    return this.damagedStock;
  }

  public processReturn(params: {
    customer_id: string;
    product_id: string;
    batch_id: string;
    returned_qty: number;
    condition: 'Good_Resaleable' | 'Damaged_Broken' | 'Expired';
    credit_amount: number;
    notes?: string;
  }) {
    const cust = this.customers.find((c) => c.id === params.customer_id);
    const prod = this.products.find((p) => p.id === params.product_id);
    const batch = this.batches.find((b) => b.id === params.batch_id);

    if (cust) {
      cust.current_due_balance = Math.max(0, cust.current_due_balance - params.credit_amount);
    }

    if (params.condition === 'Good_Resaleable') {
      if (batch) {
        batch.warehouse_qty += params.returned_qty;
      }
    } else {
      this.damagedStock.push({
        id: `dmg-${Date.now()}`,
        product_id: params.product_id,
        batch_id: params.batch_id,
        qty: params.returned_qty,
        reason: 'Returned_Damaged_By_Pharmacy',
        loss_amount_at_dp: params.returned_qty * (batch?.cost_price_dp || 0),
        reported_by_emp_id: this.currentUser.emp_id,
        status: 'Kept_In_Quarantine',
        date_logged: new Date().toISOString().split('T')[0],
        product_name: prod?.name,
        batch_no: batch?.batch_no,
      });
    }

    const ret: SalesReturn = {
      id: `ret-${Date.now()}`,
      return_ref: `RTN-${Date.now().toString().slice(-6)}`,
      customer_id: params.customer_id,
      emp_id: this.currentUser.emp_id,
      product_id: params.product_id,
      batch_id: params.batch_id,
      returned_qty: params.returned_qty,
      condition: params.condition,
      credit_amount_reduced_from_due: params.credit_amount,
      return_date: new Date().toISOString().split('T')[0],
      notes: params.notes,
      customer_name: cust?.shop_name,
      product_name: prod?.name,
      batch_no: batch?.batch_no,
    };

    this.returns.unshift(ret);
    this.saveToStorage();
    return ret;
  }

  // LEDGER
  public getLedger(): LedgerEntry[] {
    return this.ledger;
  }

  // EXPENSES
  public getExpenses(): Expense[] {
    return this.expenses;
  }

  public addExpense(exp: Omit<Expense, 'id' | 'created_at'>) {
    const newExp: Expense = {
      ...exp,
      id: generateUUID(),
      created_at: new Date().toISOString(),
      entered_by_name: this.currentUser.name,
      entered_by_emp_id: exp.entered_by_emp_id || this.currentUser.emp_id,
    };
    this.expenses.unshift(newExp);
    this.saveToStorage();
    syncRecordToCloud('expenses', newExp);
    return newExp;
  }

  // ATTENDANCE & HR
  public getAttendance(date?: string): Attendance[] {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.employees.map((emp) => {
      const record = this.attendance.find((a) => a.emp_id === emp.emp_id && a.work_date === targetDate);
      const mkt = this.markets.find((m) => m.id === emp.primary_market_id);
      return {
        id: record?.id || `att-temp-${emp.emp_id}`,
        emp_id: emp.emp_id,
        work_date: targetDate,
        status: record ? record.status : 'Present_Market_Duty',
        ta_da_amount_earned: record ? record.ta_da_amount_earned : emp.daily_ta_da,
        employee_name: emp.name,
        employee_photo: emp.image_url,
        market_name: mkt?.name,
      };
    });
  }

  public markAttendance(empId: string, status: any, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const emp = this.employees.find((e) => e.emp_id === empId);
    const taDa = status === 'Present_Market_Duty' ? emp?.daily_ta_da || 350 : status === 'Present_Office' ? emp?.daily_ta_da || 300 : 0;

    let recToSync;
    const existingIndex = this.attendance.findIndex((a) => a.emp_id === empId && a.work_date === targetDate);
    if (existingIndex >= 0) {
      this.attendance[existingIndex].status = status;
      this.attendance[existingIndex].ta_da_amount_earned = taDa;
      recToSync = this.attendance[existingIndex];
    } else {
      recToSync = {
        id: generateUUID(),
        emp_id: empId,
        work_date: targetDate,
        status,
        ta_da_amount_earned: taDa,
        marked_by_emp_id: this.currentUser.emp_id,
        employee_name: emp?.name,
      };
      this.attendance.push(recToSync);
    }

    this.saveToStorage();
    syncRecordToCloud('attendance', recToSync);
  }

  // PAYROLL
  public getPayroll(): Payroll[] {
    return this.payroll;
  }

  public generateMonthlyPayroll(monthYear: string): Payroll[] {
    const generated: Payroll[] = this.employees.map((emp) => {
      // Find days marked present in month
      const empAttendances = this.attendance.filter((a) => a.emp_id === emp.emp_id && a.work_date.startsWith(monthYear));
      const workingDays = empAttendances.length || 26;
      const totalTaDa = empAttendances.reduce((acc, a) => acc + Number(a.ta_da_amount_earned || 0), 0) || emp.daily_ta_da * 26;

      // Invoices by employee in this month
      const empInvoices = this.invoices.filter((i) => i.emp_id === emp.emp_id && i.date_only.startsWith(monthYear));
      const totalSales = empInvoices.reduce((acc, i) => acc + Number(i.net_payable || 0), 0);
      const commission = (totalSales * (emp.commission_percent || 0)) / 100;

      const advanceDeducted = Math.min(emp.salary_advance_balance || 0, 3000);
      const netPayable = emp.base_salary + totalTaDa + commission - advanceDeducted;

      return {
        id: `pay-${monthYear}-${emp.emp_id}`,
        salary_month: monthYear,
        emp_id: emp.emp_id,
        working_days: workingDays,
        base_salary: emp.base_salary,
        total_ta_da_earned: totalTaDa,
        sales_commission_earned: commission,
        festival_or_extra_bonus: 0,
        advance_salary_deducted: advanceDeducted,
        net_salary_payable: netPayable,
        paid_amount: 0,
        payment_status: 'Unpaid',
        payment_method: 'Cash',
        employee_name: emp.name,
        designation: emp.designation,
      };
    });

    // Merge or save
    generated.forEach((newP) => {
      const idx = this.payroll.findIndex((p) => p.salary_month === newP.salary_month && p.emp_id === newP.emp_id);
      if (idx >= 0) {
        this.payroll[idx] = { ...newP, paid_amount: this.payroll[idx].paid_amount, payment_status: this.payroll[idx].payment_status };
      } else {
        this.payroll.push(newP);
      }
    });

    this.saveToStorage();
    return this.payroll;
  }

  public paySalary(payrollId: string, method: string = 'Cash') {
    const item = this.payroll.find((p) => p.id === payrollId);
    if (!item) return;

    item.paid_amount = item.net_salary_payable;
    item.payment_status = 'Paid';
    item.paid_date = new Date().toISOString().split('T')[0];
    item.payment_method = method;

    // Add to Company Expenses
    this.expenses.push({
      id: `exp-${Date.now()}`,
      expense_date: new Date().toISOString().split('T')[0],
      category: 'Salary_Payout',
      title: `Salary Disbursed: ${item.employee_name} (${item.salary_month})`,
      amount: item.net_salary_payable,
      payment_method: method,
      entered_by_name: this.currentUser.name,
    });

    this.saveToStorage();
  }

  // TARGETS
  public getTargets(): EmployeeTarget[] {
    return this.targets;
  }

  // METRICS & KPIS FOR DASHBOARD
  public getDashboardMetrics() {
    const today = new Date().toISOString().split('T')[0];

    // Today's Sales
    const todayInvoices = this.invoices.filter((i) => i.date_only === today && i.order_status !== 'Cancelled');
    const todaySalesAmount = todayInvoices.reduce((acc, i) => acc + Number(i.net_payable || 0), 0);
    const todaySalesCount = todayInvoices.length;

    // Today's Cash Collected (from invoices & ledger)
    const todayCollected = this.ledger
      .filter((l) => l.date_only === today && l.credit > 0)
      .reduce((acc, l) => acc + Number(l.credit || 0), 0);

    // Total Market Baki
    const totalDue = this.customers.reduce((acc, c) => acc + Number(c.current_due_balance || 0), 0);
    const duePharmaciesCount = this.customers.filter((c) => c.current_due_balance > 0).length;

    // Total Warehouse Stock Value (at TP)
    let warehouseStockValue = 0;
    let totalWarehouseBoxes = 0;
    this.batches.forEach((b) => {
      warehouseStockValue += b.warehouse_qty * b.trade_price_tp;
      totalWarehouseBoxes += b.warehouse_qty;
    });

    // Employee In-Hand Unsold Stock (Medicines taken by employees to sell)
    let totalEmployeeHeldBoxes = 0;
    let totalEmployeeHeldValue = 0;
    const empStockMap: Record<string, number> = {};
    this.empStock.forEach((es) => {
      const prod = this.products.find((p) => p.id === es.product_id);
      const tp = prod ? prod.trade_price_tp : 0;
      totalEmployeeHeldBoxes += es.qty;
      totalEmployeeHeldValue += es.qty * tp;
      empStockMap[es.emp_id] = (empStockMap[es.emp_id] || 0) + es.qty;
    });
    const employeesWithStockCount = Object.values(empStockMap).filter((q) => q > 0).length;
    const totalCombinedBoxes = totalWarehouseBoxes + totalEmployeeHeldBoxes;
    const totalCombinedStockValue = warehouseStockValue + totalEmployeeHeldValue;

    // Low Stock & Expiring Batches
    const todayDate = new Date();
    const nearExpiryBatches = this.batches.filter((b) => {
      const exp = new Date(b.exp_date);
      const diffDays = Math.ceil((exp.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 90 && b.warehouse_qty > 0;
    });

    const lowStockProducts = this.products.filter((p) => p.stock <= p.low_stock_alert_level);

    // True Net Profit Calculation:
    // Net Sales (TP) - Factory Cost (DP) - Expenses - Damaged Loss
    const allSalesAtTP = this.invoices.reduce((acc, i) => acc + Number(i.net_payable || 0), 0);
    const allCostAtDP = this.invoices.reduce((acc, i) => acc + Number(i.total_factory_cost_dp || 0), 0);
    const allExpenses = this.expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const allLoss = this.damagedStock.reduce((acc, d) => acc + Number(d.loss_amount_at_dp || 0), 0);

    const netProfit = allSalesAtTP - allCostAtDP - allExpenses - allLoss;
    const profitMargin = allSalesAtTP > 0 ? ((netProfit / allSalesAtTP) * 100).toFixed(1) : '0';

    // Pending Pre-orders
    const pendingOrdersCount = this.invoices.filter((i) => i.order_status === 'Order_Booked').length;

    return {
      todaySalesAmount,
      todaySalesCount,
      todayCollected,
      totalDue,
      duePharmaciesCount,
      warehouseStockValue,
      totalWarehouseBoxes,
      totalEmployeeHeldBoxes,
      totalEmployeeHeldValue,
      employeesWithStockCount,
      totalCombinedBoxes,
      totalCombinedStockValue,
      expiringCount: nearExpiryBatches.length,
      lowStockCount: lowStockProducts.length,
      netProfit,
      profitMargin,
      pendingOrdersCount,
      nearExpiryBatches,
    };
  }

  // ALL DATA DUMP FOR 1-CLICK EXCEL BACKUP
  public getAllDataForBackup(): Record<string, any[]> {
    return {
      invoices: this.invoices,
      sales: this.invoices.flatMap((i) => i.items || []),
      products: this.products,
      product_batches: this.batches,
      customers: this.customers,
      employees: this.employees,
      markets: this.markets,
      suppliers: this.suppliers,
      doctors: this.doctors,
      doctor_expenses: this.doctorExpenses,
      purchases: this.purchases,
      purchase_items: this.purchases.flatMap((p) => p.items || []),
      emp_stock: this.empStock,
      stock_transfers: this.stockTransfers,
      sales_returns: this.returns,
      damaged_expired_stock: this.damagedStock,
      ledger: this.ledger,
      expenses: this.expenses,
      attendance: this.attendance,
      payroll: this.payroll,
    };
  }
}

// Global Singleton Instance
export const erpStore = new ERPStore();
