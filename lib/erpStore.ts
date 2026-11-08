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
import { isSupabaseConfigured, fetchFromCloud, syncRecordToCloud } from '@/lib/supabase';

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
    id: 'doc-1',
    doctor_code: 'DOC-1001',
    name: 'Dr. M. A. Karim',
    degrees: 'MBBS, FCPS (Medicine)',
    specialty: 'Internal Medicine Specialist',
    hospital_chamber: 'Popular Diagnostic Center, Mirpur-10, Dhaka',
    phone: '01712345678',
    market_id: 'mkt-1',
    assigned_emp_id: 'EMP-001',
    prescriptions_written_monthly: 145,
    total_promotional_expense: 6500,
    prescribed_products: ['Cal-D Plus 500mg', 'Gastroloc 20mg'],
    image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: '2026-01-15T09:00:00Z',
  },
  {
    id: 'doc-2',
    doctor_code: 'DOC-1002',
    name: 'Prof. Dr. Syeda Naznin',
    degrees: 'MBBS, DGO, FCPS (Obs & Gynae)',
    specialty: 'Gynecologist & Obstetrician',
    hospital_chamber: 'Labaid Specialized Hospital, Dhanmondi, Dhaka',
    phone: '01819234567',
    market_id: 'mkt-2',
    assigned_emp_id: 'EMP-002',
    prescriptions_written_monthly: 210,
    total_promotional_expense: 12000,
    prescribed_products: ['Cal-D Plus 500mg', 'GlucoHealth Sugar Balance'],
    image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: '2026-02-10T10:00:00Z',
  },
  {
    id: 'doc-3',
    doctor_code: 'DOC-1003',
    name: 'Dr. Tariqul Islam',
    degrees: 'MBBS, MD (Cardiology)',
    specialty: 'Cardiologist',
    hospital_chamber: 'Ibn Sina Medical College & Hospital, Kallyanpur, Dhaka',
    phone: '01911456789',
    market_id: 'mkt-1',
    assigned_emp_id: 'EMP-001',
    prescriptions_written_monthly: 95,
    total_promotional_expense: 4000,
    prescribed_products: ['CardioProtect Q10', 'Gastroloc 20mg'],
    image_url: null,
    is_active: true,
    created_at: '2026-03-01T11:00:00Z',
  },
  {
    id: 'doc-4',
    doctor_code: 'DOC-1004',
    name: 'Dr. Shamim Ara Begum',
    degrees: 'MBBS, DDV (Dermatology)',
    specialty: 'Skin & Allergy Specialist',
    hospital_chamber: 'Uttara Crescent Hospital, Sector-3, Uttara, Dhaka',
    phone: '01733567890',
    market_id: 'mkt-3',
    assigned_emp_id: 'EMP-003',
    prescriptions_written_monthly: 120,
    total_promotional_expense: 5500,
    prescribed_products: ['ImmunoZinc Forte', 'VitaBoost Active Daily'],
    image_url: null,
    is_active: true,
    created_at: '2026-03-20T14:30:00Z',
  },
];

