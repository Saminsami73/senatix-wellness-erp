// Senatix Wellness ERP Master Data Types
// 100% Compatible with database/schema.sql (18 Tables)

export type UserRole = 
  | 'super_admin' 
  | 'executor' 
  | 'manager' 
  | 'accountant' 
  | 'store_keeper' 
  | 'sales_rep';

export type OrderStatus = 'Order_Booked' | 'Packed_Ready' | 'Delivered_Final' | 'Cancelled';
export type StockSource = 'Employee_Stock' | 'Warehouse_Direct';
export type PaymentStatus = 'Paid' | 'Partial' | 'Due' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Bank' | 'Due_Only';
export type ReturnCondition = 'Good_Resaleable' | 'Damaged_Broken' | 'Expired';
export type AttendanceStatus = 'Present_Office' | 'Present_Market_Duty' | 'Leave' | 'Absent' | 'Holiday';
export type ExpenseCategory = 
  | 'Office_Warehouse_Rent' 
  | 'Delivery_Van_Fuel' 
  | 'Electricity_Internet' 
  | 'Staff_Tea_Entertainment' 
  | 'Packaging_Printing' 
  | 'Salary_Payout' 
  | 'Doctor_Gift'
  | 'Other_Expense';
export type QuarantineReason = 'Expired_In_Store' | 'Broken_In_Delivery' | 'Returned_Damaged_By_Pharmacy';
export type QuarantineStatus = 'Kept_In_Quarantine' | 'Replaced_By_Factory' | 'Destroyed_Written_Off';

