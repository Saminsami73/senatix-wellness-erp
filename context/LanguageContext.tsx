'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type LanguageMode = 'bn' | 'en';

interface LanguageContextType {
  mode: LanguageMode;
  setMode: (mode: LanguageMode) => void;
  toggleMode: () => void;
  t: (key: string, fallback?: string) => string;
  formatCurrency: (amount: number) => string;
}

const translations: Record<string, { en: string; bn: string }> = {
  // Navigation
  nav_dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  nav_billing: { en: 'Make Bill', bn: 'নতুন চালান তৈরি' },
  nav_orders: { en: 'Field Orders', bn: 'অর্ডার ও ডেলিভারি' },
  nav_inventory: { en: 'Stock & Storage', bn: 'গুদাম ও ওষুধের স্টক' },
  nav_employees: { en: 'Staff & In-Hand Stock', bn: 'কর্মী ও অবিক্রীত স্টক' },
  nav_doctors: { en: 'Doctors & Prescriptions', bn: 'ডাক্তার ও চেম্বার' },
  nav_field_app: { en: 'Field Sales App', bn: 'মাঠপর্যায়ের সেলস অ্যাপ' },
  nav_hr_payroll: { en: 'Attendance & Salary', bn: 'হাজিরা ও বেতন' },
  nav_ledger: { en: 'Money Book & Ledger', bn: 'বাকি ও জমা খাতা' },
  nav_expenses: { en: 'Expenses & Profit', bn: 'দৈনিক খরচ ও লাভ' },
  nav_reports: { en: 'Reports & Backup', bn: 'রিপোর্ট ও ব্যাকআপ' },

  // Stock & Inventory Concepts
  warehouse_stock: { en: 'Godown Storage Stock', bn: 'গুদামে মজুত ওষুধ' },
  employee_stock: { en: 'Staff In-Hand Stock', bn: 'কর্মীর কাছে থাকা স্টক' },
  unsold_stock: { en: 'Unsold Stock in Hand', bn: 'অবিক্রীত ওষুধ' },
  total_combined_stock: { en: 'Total Stock (Storage + Staff)', bn: 'সর্বমোট স্টক (গুদাম ও কর্মী)' },
  include_staff_stock: { en: 'Count staff unsold stock in total', bn: 'কর্মীদের কাছে থাকা অবিক্রীত ওষুধ মোট স্টকে যোগ করুন' },
  issue_to_staff: { en: 'Issue Stock to Employee', bn: 'কর্মীকে ওষুধ হস্তান্তর করুন' },
  return_to_storage: { en: 'Return Unsold Stock to Storage', bn: 'অবিক্রীত ওষুধ গুদামে ফেরত নিন' },
  cost_price_dp: { en: 'Factory Cost Price', bn: 'ফ্যাক্টরি কেনা দাম' },
  trade_price_tp: { en: 'Trade Price', bn: 'বিক্রয় মূল্য' },
  mrp: { en: 'Retail Box Price', bn: 'গায়ের দাম' },
  bonus_scheme: { en: 'Free Bonus Boxes', bn: 'ফ্রি বোনাস বক্স' },
  batch_and_expiry: { en: 'Batch & Expiry Date', bn: 'ব্যাচ ও মেয়াদের তারিখ' },
  current_due: { en: 'Total Due Balance', bn: 'মোট বকেয়া বাকি' },
  debit: { en: 'New Bill Added', bn: 'নতুন বাকি যোগ' },
  credit: { en: 'Payment Received', bn: 'টাকা জমা' },
  grn_purchase: { en: 'Receive Factory Stock', bn: 'ফ্যাক্টরি থেকে নতুন ওষুধ গ্রহণ' },
  sales_return: { en: 'Medicine Return', bn: 'ওষুধ ফেরত' },
  quarantine: { en: 'Damaged or Expired Stock', bn: 'নষ্ট বা মেয়াদ পার হওয়া ওষুধ' },
  attendance: { en: 'Daily Attendance', bn: 'প্রতিদিনের হাজিরা' },
  ta_da: { en: 'Travel & Daily Allowance', bn: 'যাতায়াত ও খাবার ভাতা' },
  payroll: { en: 'Monthly Salary', bn: 'মাসিক বেতন' },
  net_profit: { en: 'Net Profit', bn: 'নিট লাভ' },
  excel_backup: { en: 'Download Excel Backup', bn: 'এক্সেল ব্যাকআপ ডাউনলোড' },

  // Owner dashboard key metrics
  today_sales: { en: "Today's Sales", bn: 'আজকের বিক্রি' },
  today_cash: { en: "Cash Collected Today", bn: 'আজকের নগদ আদায়' },
  total_market_due: { en: 'Due to Collect', bn: 'মোট বকেয়া বাকি' },
  warehouse_value: { en: 'Godown Storage Value', bn: 'গুদামের ওষুধের দাম' },
  stock_alerts: { en: 'Stock & Expiry Alerts', bn: 'মেয়াদ ও কম স্টক সতর্কতা' },
  quick_actions: { en: 'Quick Actions', bn: 'জরুরি কাজের শর্টকাট' },
  sales_vs_collection: { en: 'Sales & Collection Summary', bn: 'বিক্রি ও টাকা আদায়ের চিত্র' },
  today_at_a_glance: { en: "Today at a Glance", bn: 'আজকের হিসাব এক নজরে' },
  owner_summary_title: { en: 'Business Summary', bn: 'ব্যবসার মূল সারসংক্ষেপ' },
  easy_mode_badge: { en: 'Owner View', bn: 'সহজ মোড' },

  // Portals
  hq_portal_title: { en: 'Head Office & Management', bn: 'হেড অফিস ও মূল পরিচালনা' },
  hq_portal_sub: { en: 'Warehouse inventory, employee stock allocation and company finance', bn: 'গুদাম স্টক, কর্মীদের কাছে থাকা মালামাল ও আর্থিক হিসাব' },
  field_portal_title: { en: 'Field Sales Rep App', bn: 'মাঠপর্যায়ের সেলস অ্যাপ' },
  field_portal_sub: { en: 'In-hand stock, direct billing, cash collection and godown transfers', bn: 'নিজের কাছে থাকা ওষুধ, সরাসরি বিক্রি, নগদ কালেকশন ও স্টক গ্রহণ' },
  switch_to_field: { en: 'Switch to Field App', bn: 'মাঠপর্যায়ের অ্যাপে যান' },
  switch_to_hq: { en: 'Switch to Head Office', bn: 'হেড অফিসে যান' },
  van_stock: { en: 'Stock in Hand', bn: 'নিজের কাছে থাকা ওষুধ' },
  cash_collected: { en: "Today's Cash Collection", bn: 'আজকের নগদ কালেকশন' },
  handover_cash: { en: 'Handover Money to Cashier', bn: 'ক্যাশিয়ারের কাছে টাকা জমা দিন' },

  // Common UI
  welcome: { en: 'Welcome', bn: 'স্বাগতম' },
  welcome_back: { en: 'Welcome Back', bn: 'স্বাগতম' },
  login_here: { en: 'Log In to System', bn: 'সিস্টেমে লগইন করুন' },
  emp_id_or_mobile: { en: 'Employee ID or Mobile', bn: 'আইডি বা মোবাইল নম্বর' },
  pin_or_password: { en: 'PIN or Password', bn: 'পিন বা পাসওয়ার্ড' },
  login_button: { en: 'Log In', bn: 'প্রবেশ করুন' },
  logging_in: { en: 'Logging in...', bn: 'প্রবেশ করা হচ্ছে...' },
  help_support: { en: 'Help & Support', bn: 'সহায়তা ও যোগাযোগ' },
  search: { en: 'Search...', bn: 'খুঁজুন...' },
  save: { en: 'Save', bn: 'সংরক্ষণ করুন' },
  saving: { en: 'Saving, please wait...', bn: 'সেভ হচ্ছে, অপেক্ষা করুন...' },
  cancel: { en: 'Cancel', bn: 'বাতিল' },
  add_new: { en: '+ Add New', bn: '+ নতুন যোগ করুন' },
  all: { en: 'All', bn: 'সব' },
  filter: { en: 'Filter', bn: 'ফিল্টার' },
  today: { en: 'Today', bn: 'আজ' },
  last_7_days: { en: 'Last 7 Days', bn: 'গত ৭ দিন' },
  last_30_days: { en: 'Last 30 Days', bn: 'গত ৩০ দিন' },
  actions: { en: 'Actions', bn: 'কার্যক্রম' },
  status: { en: 'Status', bn: 'অবস্থা' },
  date: { en: 'Date', bn: 'তারিখ' },
  total: { en: 'Total', bn: 'মোট' },
  paid: { en: 'Paid', bn: 'পরিশোধিত' },
  due: { en: 'Due', bn: 'বকেয়া বাকি' },
  print_invoice: { en: 'Print Invoice', bn: 'চালান প্রিন্ট' },
  upload_photo: { en: 'Photo (Optional)', bn: 'ছবি (ঐচ্ছিক)' },
  logout: { en: 'Log Out', bn: 'লগআউট' },
  light_mode: { en: 'Light', bn: 'লাইট' },
  dark_mode: { en: 'Dark', bn: 'ডার্ক' },
  theme: { en: 'Theme', bn: 'থিম' },
  language: { en: 'Language', bn: 'ভাষা' },
};

const LanguageContext = createContext<LanguageContextType>({
  mode: 'bn',
  setMode: () => {},
  toggleMode: () => {},
  t: (key) => key,
  formatCurrency: (amount) => `৳ ${(Number(amount) || 0).toLocaleString('en-US')}`,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<LanguageMode>('bn');

  useEffect(() => {
    const saved = localStorage.getItem('senatix_lang_mode') as LanguageMode;
    if (saved && (saved === 'bn' || saved === 'en')) {
      setModeState(saved);
    }
  }, []);

  const setMode = (newMode: LanguageMode) => {
    setModeState(newMode);
    localStorage.setItem('senatix_lang_mode', newMode);
  };

  const toggleMode = () => {
    const next: LanguageMode = mode === 'bn' ? 'en' : 'bn';
    setMode(next);
  };

  const t = (key: string, fallback?: string): string => {
    const entry = translations[key];
    if (!entry) return fallback || key;
    return mode === 'bn' ? entry.bn : entry.en;
  };

  const formatCurrency = (amount: number): string => {
    const num = Number(amount || 0);
    const prefix = mode === 'bn' ? '৳ ' : 'Tk ';
    return `${prefix}${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <LanguageContext.Provider value={{ mode, setMode, toggleMode, t, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