const initialDoctorExpenses: DoctorExpense[] = [
  {
    id: 'dexp-1',
    doctor_id: 'doc-1',
    emp_id: 'EMP-001',
    expense_date: '2026-11-01',
    expense_type: 'Gift_Item',
    title: 'Executive Leather Prescription Pad & Parker Pen Set',
    amount: 1500,
    prescriptions_written_count: 35,
    notes: 'Visited chamber on Sunday evening. Doctor committed 35+ Cal-D Plus Rx monthly.',
    created_at: '2026-11-01T18:00:00Z',
  },
  {
    id: 'dexp-2',
    doctor_id: 'doc-2',
    emp_id: 'EMP-002',
    expense_date: '2026-10-28',
    expense_type: 'Sample_Medicine',
    title: 'Trial Samples: Cal-D Plus (10 boxes) + Gastroloc (10 boxes)',
    amount: 3500,
    prescriptions_written_count: 50,
    notes: 'Supplied trial samples for OPD maternity patients.',
    created_at: '2026-10-28T12:30:00Z',
  },
  {
    id: 'dexp-3',
    doctor_id: 'doc-2',
    emp_id: 'EMP-002',
    expense_date: '2026-10-15',
    expense_type: 'Dinner_Conference',
    title: 'Gynecological Society Clinical Meet Sponsorship & Dinner',
    amount: 8500,
    prescriptions_written_count: 80,
    notes: 'Monthly clinical presentation and product display for Senatix portfolio.',
    created_at: '2026-10-15T21:00:00Z',
  },
  {
    id: 'dexp-4',
    doctor_id: 'doc-3',
    emp_id: 'EMP-001',
    expense_date: '2026-10-25',
    expense_type: 'Cash_Honorarium',
    title: 'Cardio Observation Study Honorarium',
    amount: 4000,
    prescriptions_written_count: 40,
    notes: 'Disbursed quarterly medical observation honorarium.',
    created_at: '2026-10-25T16:00:00Z',
  },
];

const initialProducts: Product[] = [
  {
    id: 'prod-1',
    sku_code: 'SNX-TAB-001',
    name: 'Cal-D Plus 500mg',
    generic_name: 'Calcium Carbonate + Vitamin D3',
    category: 'Tablet',
    strength: '500mg + 200IU',
    pack_size: 'Box of 30 Tablets',
    supplier_id: 'sup-1',
    stock: 240,
    low_stock_alert_level: 50,
    cost_price_dp: 180,
    trade_price_tp: 240,
    mrp: 280,
    bonus_buy_qty: 10,
    bonus_free_qty: 1,
    is_active: true,
  },
  {
    id: 'prod-2',
    sku_code: 'SNX-CAP-002',
    name: 'Senatix Cefixime 200mg',
    generic_name: 'Cefixime Trihydrate',
    category: 'Capsule',
    strength: '200mg',
    pack_size: 'Box of 14 Capsules',
    supplier_id: 'sup-2',
    stock: 180,
    low_stock_alert_level: 40,
    cost_price_dp: 320,
    trade_price_tp: 420,
    mrp: 500,
    bonus_buy_qty: 10,
    bonus_free_qty: 1,
    is_active: true,
  },
  {
    id: 'prod-3',
    sku_code: 'SNX-TAB-003',
    name: 'Gastroloc 20mg',
    generic_name: 'Omeprazole BP',
    category: 'Tablet',
    strength: '20mg',
    pack_size: 'Box of 100 Tablets',
    supplier_id: 'sup-3',
    stock: 520,
    low_stock_alert_level: 100,
    cost_price_dp: 65,
    trade_price_tp: 90,
    mrp: 110,
    bonus_buy_qty: 20,
    bonus_free_qty: 3,
    is_active: true,
  },
  {
    id: 'prod-4',
    sku_code: 'SNX-TAB-004',
    name: 'Neurobion Forte Plus',
    generic_name: 'Vitamin B1 + B6 + B12',
    category: 'Tablet',
    strength: '100mg + 200mg + 200mcg',
    pack_size: 'Box of 30 Tablets',
    supplier_id: 'sup-4',
    stock: 310,
    low_stock_alert_level: 60,
    cost_price_dp: 210,
    trade_price_tp: 280,
    mrp: 330,
    bonus_buy_qty: 10,
    bonus_free_qty: 1,
    is_active: true,
  },
  {
    id: 'prod-5',
    sku_code: 'SNX-SYR-005',
    name: 'Tusso-X Cough Reliever',
    generic_name: 'Dextromethorphan + Menthol',
    category: 'Syrup',
    strength: '100ml Bottle',
    pack_size: '1 Bottle',
    supplier_id: 'sup-1',
    stock: 25, // LOW STOCK
    low_stock_alert_level: 50,
    cost_price_dp: 85,
    trade_price_tp: 115,
    mrp: 135,
    bonus_buy_qty: 12,
    bonus_free_qty: 1,
    is_active: true,
  },
  {
    id: 'prod-6',
    sku_code: 'SNX-TAB-006',
    name: 'Dolo-650 Fast Relief',
    generic_name: 'Paracetamol BP',
    category: 'Tablet',
    strength: '650mg',
    pack_size: 'Box of 100 Tablets',
    supplier_id: 'sup-2',
    stock: 650,
    low_stock_alert_level: 100,
    cost_price_dp: 25,
    trade_price_tp: 35,
    mrp: 45,
    bonus_buy_qty: 20,
    bonus_free_qty: 2,
    is_active: true,
  },
  {
    id: 'prod-7',
    sku_code: 'SNX-DRP-007',
    name: 'Zinc-B Pediatric Drop',
    generic_name: 'Zinc Sulfate + B-Complex',
    category: 'Drop',
    strength: '15ml Bottle',
    pack_size: '1 Bottle',
    supplier_id: 'sup-3',
    stock: 140,
    low_stock_alert_level: 40,
    cost_price_dp: 55,
    trade_price_tp: 75,
    mrp: 90,
    bonus_buy_qty: 10,
    bonus_free_qty: 1,
    is_active: true,
  },
  {
    id: 'prod-8',
    sku_code: 'SNX-SUP-008',
    name: 'GlucoHealth Sugar Balance',
    generic_name: 'Herbal Gymnema + Fenugreek',
    category: 'Supplement',
    strength: '60 Veg Capsules',
    pack_size: '1 Container',
    supplier_id: 'sup-4',
    stock: 90,
    low_stock_alert_level: 30,
    cost_price_dp: 450,
    trade_price_tp: 600,
    mrp: 750,
    bonus_buy_qty: 5,
    bonus_free_qty: 1,
    is_active: true,
  },
];

