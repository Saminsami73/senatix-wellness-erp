'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  BarChart2,
  PieChart as PieIcon,
  ShieldCheck,
  Database,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { erpStore } from '@/lib/erpStore';
import { useLanguage } from '@/context/LanguageContext';
import { exportFullCompanyBackup } from '@/lib/excelExport';

export default function ReportsAndBackupPage() {
  const { mode, formatCurrency } = useLanguage();

  const [metrics, setMetrics] = useState(erpStore.getDashboardMetrics());
  const [employees, setEmployees] = useState(erpStore.getEmployees());
  const [products, setProducts] = useState(erpStore.getProducts());
  const [invoices, setInvoices] = useState(erpStore.getInvoices());
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);

  useEffect(() => {
    const unsub = erpStore.subscribe(() => {
      setMetrics(erpStore.getDashboardMetrics());
      setEmployees(erpStore.getEmployees());
      setProducts(erpStore.getProducts());
      setInvoices(erpStore.getInvoices());
    });
    return unsub;
  }, []);

  const handleFullBackup = () => {
    setIsBackingUp(true);
    try {
      const allData = erpStore.getAllDataForBackup();
      exportFullCompanyBackup(allData);
      setLastBackupTime(new Date().toLocaleTimeString());
      alert(
        mode === 'bn'
          ? 'কোম্পানির সকল টেবিলের সম্পূর্ণ এক্সেল ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!'
          : 'Complete company Excel backup downloaded successfully!'
      );
    } catch (err: any) {
      alert(err.message || 'Backup failed');
    } finally {
      setIsBackingUp(false);
    }
  };

  const topProductsData = products.slice(0, 5).map((p) => ({
    name: p.name.split(' ')[0],
    Stock: p.stock,
    TP: p.trade_price_tp,
  }));

  // Dynamically calculate territory sales distribution from real invoices and markets
  const markets = erpStore.getMarkets();

  const marketMap: Record<string, number> = {};
  invoices.forEach((inv) => {
    if (inv.order_status !== 'Cancelled') {
      const mkt = markets.find((m) => m.id === inv.market_id);
      const name = mkt ? mkt.name : (mode === 'bn' ? 'সরাসরি বিক্রয়' : 'Direct Sales');
      marketMap[name] = (marketMap[name] || 0) + Number(inv.net_payable || 0);
    }
  });

  const totalMarketSales = Object.values(marketMap).reduce((a, b) => a + b, 0);

  const marketPieData = totalMarketSales > 0
    ? Object.entries(marketMap).map(([name, val]) => ({
        name,
        value: Math.round((val / totalMarketSales) * 100),
      }))
    : [];

  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#252628] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="size-9 rounded-xl bg-[#1b1c20] border border-[#252628] grid place-items-center text-[#fae0d1]">
            <FileSpreadsheet className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {mode === 'bn' ? 'রিপোর্ট ও পূর্ণাঙ্গ ব্যাকআপ' : 'Reports and Company Backup'}
            </h1>
            <p className="text-xs text-zinc-400">
              {mode === 'bn'
                ? 'কোম্পানির আর্থিক রিপোর্ট এবং এক ক্লিকে পূর্ণাঙ্গ এক্সেল ফাইল ব্যাকআপ'
                : 'Company analytics and one-click full Excel offline backup'}
            </p>
          </div>
        </div>

        {/* 1-Click Excel Backup Button */}
        <button
          onClick={handleFullBackup}
          disabled={isBackingUp}
          className="px-5 py-2.5 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-xs sm:text-sm rounded-xl flex items-center space-x-2 shadow-md active:scale-95 transition-all shrink-0 self-start sm:self-auto"
        >
          <Download className="size-4 text-black" />
          <span>
            {isBackingUp
              ? mode === 'bn' ? 'ব্যাকআপ ডাউনলোড হচ্ছে...' : 'Backing up...'
              : mode === 'bn' ? 'সম্পূর্ণ এক্সেল ব্যাকআপ ডাউনলোড' : 'Download Complete Backup'}
          </span>
        </button>
      </div>

      {/* 1-CLICK BACKUP HIGHLIGHT CARD */}
      <div className="p-5 bg-[#1b1c20] rounded-2xl border border-[#252628] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="size-5 text-[#fae0d1]" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              {mode === 'bn' ? 'কোম্পানির সকল তথ্যের অফলাইন ব্যাকআপ' : 'Complete Offline Data Security Backup'}
            </h2>
          </div>
          <p className="text-xs text-zinc-300 max-w-xl">
            {mode === 'bn'
              ? 'চালান, ওষুধ স্টক, ক্রেতা হিসাব, কর্মী ও খরচের যাবতীয় তথ্য এক ক্লিকে এক্সেল ফাইলে সংরক্ষণ করুন। কোনো তথ্য হারানোর কোনো ঝুঁকি থাকবে না।'
              : 'Save all invoices, medicine inventory, customer records, staff stock and expenses offline to Excel anytime.'}
          </p>
          {lastBackupTime && (
            <div className="text-[11px] text-[#fae0d1] font-semibold pt-1">
              {mode === 'bn' ? 'সর্বশেষ ব্যাকআপ নেওয়া হয়েছে: ' : 'Last backup completed: '}
              {lastBackupTime}
            </div>
          )}
        </div>

        <button
          onClick={handleFullBackup}
          className="px-4 py-2 bg-[#35383d] hover:bg-[#42464d] text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Database className="size-4 text-[#fae0d1]" />
          <span>{mode === 'bn' ? 'সকল শিট ব্যাকআপ নিন' : 'Download All Sheets'}</span>
        </button>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Top Medicines Inventory vs TP */}
        <div className="p-4 bg-[#1b1c20] rounded-xl border border-[#252628] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart2 className="size-4 text-[#fae0d1]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                {mode === 'bn' ? 'শীর্ষ ওষুধের মজুত ও বিক্রয় দর' : 'Top Medicines Inventory and Price'}
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500">
              {mode === 'bn' ? 'মজুত চিত্র' : 'Inventory Level'}
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            {topProductsData.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-4 border border-dashed border-[#252628] rounded-xl space-y-1">
                <BarChart2 className="size-8 text-zinc-600 mb-1" />
                <p>{mode === 'bn' ? 'কোনো ওষুধ এখনও মজুত নেই।' : 'No medicines in inventory yet.'}</p>
                <p className="text-[11px] text-zinc-600">
                  {mode === 'bn' ? 'ইনভেন্টরিতে ওষুধ যোগ করলে মজুত চার্ট দেখা যাবে।' : 'Stock chart will populate once products are added.'}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252628" vertical={false} />
                  <XAxis dataKey="name" stroke="#606165" fontSize={11} tickLine={false} />
                  <YAxis stroke="#606165" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#15161c',
                      borderColor: '#252628',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar
                    dataKey="Stock"
                    name={mode === 'bn' ? 'মজুত (বক্স)' : 'Stock (Boxes)'}
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="TP"
                    name={mode === 'bn' ? 'বিক্রয় দর (টাকা)' : 'Trade Price (Tk)'}
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Route Territory Distribution */}
        <div className="p-4 bg-[#1b1c20] rounded-xl border border-[#252628] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PieIcon className="size-4 text-amber-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                {mode === 'bn' ? 'অঞ্চলভিত্তিক বিক্রয় বিস্তার' : 'Territory Sales Distribution'}
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500">
              {mode === 'bn' ? 'মার্কেট শেয়ার' : 'Regional Share'}
            </span>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {marketPieData.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-4 border border-dashed border-[#252628] rounded-xl space-y-1">
                <PieIcon className="size-8 text-zinc-600 mb-1" />
                <p>{mode === 'bn' ? 'কোনো আঞ্চলিক বিক্রয় এখনও রেকর্ড হয়নি।' : 'No regional sales recorded yet.'}</p>
                <p className="text-[11px] text-zinc-600">
                  {mode === 'bn' ? 'চালান তৈরি করলে এলাকাভিত্তিক মার্কেট শেয়ার পাই-চার্ট প্রদর্শিত হবে।' : 'Territory distribution will populate upon billing.'}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {marketPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#15161c',
                      borderColor: '#252628',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value}%`, mode === 'bn' ? 'শেয়ার' : 'Share']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Field Force Performance Table */}
      <div className="bg-[#1b1c20] rounded-xl border border-[#252628] overflow-hidden">
        <div className="p-4 border-b border-[#252628] flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-white">
            {mode === 'bn' ? 'সেলস অফিসারদের পারফরম্যান্স রিপোর্ট' : 'Sales Officers Performance Report'}
          </h3>
          <span className="text-xs text-zinc-400">
            {mode === 'bn' ? 'মোট কর্মী: ' : 'Staff Count: '}
            <strong className="text-white">{employees.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#15161c] text-zinc-400 border-b border-[#252628]">
              <tr>
                <th className="p-3">{mode === 'bn' ? 'কর্মীর নাম ও আইডি' : 'Staff Name & ID'}</th>
                <th className="p-3">{mode === 'bn' ? 'পদবি' : 'Designation'}</th>
                <th className="p-3 text-right">{mode === 'bn' ? 'বেসিক বেতন' : 'Base Salary'}</th>
                <th className="p-3 text-right">{mode === 'bn' ? 'কমিশন হার' : 'Commission Rate'}</th>
                <th className="p-3 text-right">{mode === 'bn' ? 'হাতে থাকা ক্যাশ' : 'Cash in Hand'}</th>
                <th className="p-3 text-center">{mode === 'bn' ? 'অবস্থা' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252628]">
              {employees.map((emp) => (
                <tr key={emp.emp_id} className="hover:bg-[#1f2026] transition-colors">
                  <td className="p-3 font-semibold text-white">
                    {emp.name} <span className="text-zinc-500 font-mono text-[10px]">({emp.emp_id})</span>
                  </td>
                  <td className="p-3 text-zinc-400">{emp.designation}</td>
                  <td className="p-3 text-right font-medium text-white">
                    ৳ {emp.base_salary.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-zinc-100 font-bold">
                    {emp.commission_percent}%
                  </td>
                  <td className="p-3 text-right font-bold text-amber-400">
                    ৳ {emp.current_due_balance.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-[#15161c] text-emerald-300 border border-emerald-500/20 text-[10px] font-semibold">
                      {mode === 'bn' ? 'সক্রিয়' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