export interface Market {
  id: string;
  market_code: string;
  name: string;
  area_zone: string;
  delivery_days?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Employee {
  emp_id: string;
  name: string;
  image_url?: string | null;
  phone: string;
  designation: string;
  role: UserRole;
  nid_number?: string | null;
  joining_date?: string;
  primary_market_id?: string | null;
  base_salary: number;
  daily_ta_da: number;
  commission_percent: number;
  current_due_balance: number;
  salary_advance_balance: number;
  is_active: boolean;
  created_at?: string;
  // Join fields
  market_name?: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  shop_name: string;
  owner_name?: string | null;
  image_url?: string | null;
  phone: string;
  address?: string | null;
  drug_license_no?: string | null;
  market_id: string;
  assigned_emp_id?: string | null;
  credit_limit: number;
  current_due_balance: number;
  is_active: boolean;
  created_at?: string;
  // Join fields
  market_name?: string;
  assigned_emp_name?: string;
}

export interface Supplier {
  id: string;
  name: string;
  image_url?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  address?: string | null;
  payable_balance: number;
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  sku_code: string;
  name: string;
  image_url?: string | null;
  generic_name?: string | null;
  category: string;
  strength?: string | null;
  pack_size: string;
  supplier_id?: string | null;
  stock: number;
  low_stock_alert_level: number;
  cost_price_dp: number;
  trade_price_tp: number;
  mrp: number;
  bonus_buy_qty: number;
  bonus_free_qty: number;
  is_active: boolean;
  created_at?: string;
  // Join fields
  supplier_name?: string;
  batches?: ProductBatch[];
}

export interface ProductBatch {
  id: string;
  product_id: string;
  batch_no: string;
  mfg_date?: string | null;
  exp_date: string;
  cost_price_dp: number;
  trade_price_tp: number;
  mrp: number;
  warehouse_qty: number;
  is_active: boolean;
  created_at?: string;
  // Calculated / Join
  product_name?: string;
  days_to_expiry?: number;
}

export interface Purchase {
  id: string;
  receive_ref: string;
  supplier_id: string;
  factory_challan_no?: string | null;
  receive_date: string;
  total_cost_amount: number;
  paid_amount: number;
  due_amount: number;
  notes?: string | null;
  created_by_emp_id?: string | null;
  created_at?: string;
  supplier_name?: string;
  items?: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  batch_id: string;
  received_qty: number;
  free_bonus_qty: number;
  unit_cost_dp: number;
  line_total_cost: number;
  product_name?: string;
  batch_no?: string;
}

export interface EmpStock {
  id: string;
  emp_id: string;
  product_id: string;
  batch_id: string;
  qty: number;
  updated_at?: string;
  product_name?: string;
  batch_no?: string;
  tp?: number;
}

export interface StockTransfer {
  id: string;
  transfer_ref: string;
  transfer_type: 'Warehouse_To_Employee' | 'Employee_Return_To_Warehouse';
  emp_id: string;
  product_id: string;
  batch_id: string;
  qty: number;
  approved_by_emp_id?: string | null;
  transfer_date: string;
  created_at?: string;
  employee_name?: string;
  product_name?: string;
  batch_no?: string;
}

export interface InvoiceItem {
  product_id: string;
  batch_id: string;
  product_name: string;
  batch_no: string;
  qty: number;
  bonus_qty: number;
  unit_cost_dp: number;
  unit_price: number;
  discount_percent: number;
  total_price: number;
}

export interface Invoice {
  id: string;
  invoice_ref: string;
  order_status: OrderStatus;
  stock_source: StockSource;
  date_time: string;
  date_only: string;
  emp_id: string;
  customer_id: string;
  market_id?: string | null;
  sub_total: number;
  discount_percent: number;
  discount_amount: number;
  net_payable: number;
  paid_amount: number;
  due_amount: number;
  total_factory_cost_dp: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  notes?: string | null;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  employee_name?: string;
  market_name?: string;
  items?: InvoiceItem[];
}

export interface SalesReturn {
  id: string;
  return_ref: string;
  invoice_id?: string | null;
  customer_id: string;
  emp_id?: string | null;
  product_id: string;
  batch_id: string;
  returned_qty: number;
  condition: ReturnCondition;
  credit_amount_reduced_from_due: number;
  return_date: string;
  notes?: string | null;
  created_at?: string;
  customer_name?: string;
  product_name?: string;
  batch_no?: string;
}

export interface DamagedExpiredStock {
  id: string;
  product_id: string;
  batch_id: string;
  qty: number;
  reason: QuarantineReason;
  loss_amount_at_dp: number;
  reported_by_emp_id?: string | null;
  status: QuarantineStatus;
  date_logged: string;
  product_name?: string;
  batch_no?: string;
}

export interface LedgerEntry {
  id: string;
  date_time: string;
  date_only: string;
  account_type: 'Customer' | 'Employee' | 'Supplier';
  emp_id?: string | null;
  customer_id?: string | null;
  supplier_id?: string | null;
  invoice_ref?: string | null;
  payment_method: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  // Join fields
  party_name?: string;
}

export interface Expense {
  id: string;
  expense_date: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  payment_method: string;
  entered_by_emp_id?: string | null;
  created_at?: string;
  entered_by_name?: string;
}

export interface Attendance {
  id: string;
  emp_id: string;
  work_date: string;
  status: AttendanceStatus;
  market_id?: string | null;
  ta_da_amount_earned: number;
  marked_by_emp_id?: string | null;
  employee_name?: string;
  employee_photo?: string | null;
  market_name?: string;
}

export interface EmployeeTarget {
  id: string;
  emp_id: string;
  month_year: string;
  target_sales_amount: number;
  achieved_sales_amount: number;
  target_collection_amount: number;
  achieved_collection_amount: number;
  employee_name?: string;
}

export interface Payroll {
  id: string;
  salary_month: string;
  emp_id: string;
  working_days: number;
  base_salary: number;
  total_ta_da_earned: number;
  sales_commission_earned: number;
  festival_or_extra_bonus: number;
  advance_salary_deducted: number;
  net_salary_payable: number;
  paid_amount: number;
  payment_status: 'Unpaid' | 'Paid';
  paid_date?: string | null;
  payment_method: string;
  employee_name?: string;
  designation?: string;
}

export interface Doctor {
  id: string;
  doctor_code: string;
  name: string;
  degrees: string;
  specialty: string;
  hospital_chamber: string;
  phone: string;
  market_id: string;
  assigned_emp_id?: string | null;
  prescriptions_written_monthly: number;
  total_promotional_expense: number;
  prescribed_products?: string[];
  image_url?: string | null;
  is_active: boolean;
  created_at?: string;
  // Join fields
  market_name?: string;
  assigned_emp_name?: string;
}

export interface DoctorExpense {
  id: string;
  doctor_id: string;
  emp_id: string;
  expense_date: string;
  expense_type: 'Sample_Medicine' | 'Gift_Item' | 'Cash_Honorarium' | 'Dinner_Conference';
  title: string;
  amount: number;
  prescriptions_written_count?: number;
  notes?: string | null;
  created_at?: string;
  // Join fields
  doctor_name?: string;
  employee_name?: string;
}