const initialBatches: ProductBatch[] = [
  { id: 'b-1', product_id: 'prod-1', batch_no: 'B26-041', mfg_date: '2025-01-10', exp_date: '2027-12-31', cost_price_dp: 180, trade_price_tp: 240, mrp: 280, warehouse_qty: 240, is_active: true },
  { id: 'b-2', product_id: 'prod-2', batch_no: 'B26-089', mfg_date: '2025-02-15', exp_date: '2027-08-30', cost_price_dp: 320, trade_price_tp: 420, mrp: 500, warehouse_qty: 180, is_active: true },
  { id: 'b-3', product_id: 'prod-3', batch_no: 'B25-992', mfg_date: '2024-11-01', exp_date: '2026-11-20', cost_price_dp: 65, trade_price_tp: 90, mrp: 110, warehouse_qty: 120, is_active: true }, // Near expiry (within 30-60 days)
  { id: 'b-3b', product_id: 'prod-3', batch_no: 'B26-104', mfg_date: '2025-03-01', exp_date: '2028-02-28', cost_price_dp: 65, trade_price_tp: 90, mrp: 110, warehouse_qty: 400, is_active: true },
  { id: 'b-4', product_id: 'prod-4', batch_no: 'B26-215', mfg_date: '2025-01-20', exp_date: '2027-10-31', cost_price_dp: 210, trade_price_tp: 280, mrp: 330, warehouse_qty: 310, is_active: true },
  { id: 'b-5', product_id: 'prod-5', batch_no: 'B25-440', mfg_date: '2024-09-01', exp_date: '2026-12-15', cost_price_dp: 85, trade_price_tp: 115, mrp: 135, warehouse_qty: 25, is_active: true },
  { id: 'b-6', product_id: 'prod-6', batch_no: 'B26-301', mfg_date: '2025-04-10', exp_date: '2028-04-30', cost_price_dp: 25, trade_price_tp: 35, mrp: 45, warehouse_qty: 650, is_active: true },
  { id: 'b-7', product_id: 'prod-7', batch_no: 'B26-512', mfg_date: '2025-02-01', exp_date: '2027-06-30', cost_price_dp: 55, trade_price_tp: 75, mrp: 90, warehouse_qty: 140, is_active: true },
  { id: 'b-8', product_id: 'prod-8', batch_no: 'B26-780', mfg_date: '2025-03-12', exp_date: '2027-09-30', cost_price_dp: 450, trade_price_tp: 600, mrp: 750, warehouse_qty: 90, is_active: true },
];

