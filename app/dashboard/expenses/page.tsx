'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Plus,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  X,
  CreditCard,
  Building,
  Fuel,
  Coffee,
  CheckCircle,
} from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { useLanguage } from '@/context/LanguageContext';
import { Expense, ExpenseCategory } from '@/types/erp';
import { exportSingleTableToExcel } from '@/lib/excelExport';

export default function ExpensesAndProfitPage() {
  const { mode, formatCurrency } = useLanguage();

  const [expenses, setExpenses] = useState<Expense[]>(erpStore.getExpenses());
  const [metrics, setMetrics] = useState(erpStore.getDashboardMetrics());

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Other_Expense');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newMethod, setNewMethod] = useState<'Cash' | 'Bank' | 'bKash'>('Cash');

  useEffect(() => {
    const unsub = erpStore.subscribe(() => {
      setExpenses(erpStore.getExpenses());
      setMetrics(erpStore.getDashboardMetrics());
    });
    return unsub;
  }, []);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || newAmount <= 0) return;

    erpStore.addExpense({
      expense_date: new Date().toISOString().split('T')[0],
      category: newCategory,
      title: newTitle,
      amount: newAmount,
      payment_method: newMethod,
    });

    alert(mode === 'bn' ? 'কোম্পানির খরচ সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Company expense logged successfully!');
    setShowAddModal(false);
    setNewTitle('');
    setNewAmount(0);
  };

  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Office_Warehouse_Rent':
        return Building;
      case 'Delivery_Van_Fuel':
        return Fuel;
      case 'Staff_Tea_Entertainment':
        return Coffee;
      case 'Salary_Payout':
        return CreditCard;
      default:
        return DollarSign;
    }
  };

  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Delivery_Van_Fuel':
        return mode === 'bn' ? 'গাড়ি ও জ্বালানি খরচ' : 'Delivery Van and Fuel';
      case 'Office_Warehouse_Rent':
        return mode === 'bn' ? 'অফিস ও গুদাম ভাড়া' : 'Office and Godown Rent';
      case 'Electricity_Internet':
        return mode === 'bn' ? 'বিদ্যুৎ ও ইন্টারনেট বিল' : 'Electricity and Internet';
      case 'Staff_Tea_Entertainment':
        return mode === 'bn' ? 'কর্মী চা ও আপ্যায়ন' : 'Staff Refreshment';
      case 'Packaging_Printing':
        return mode === 'bn' ? 'প্যাকিং ও প্রিন্টিং' : 'Packaging and Printing';
      case 'Salary_Payout':
        return mode === 'bn' ? 'বেতন পরিশোধ' : 'Salary Payout';
      default:
        return mode === 'bn' ? 'অন্যান্য বিবিধ খরচ' : 'Miscellaneous Expense';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#252628] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="size-9 rounded-xl bg-rose-500/20 border border-rose-500/30 grid place-items-center text-rose-400">
            <PieChart className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {mode === 'bn' ? 'কোম্পানি খরচ ও লাভ-ক্ষতির হিসাব' : 'Expenses and Net Profit Overview'}
            </h1>
            <p className="text-xs text-zinc-400">
              {mode === 'bn'
                ? 'দৈনিক অফিস খরচ, গাড়ি ও জ্বালানি খরচ এবং নিট মুনাফার হিসাব'
                : 'Daily office overheads, vehicle fuel and true net profit tracking'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportSingleTableToExcel(expenses, 'Senatix_Expenses_List')}
            className="px-3.5 py-2 bg-[#1b1c20] hover:bg-[#252628] text-zinc-300 rounded-xl text-xs flex items-center space-x-1.5 border border-[#252628] transition-colors"
          >
            <FileSpreadsheet className="size-4 text-zinc-400" />
            <span>{mode === 'bn' ? 'এক্সেল ডাউনলোড' : 'Export Excel'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus className="size-4" />
            <span>{mode === 'bn' ? '+ নতুন খরচ যোগ' : '+ Add Expense'}</span>
          </button>
        </div>
      </div>

      {/* TRUE NET PROFIT BREAKDOWN CARD */}
      <div className="p-5 bg-[#1b1c20] rounded-2xl border border-[#252628] shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="size-5 text-[#fae0d1]" />
            <h2 className="font-bold text-sm sm:text-base text-white">
              {mode === 'bn' ? 'আসল নিট লাভের হিসাব' : 'True Net Profit Calculation'}
            </h2>
          </div>
          <span className="text-xs text-zinc-300 bg-[#0b0c10] px-3 py-1 rounded-full border border-[#252628]">
            {mode === 'bn' ? 'মুনাফা মার্জিন: ' : 'Profit Margin: '}
            <strong className="text-white">+{metrics.profitMargin}%</strong>
          </span>
        </div>

        <p className="text-xs text-zinc-400">
          {mode === 'bn'
            ? 'হিসাব: মোট বিক্রয় মূল্য – ফ্যাক্টরি কেনা খরচ – অফিস ও গাড়ি খরচ – নষ্ট ওষুধের ক্ষতি = আসল লাভ'
            : 'Formula: Total Sales - Factory Cost - Operating Expenses - Damaged Stock Loss = Net Profit'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-[#0b0c10] rounded-xl border border-[#252628]">
            <span className="text-[11px] text-zinc-400">
              {mode === 'bn' ? 'মোট বিক্রয় আয়' : 'Total Revenue'}
            </span>
            <div className="text-base font-bold text-white mt-1">
              {formatCurrency(erpStore.getInvoices().reduce((acc, i) => acc + Number(i.net_payable || 0), 0))}
            </div>
          </div>

          <div className="p-3 bg-[#0b0c10] rounded-xl border border-[#252628]">
            <span className="text-[11px] text-zinc-400">
              {mode === 'bn' ? 'ফ্যাক্টরি কেনা খরচ' : 'Factory Cost'}
            </span>
            <div className="text-base font-bold text-zinc-300 mt-1">
              -{formatCurrency(erpStore.getInvoices().reduce((acc, i) => acc + Number(i.total_factory_cost_dp || 0), 0))}
            </div>
          </div>

          <div className="p-3 bg-[#0b0c10] rounded-xl border border-[#252628]">
            <span className="text-[11px] text-zinc-400">
              {mode === 'bn' ? 'অফিস ও গাড়ি খরচ' : 'Operating Overheads'}
            </span>
            <div className="text-base font-bold text-rose-400 mt-1">
              -{formatCurrency(totalExpenses)}
            </div>
          </div>

          <div className="p-3 bg-[#0b0c10] rounded-xl border border-[#252628]">
            <span className="text-[11px] text-[#fae0d1] font-semibold">
              {mode === 'bn' ? 'আসল নিট মুনাফা' : 'True Net Profit'}
            </span>
            <div className="text-lg font-bold text-white mt-1">
              {formatCurrency(metrics.netProfit)}
            </div>
          </div>
        </div>
      </div>

      {/* Expenses History List */}
      <div className="bg-[#1b1c20] rounded-xl border border-[#252628] overflow-hidden">
        <div className="p-4 border-b border-[#252628] flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-300">
            {mode === 'bn'
              ? `কোম্পানির খরচের তালিকা (${expenses.length} টি ভাউচার)`
              : `Company Expense Records (${expenses.length} Vouchers)`}
          </h3>
          <span className="text-xs text-zinc-400">
            {mode === 'bn' ? 'সর্বমোট খরচ: ' : 'Total Expenses: '}
            <strong className="text-rose-400">৳ {totalExpenses.toLocaleString()}</strong>
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#15161c] text-zinc-400 border-b border-[#252628]">
              <tr>
                <th className="p-3">{mode === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="p-3">{mode === 'bn' ? 'খরচের খাত' : 'Category'}</th>
                <th className="p-3">{mode === 'bn' ? 'বিবরণ' : 'Description'}</th>
                <th className="p-3">{mode === 'bn' ? 'এন্ট্রি করেছেন' : 'Logged By'}</th>
                <th className="p-3">{mode === 'bn' ? 'মাধ্যম' : 'Method'}</th>
                <th className="p-3 text-right">{mode === 'bn' ? 'টাকার পরিমাণ' : 'Amount'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252628]">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <div className="space-y-2.5">
                      <p className="text-zinc-400 text-xs">
                        {mode === 'bn'
                          ? 'সিস্টেমে কোনো ব্যয় তালিকাভুক্ত নেই (সকল ডেমো ডাটা সাফ করা হয়েছে)।'
                          : 'No expense records found. Pure commercial production mode active.'}
                      </p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{mode === 'bn' ? '+ নতুন খরচ যোগ করুন' : '+ Log First Expense'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => {
                  const Icon = getCategoryIcon(exp.category);
                  return (
                    <tr key={exp.id} className="hover:bg-[#1f2026] transition-colors">
                      <td className="p-3 text-zinc-400 font-mono text-[11px]">
                        {exp.expense_date}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1.5">
                          <Icon className="size-3.5 text-zinc-400" />
                          <span className="text-white font-medium">{getCategoryLabel(exp.category)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-zinc-300 font-medium">
                        {exp.title}
                      </td>
                      <td className="p-3 text-zinc-400 text-[11px]">
                        {exp.entered_by_name || 'Admin'}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
                          {exp.payment_method}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-rose-400 text-sm">
                        ৳ {exp.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1c20] border border-[#252628] rounded-xl max-w-sm w-full p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <h3 className="font-bold text-base">
                {mode === 'bn' ? 'নতুন খরচ এন্ট্রি' : 'Add New Expense'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="py-4 space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'খরচের খাত নির্বাচন করুন *' : 'Expense Category *'}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white outline-none"
                >
                  <option value="Delivery_Van_Fuel">{mode === 'bn' ? 'গাড়ি ও জ্বালানি খরচ' : 'Delivery Van and Fuel'}</option>
                  <option value="Office_Warehouse_Rent">{mode === 'bn' ? 'অফিস ও গুদাম ভাড়া' : 'Office and Godown Rent'}</option>
                  <option value="Electricity_Internet">{mode === 'bn' ? 'বিদ্যুৎ ও ইন্টারনেট বিল' : 'Electricity and Internet'}</option>
                  <option value="Staff_Tea_Entertainment">{mode === 'bn' ? 'কর্মী চা ও আপ্যায়ন' : 'Staff Refreshment'}</option>
                  <option value="Packaging_Printing">{mode === 'bn' ? 'প্যাকিং ও প্রিন্টিং' : 'Packaging and Printing'}</option>
                  <option value="Salary_Payout">{mode === 'bn' ? 'বেতন পরিশোধ' : 'Salary Payout'}</option>
                  <option value="Other_Expense">{mode === 'bn' ? 'অন্যান্য বিবিধ খরচ' : 'Miscellaneous'}</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'খরচের বিবরণ *' : 'Expense Description *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={mode === 'bn' ? 'যেমন: ভ্যান অকটেন ও মবিল' : 'e.g. Van fuel and maintenance'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'টাকার পরিমাণ (৳) *' : 'Amount (Tk) *'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-3 bg-zinc-900 border border-rose-500/50 rounded-lg text-base font-bold text-white outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'পরিশোধ মাধ্যম' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['Cash', 'Bank', 'bKash'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setNewMethod(m)}
                      className={`py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        newMethod === m
                          ? 'bg-[#35383d] text-white shadow-sm'
                          : 'bg-[#0b0c10] text-zinc-400 border border-[#252628]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.99]"
                >
                  {mode === 'bn' ? 'খরচ সংরক্ষণ করুন' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