const initialEmpStock: EmpStock[] = [
  { id: 'es-1', emp_id: 'EMP-001', product_id: 'prod-1', batch_id: 'b-1', qty: 25 },
  { id: 'es-2', emp_id: 'EMP-001', product_id: 'prod-2', batch_id: 'b-2', qty: 15 },
  { id: 'es-3', emp_id: 'EMP-002', product_id: 'prod-3', batch_id: 'b-3b', qty: 40 },
  { id: 'es-4', emp_id: 'EMP-003', product_id: 'prod-4', batch_id: 'b-4', qty: 20 },
  { id: 'es-5', emp_id: 'EMP-004', product_id: 'prod-6', batch_id: 'b-6', qty: 50 },
];

const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoice_ref: 'INV-20261102-001',
    order_status: 'Delivered_Final',
    stock_source: 'Employee_Stock',
    date_time: '2026-11-02T10:30:00Z',
    date_only: '2026-11-02',
    emp_id: 'EMP-001',
    customer_id: 'cust-1',
    market_id: 'mkt-1',
    sub_total: 6600,
    discount_percent: 5,
    discount_amount: 330,
    net_payable: 6270,
    paid_amount: 4000,
    due_amount: 2270,
    total_factory_cost_dp: 4700,
    payment_status: 'Partial',
    payment_method: 'Cash',
    customer_name: 'Popular Medicine Corner',
    customer_phone: '01819000101',
    customer_address: 'Mirpur-10, Dhaka',
    employee_name: 'Tanvir Hossain',
    market_name: 'Mirpur-10 Territory',
    items: [
      { product_id: 'prod-1', batch_id: 'b-1', product_name: 'Cal-D Plus 500mg', batch_no: 'B26-041', qty: 20, bonus_qty: 2, unit_cost_dp: 180, unit_price: 240, discount_percent: 5, total_price: 4560 },
      { product_id: 'prod-3', batch_id: 'b-3b', product_name: 'Gastroloc 20mg', batch_no: 'B26-104', qty: 20, bonus_qty: 3, unit_cost_dp: 65, unit_price: 90, discount_percent: 5, total_price: 1710 },
    ],
  },
  {
    id: 'inv-2',
    invoice_ref: 'INV-20261102-002',
    order_status: 'Delivered_Final',
    stock_source: 'Warehouse_Direct',
    date_time: '2026-11-02T14:15:00Z',
    date_only: '2026-11-02',
    emp_id: 'EMP-002',
    customer_id: 'cust-2',
    market_id: 'mkt-2',
    sub_total: 8400,
    discount_percent: 0,
    discount_amount: 0,
    net_payable: 8400,
    paid_amount: 8400,
    due_amount: 0,
    total_factory_cost_dp: 6400,
    payment_status: 'Paid',
    payment_method: 'bKash',
    customer_name: 'Al-Madina Pharmacy & Surgicals',
    customer_phone: '01819000102',
    customer_address: 'Dhanmondi, Dhaka',
    employee_name: 'Shakib Al Hasan',
    market_name: 'Dhanmondi Medical Zone',
    items: [
      { product_id: 'prod-2', batch_id: 'b-2', product_name: 'Senatix Cefixime 200mg', batch_no: 'B26-089', qty: 20, bonus_qty: 2, unit_cost_dp: 320, unit_price: 420, discount_percent: 0, total_price: 8400 },
    ],
  },
  {
    id: 'inv-3',
    invoice_ref: 'INV-20261103-001',
    order_status: 'Order_Booked',
    stock_source: 'Warehouse_Direct',
    date_time: '2026-11-03T09:00:00Z',
    date_only: '2026-11-03',
    emp_id: 'EMP-003',
    customer_id: 'cust-3',
    market_id: 'mkt-3',
    sub_total: 11200,
    discount_percent: 0,
    discount_amount: 0,
    net_payable: 11200,
    paid_amount: 0,
    due_amount: 11200,
    total_factory_cost_dp: 8400,
    payment_status: 'Due',
    payment_method: 'Due_Only',
    customer_name: 'Care Chemists & Wellness',
    customer_phone: '01819000103',
    customer_address: 'Uttara, Dhaka',
    employee_name: 'Mehedi Hasan',
    market_name: 'Uttara Sector Route',
    items: [
      { product_id: 'prod-4', batch_id: 'b-4', product_name: 'Neurobion Forte Plus', batch_no: 'B26-215', qty: 40, bonus_qty: 4, unit_cost_dp: 210, unit_price: 280, discount_percent: 0, total_price: 11200 },
    ],
  },
];

const initialLedger: LedgerEntry[] = [
  {
    id: 'led-1',
    date_time: '2026-11-02T10:30:00Z',
    date_only: '2026-11-02',
    account_type: 'Customer',
    customer_id: 'cust-1',
    emp_id: 'EMP-001',
    invoice_ref: 'INV-20261102-001',
    payment_method: 'Cash',
    description: 'Invoice Billed (INV-20261102-001)',
    debit: 6270,
    credit: 0,
    balance: 20770,
    party_name: 'Popular Medicine Corner',
  },
  {
    id: 'led-2',
    date_time: '2026-11-02T10:35:00Z',
    date_only: '2026-11-02',
    account_type: 'Customer',
    customer_id: 'cust-1',
    emp_id: 'EMP-001',
    invoice_ref: 'INV-20261102-001',
    payment_method: 'Cash',
    description: 'Cash Payment Received at Delivery',
    debit: 0,
    credit: 4000,
    balance: 16770,
    party_name: 'Popular Medicine Corner',
  },
  {
    id: 'led-3',
    date_time: '2026-11-02T14:15:00Z',
    date_only: '2026-11-02',
    account_type: 'Customer',
    customer_id: 'cust-2',
    emp_id: 'EMP-002',
    invoice_ref: 'INV-20261102-002',
    payment_method: 'bKash',
    description: 'Invoice Billed & Paid in Full (bKash)',
    debit: 8400,
    credit: 8400,
    balance: 9200,
    party_name: 'Al-Madina Pharmacy & Surgicals',
  },
];

const initialExpenses: Expense[] = [
  { id: 'exp-1', expense_date: '2026-11-01', category: 'Office_Warehouse_Rent', title: 'Monthly Central Warehouse Rent', amount: 35000, payment_method: 'Bank', entered_by_name: 'Nazrul Islam' },
  { id: 'exp-2', expense_date: '2026-11-02', category: 'Delivery_Van_Fuel', title: 'Delivery Van 1 Octane Refill', amount: 3200, payment_method: 'Cash', entered_by_name: 'Ashikur Rahman' },
  { id: 'exp-3', expense_date: '2026-11-02', category: 'Staff_Tea_Entertainment', title: 'Field Staff Weekly Refreshment', amount: 1450, payment_method: 'Cash', entered_by_name: 'Farhan Ahmed' },
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

  public loginWithCredentials(identifier: string, pin: string): { success: boolean; user?: Employee; message?: string } {
    const cleanId = identifier.trim().toLowerCase().replace('@senatix.local', '');
    const found = this.employees.find(
      (e) => e.emp_id.toLowerCase() === cleanId || e.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')
    );

    if (found) {
      this.currentUser = found;
      this.saveToStorage();
      return { success: true, user: found };
    }

    // Fallback: If demo login or unknown, default to first employee
    if (identifier.includes('admin') || pin === '1234' || pin === 'admin') {
      this.currentUser = this.employees[0];
      this.saveToStorage();
      return { success: true, user: this.employees[0] };
    }

    return { success: false, message: 'Invalid ID/Mobile or PIN. Try ADM-01 or PIN 1234' };
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
    return emp;
  }

  public updateEmployee(emp_id: string, updates: Partial<Employee>) {
    this.employees = this.employees.map((e) => (e.emp_id === emp_id ? { ...e, ...updates } : e));
    if (this.currentUser.emp_id === emp_id) {
      this.currentUser = { ...this.currentUser, ...updates };
    }
    this.saveToStorage();
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
      id: `led-${Date.now()}`,
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
      id: `doc-${Date.now()}`,
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
    return this.doctors[idx];
  }

  public deleteDoctor(id: string): boolean {
    const initialLen = this.doctors.length;
    this.doctors = this.doctors.filter((d) => d.id !== id);
    if (this.doctors.length !== initialLen) {
      this.saveToStorage();
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
      id: `dexp-${Date.now()}`,
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
    }

    // Auto-record under company operational expenses if financial cost occurred
    if (exp.amount > 0) {
      this.expenses.unshift({
        id: `exp-${Date.now()}`,
        expense_date: exp.expense_date,
        category: 'Doctor_Gift',
        title: `Doctor Promo: ${doc?.name || 'Doctor'} - ${exp.title}`,
        amount: exp.amount,
        payment_method: 'Cash',
        entered_by_emp_id: exp.emp_id,
        entered_by_name: this.currentUser.name,
      });
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
      id: `prod-${Date.now()}`,
      stock: 0,
    };
    this.products.push(newProd);
    this.saveToStorage();
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>) {
    this.products = this.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    this.saveToStorage();
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
      id: `batch-${Date.now()}`,
    };
    this.batches.push(newBatch);
    this.saveToStorage();
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

    if (existing) {
      existing.qty += qty;
    } else {
      this.empStock.push({
        id: `es-${Date.now()}`,
        emp_id: empId,
        product_id: productId,
        batch_id: batchId,
        qty,
      });
    }

    this.stockTransfers.push({
      id: `st-${Date.now()}`,
      transfer_ref: `TRF-${Date.now().toString().slice(-6)}`,
      transfer_type: 'Warehouse_To_Employee',
      emp_id: empId,
      product_id: productId,
      batch_id: batchId,
      qty,
      approved_by_emp_id: this.currentUser.emp_id,
      transfer_date: new Date().toISOString().split('T')[0],
    });

    this.saveToStorage();
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

    this.stockTransfers.push({
      id: `st-${Date.now()}`,
      transfer_ref: `RTN-${Date.now().toString().slice(-6)}`,
      transfer_type: 'Employee_Return_To_Warehouse',
      emp_id: empId,
      product_id: productId,
      batch_id: batchId,
      qty,
      approved_by_emp_id: this.currentUser.emp_id,
      transfer_date: new Date().toISOString().split('T')[0],
    });

    this.saveToStorage();
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
      id: `inv-${Date.now()}`,
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
          } else {
            // If employee sold from available batch, also deduct from batch if not in bag
            const batch = this.batches.find((b) => b.id === item.batch_id);
            if (batch) {
              batch.warehouse_qty = Math.max(0, batch.warehouse_qty - totalDeduct);
            }
          }
        } else {
          const batch = this.batches.find((b) => b.id === item.batch_id);
          if (batch) {
            batch.warehouse_qty = Math.max(0, batch.warehouse_qty - totalDeduct);
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
        }
      });
    }

    this.saveToStorage();
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
      } else {
        batch = {
          id: `batch-${Date.now()}-${Math.random()}`,
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
      id: `exp-${Date.now()}`,
      created_at: new Date().toISOString(),
      entered_by_name: this.currentUser.name,
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

    const existingIndex = this.attendance.findIndex((a) => a.emp_id === empId && a.work_date === targetDate);
    if (existingIndex >= 0) {
      this.attendance[existingIndex].status = status;
      this.attendance[existingIndex].ta_da_amount_earned = taDa;
    } else {
      this.attendance.push({
        id: `att-${Date.now()}-${empId}`,
        emp_id: empId,
        work_date: targetDate,
        status,
        ta_da_amount_earned: taDa,
        marked_by_emp_id: this.currentUser.emp_id,
        employee_name: emp?.name,
      });
    }

    this.saveToStorage();
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
