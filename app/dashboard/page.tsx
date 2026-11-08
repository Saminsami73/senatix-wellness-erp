'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Receipt,
  Boxes,
  Truck,
  BookOpen,
  PieChart,
  ShoppingBag,
  Pin,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  X,
  Plus,
  ChevronRight,
  UserCheck,
  Calendar,
  Users,
  RotateCcw,
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
} from 'recharts';
import { useLanguage } from '@/context/LanguageContext';
import { erpStore } from '@/lib/erpStore';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { Employee, EmpStock } from '@/types/erp';

export default function DashboardPage() {
  const router = useRouter();
  const { mode, t, formatCurrency } = useLanguage();

  const [metrics, setMetrics] = useState(erpStore.getDashboardMetrics());
  const [employees, setEmployees] = useState<Employee[]>(erpStore.getEmployees());
  const [selectedStaff, setSelectedStaff] = useState<Employee | null>(null);
  const [staffStock, setStaffStock] = useState<EmpStock[]>([]);
  const [chartRange, setChartRange] = useState<'today' | '7d' | '30d'>('7d');
  const [user, setUser] = useState<Employee>(erpStore.getCurrentUser());
  const [includeEmpStock, setIncludeEmpStock] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [targetData, setTargetData] = useState(erpStore.getMonthlyTargetData());
  const [trends, setTrends] = useState(erpStore.getSalesVsCollectionTrends('7d'));
  const [showSetTargetModal, setShowSetTargetModal] = useState(false);
  const [targetInput, setTargetInput] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const unsub = erpStore.subscribe(() => {
      setMetrics(erpStore.getDashboardMetrics());
      setEmployees(erpStore.getEmployees());
      setUser(erpStore.getCurrentUser());
      setTargetData(erpStore.getMonthlyTargetData());
      setTrends(erpStore.getSalesVsCollectionTrends(chartRange));
    });
    return unsub;
  }, [chartRange]);

  useEffect(() => {
    setTrends(erpStore.getSalesVsCollectionTrends(chartRange));
  }, [chartRange]);

  const openStaffDrawer = (emp: Employee) => {
    setSelectedStaff(emp);
    setStaffStock(erpStore.getEmpStock(emp.emp_id));
  };

  const currentChartData = mode === 'bn' ? trends.bn : trends.en;

  const now = new Date();
  const dayNamesBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const monthNamesBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const todayDateString = mode === 'bn'
    ? `আজকের দিন: ${dayNamesBn[now.getDay()]}, ${now.getDate()} ${monthNamesBn[now.getMonth()]}`
    : `Today: ${dayNamesEn[now.getDay()]}, ${monthNamesEn[now.getMonth()]} ${now.getDate()}`;

  // Calculate displayed stock based on the optional toggle
  const displayedStockValue = includeEmpStock
    ? (metrics.totalCombinedStockValue || metrics.warehouseStockValue)
    : metrics.warehouseStockValue;

  const displayedStockBoxes = includeEmpStock
    ? (metrics.totalCombinedBoxes || metrics.totalWarehouseBoxes)
    : metrics.totalWarehouseBoxes;

  return (
    <div className="space-y-4">
      {/* SECTION 0: Warm, Approachable Welcome Header for Owner */}
      <div className="bg-[#1b1c20] rounded-xl p-4 sm:p-5 border border-[#252628] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {mode === 'bn' ? `স্বাগতম, ${user.name}` : `Welcome, ${user.name}`}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {mode === 'bn' ? 'মালিক ভিউ' : 'Owner View'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {mode === 'bn'
              ? 'কর্মীদের কাছে থাকা অবিক্রীত ওষুধ, আজকের বিক্রি ও গুদামের হিসাব নিচে এক নজরে দেওয়া হলো।'
              : 'Overview of staff in-hand unsold stock, today’s sales and storage inventory.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-[#15161c] border border-[#252628] text-xs font-medium text-zinc-300 flex items-center space-x-1.5">
            <Calendar className="size-3.5 text-emerald-400" />
            <span>{todayDateString}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: 5 Pastel Cards Row with Optional Staff Unsold Stock Toggle */}
      <div className="bg-[#1b1c20] rounded-xl p-4 border border-[#252628] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#252628]">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="size-4 text-[#6e7176]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {mode === 'bn' ? 'আজকের মূল হিসাব এক নজরে' : 'Key Numbers at a Glance'}
            </h2>
          </div>

          {/* Optional Toggle for Counting Employee Held Unsold Stock */}
          <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer bg-[#15161c] hover:bg-[#252628] px-3 py-1.5 rounded-lg border border-[#252628] transition-colors select-none self-start sm:self-auto">
            <input
              type="checkbox"
              checked={includeEmpStock}
              onChange={(e) => setIncludeEmpStock(e.target.checked)}
              className="rounded accent-emerald-500 size-4 cursor-pointer"
            />
            <span className="font-semibold text-emerald-400">
              {mode === 'bn'
                ? 'কর্মীদের কাছে থাকা অবিক্রীত ওষুধ মোট স্টকে যোগ করুন'
                : 'Include staff unsold stock in total'}
            </span>
          </label>
        </div>

        {/* 5 Pastel Cards Slider / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* Card 1: Mint White #E8F5F1 - Today's Sales */}
          <div className="bg-[#E8F5F1] text-zinc-900 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-black/5">
            <div className="flex items-center justify-between border-b border-zinc-400/30 pb-2">
              <span className="text-xs font-bold text-zinc-800">
                {mode === 'bn' ? 'আজকের বিক্রি' : "Today's Sales"}
              </span>
              <div className="size-2 rounded-full bg-emerald-600 animate-pulse" />
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-zinc-950">
                {formatCurrency(metrics.todaySalesAmount)}
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-700 mt-1.5 font-medium">
                <span>{mode === 'bn' ? 'মোট চালান:' : 'Invoices:'}</span>
                <span className="font-bold text-zinc-900">{metrics.todaySalesCount} {mode === 'bn' ? 'টি' : ''}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Soft Peach #FBECE4 - Today's Cash Collection */}
          <div className="bg-[#FBECE4] text-zinc-900 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-black/5">
            <div className="flex items-center justify-between border-b border-zinc-400/30 pb-2">
              <span className="text-xs font-bold text-zinc-800">
                {mode === 'bn' ? 'আজকের নগদ আদায়' : 'Cash Collected Today'}
              </span>
              <div className="size-2 rounded-full bg-amber-600" />
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-zinc-950">
                {formatCurrency(metrics.todayCollected)}
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-700 mt-1.5 font-medium">
                <span>{mode === 'bn' ? 'নগদ জমা:' : 'Cash in Hand:'}</span>
                <span className="font-bold text-emerald-800">{mode === 'bn' ? 'হাতে জমা' : 'Received'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Soft Coral #F9D8D6 - Employees Unsold In-Hand Stock */}
          <div className="bg-[#F9D8D6] text-zinc-900 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-black/5">
            <div className="flex items-center justify-between border-b border-zinc-400/30 pb-2">
              <span className="text-xs font-bold text-zinc-800">
                {mode === 'bn' ? 'কর্মীদের কাছে অবিক্রীত ওষুধ' : 'Staff Unsold Stock'}
              </span>
              <div className="size-2 rounded-full bg-rose-600" />
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-zinc-950">
                {formatCurrency(metrics.totalEmployeeHeldValue || 0)}
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-700 mt-1.5 font-medium">
                <span>{mode === 'bn' ? 'অবিক্রীত পরিমাণ:' : 'In-hand boxes:'}</span>
                <span className="font-bold text-rose-900">
                  {metrics.totalEmployeeHeldBoxes || 0} {mode === 'bn' ? 'বক্স' : 'boxes'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Soft Lavender #DCD6F7 - Storage & Combined Stock (Optionally Counted) */}
          <div className="bg-[#DCD6F7] text-zinc-900 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-black/5">
            <div className="flex items-center justify-between border-b border-zinc-400/30 pb-2">
              <span className="text-xs font-bold text-zinc-800">
                {includeEmpStock
                  ? (mode === 'bn' ? 'মোট ওষুধ (গুদাম + কর্মী)' : 'Total Stock (Storage + Staff)')
                  : (mode === 'bn' ? 'গুদামে মজুত ওষুধ' : 'Godown Storage Stock')}
              </span>
              <div className="size-2 rounded-full bg-purple-600" />
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-zinc-950">
                {formatCurrency(displayedStockValue)}
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-700 mt-1.5 font-medium">
                <span>{mode === 'bn' ? 'মোট মজুত:' : 'Total boxes:'}</span>
                <span className="font-bold text-zinc-900">
                  {displayedStockBoxes.toLocaleString()} {mode === 'bn' ? 'বক্স' : 'boxes'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 5: Soft Sage #D8E2DC - Expiry and Low Stock */}
          <div className="bg-[#D8E2DC] text-zinc-900 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-black/5">
            <div className="flex items-center justify-between border-b border-zinc-400/30 pb-2">
              <span className="text-xs font-bold text-zinc-800">
                {mode === 'bn' ? 'ওষুধ মেয়াদ ও স্টক' : 'Stock & Expiry Alerts'}
              </span>
              <div className="size-2 rounded-full bg-teal-600" />
            </div>
            <div className="mt-2.5">
              <div className="text-lg font-black text-zinc-950">
                {metrics.expiringCount} {mode === 'bn' ? 'মেয়াদ' : 'Expiring'} | {metrics.lowStockCount} {mode === 'bn' ? 'কম' : 'Low'}
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-700 mt-2 font-medium">
                <span>{mode === 'bn' ? 'সতর্কতা:' : 'Action:'}</span>
                <Link href="/dashboard/inventory?tab=batches" className="text-emerald-800 font-bold hover:underline flex items-center">
                  <span>{mode === 'bn' ? 'চেক করুন' : 'Check List'}</span>
                  <ChevronRight className="size-3 ml-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Easy Quick Action Hub - 5 Big, Friendly Buttons */}
      <div className="bg-[#1b1c20] rounded-xl p-4 border border-[#252628]">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold text-white flex items-center space-x-2">
            <Sparkles className="size-4 text-emerald-400" />
            <span>{mode === 'bn' ? 'জরুরি কাজের শর্টকাট' : 'Quick Actions'}</span>
          </div>
          <span className="text-xs text-zinc-400">
            {mode === 'bn' ? '১-ক্লিকে কাজ শুরু করুন' : '1-click quick access'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Action 1: Make Bill (POS) */}
          <Link
            href="/dashboard/billing"
            className="py-3 px-3 rounded-xl bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 border border-white"
          >
            <Receipt className="size-4 sm:size-5 text-black shrink-0" />
            <span className="truncate">{mode === 'bn' ? 'নতুন চালান তৈরি' : 'Make New Bill'}</span>
          </Link>

          {/* Action 2: Staff In-Hand Stock */}
          <Link
            href="/dashboard/employees"
            className="py-3 px-3 rounded-xl bg-[#35383d] hover:bg-[#43474d] text-zinc-100 font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 border border-[#43474d] transition-all active:scale-95"
          >
            <Users className="size-4 sm:size-5 text-emerald-400 shrink-0" />
            <span className="truncate">{mode === 'bn' ? 'কর্মী ও অবিক্রীত স্টক' : 'Staff In-Hand Stock'}</span>
          </Link>

          {/* Action 3: Warehouse Stock & Factory GRN */}
          <Link
            href="/dashboard/inventory"
            className="py-3 px-3 rounded-xl bg-[#35383d] hover:bg-[#43474d] text-zinc-100 font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 border border-[#43474d] transition-all active:scale-95"
          >
            <Boxes className="size-4 sm:size-5 text-[#fae0d1] shrink-0" />
            <span className="truncate">{mode === 'bn' ? 'গুদামে মজুত ওষুধ' : 'Storage Inventory'}</span>
          </Link>

          {/* Action 4: Orders & Delivery */}
          <Link
            href="/dashboard/orders"
            className="py-3 px-3 rounded-xl bg-[#35383d] hover:bg-[#43474d] text-zinc-100 font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 border border-[#43474d] transition-all active:scale-95"
          >
            <Truck className="size-4 sm:size-5 text-amber-400 shrink-0" />
            <span className="truncate">{mode === 'bn' ? 'অর্ডার ও ডেলিভারি' : 'Orders & Delivery'}</span>
          </Link>

          {/* Action 5: Expenses & Profit */}
          <Link
            href="/dashboard/expenses"
            className="py-3 px-3 rounded-xl bg-[#35383d] hover:bg-[#43474d] text-zinc-100 font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 border border-[#43474d] transition-all active:scale-95 col-span-2 sm:col-span-1"
          >
            <PieChart className="size-4 sm:size-5 text-emerald-400 shrink-0" />
            <span className="truncate">{mode === 'bn' ? 'দৈনিক খরচ ও লাভ' : 'Daily Expenses'}</span>
          </Link>
        </div>
      </div>

      {/* SECTION 3: Sales vs. Collection Chart */}
      <div className="bg-[#1b1c20] rounded-xl p-4 border border-[#252628]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#252628] gap-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="size-4 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                {mode === 'bn' ? 'বিক্রি ও টাকা আদায়ের চিত্র' : 'Sales vs. Cash Collection'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {mode === 'bn' ? 'প্রতিদিনের মোট বিক্রি ও নগদ জমার তুলনা' : 'Comparison of daily sales against cash received'}
              </p>
            </div>
          </div>

          {/* Time range pills with strictly separated language */}
          <div className="inline-flex items-center space-x-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartRange('today')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                chartRange === 'today' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {mode === 'bn' ? 'আজ' : 'Today'}
            </button>
            <button
              type="button"
              onClick={() => setChartRange('7d')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                chartRange === '7d' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {mode === 'bn' ? 'গত ৭ দিন' : 'Last 7 Days'}
            </button>
            <button
              type="button"
              onClick={() => setChartRange('30d')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                chartRange === '30d' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {mode === 'bn' ? 'গত ৩০ দিন' : 'Last 30 Days'}
            </button>
          </div>
        </div>

        {/* Zero Data Informational Notification */}
        {!trends.hasData && (
          <div className="mt-3 p-3 bg-zinc-900/60 border border-dashed border-zinc-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400">
            <div className="flex items-center space-x-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {mode === 'bn'
                  ? 'কোনো বিক্রয় বা নগদ আদায় এখনও রেকর্ড হয়নি (সকল কাল্পনিক ডাটা সাফ করা হয়েছে)। নতুন চালান তৈরি করলে চার্ট স্বয়ংক্রিয়ভাবে সক্রিয় হবে।'
                  : 'Zero sales & cash collection recorded yet (clean production). Chart updates automatically upon creating invoices.'}
              </span>
            </div>
            <Link
              href="/dashboard/billing"
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors shrink-0"
            >
              {mode === 'bn' ? '+ নতুন চালান তৈরি করুন' : '+ Make First Bill'}
            </Link>
          </div>
        )}

        {/* Recharts Bar Graph */}
        <div className="h-64 w-full mt-4">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252628" vertical={false} />
                <XAxis dataKey="name" stroke="#7a7d82" fontSize={11} tickLine={false} />
                <YAxis stroke="#7a7d82" fontSize={11} tickLine={false} tickFormatter={(val) => val === 0 ? '৳0' : `৳${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#15161c',
                    borderColor: '#252628',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`৳ ${Number(value).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Sales" name={mode === 'bn' ? 'মোট বিক্রি' : 'Total Sales'} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Collection" name={mode === 'bn' ? 'নগদ আদায়' : 'Cash Collected'} fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-[#15161c] rounded-lg flex items-center justify-center text-zinc-600 text-xs">
              Loading chart...
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: Team & Field Officers Strip */}
      <div className="bg-[#1b1c20] rounded-xl p-4 border border-[#252628]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Pin className="size-4 text-[#606165]" />
            <div>
              <h2 className="text-sm font-bold text-white">
                {mode === 'bn' ? 'টিম ও কর্মীদের অবিক্রীত স্টক' : 'Team & Staff In-Hand Stock'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {mode === 'bn' ? 'যেকোনো কর্মীর ছবিতে চাপ দিয়ে তার কাছে থাকা অবিক্রীত ওষুধ ও ক্যাশ দেখুন' : 'Tap any employee to view their unsold medicines and cash liability'}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/employees"
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            {mode === 'bn' ? `স্টক হিসাব দেখুন (${employees.length} কর্মী)` : `View Staff Stock (${employees.length})`}
          </Link>
        </div>

        {/* Horizontal Circular Avatar Scroll */}
        <div className="flex items-center space-x-4 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {employees.map((emp) => {
            const isDirector = emp.role === 'super_admin' || emp.role === 'executor';
            const ring = isDirector
              ? 'border-amber-400'
              : emp.is_active
              ? 'border-emerald-500'
              : 'border-zinc-600';

            const empStockItems = erpStore.getEmpStock(emp.emp_id);
            const totalBoxes = empStockItems.reduce((acc, es) => acc + es.qty, 0);

            return (
              <div
                key={emp.emp_id}
                onClick={() => openStaffDrawer(emp)}
                className="flex flex-col items-center shrink-0 cursor-pointer group select-none p-1.5 rounded-xl hover:bg-zinc-800/40 transition-colors relative"
              >
                <div className="p-1 rounded-full group-hover:scale-105 transition-transform relative">
                  <SmartAvatar
                    imageUrl={emp.image_url}
                    name={emp.name}
                    size="lg"
                    ringColor={ring}
                  />
                  {totalBoxes > 0 && (
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow">
                      {totalBoxes}
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-300 group-hover:text-white mt-1 max-w-[80px] truncate text-center font-medium">
                  {emp.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-zinc-500 truncate max-w-[80px]">
                  {totalBoxes > 0 ? `${totalBoxes} ${mode === 'bn' ? 'বক্স' : 'box'}` : emp.emp_id}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: Bottom 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: True Net Profit */}
        <div className="p-4 rounded-xl bg-[#1b1c20] border border-[#252628] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">
              {mode === 'bn' ? 'আসল নিট লাভ' : 'True Net Profit'}
            </span>
            <div className="size-6 rounded-full bg-[#28292d] grid place-items-center text-purple-400 text-xs font-bold">
              ৳
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-3">
            <div className="size-11 rounded-full bg-[#ac9ac6] text-[#3c3c55] grid place-items-center shrink-0">
              <DollarSign className="size-6 font-bold" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {formatCurrency(metrics.netProfit)}
              </div>
              <div className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#5b4d77] text-purple-200">
                +{metrics.profitMargin}% {mode === 'bn' ? 'প্রফিট মার্জিন' : 'Profit Margin'}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Orders */}
        <div className="p-4 rounded-xl bg-[#1b1c20] border border-[#252628] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">
              {mode === 'bn' ? 'ডেলিভারি অপেক্ষমাণ অর্ডার' : 'Pending Deliveries'}
            </span>
            <div className="size-6 rounded-full bg-[#28292d] grid place-items-center text-amber-400 text-xs">
              📦
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-3">
            <div className="size-11 rounded-full bg-[#c4877e] text-[#553a35] grid place-items-center shrink-0">
              <Clock className="size-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {metrics.pendingOrdersCount} {mode === 'bn' ? 'টি অর্ডার' : 'Orders'}
              </div>
              <Link
                href="/dashboard/orders"
                className="inline-flex items-center space-x-1 mt-1 px-2.5 py-1 rounded text-xs font-semibold bg-[#553a35] text-amber-200 hover:underline"
              >
                <span>{mode === 'bn' ? 'ডেলিভারি দিন →' : 'Deliver Now →'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Target Completion */}
        <div className="p-4 rounded-xl bg-[#1b1c20] border border-[#252628] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">
              {mode === 'bn' ? 'মাসিক বিক্রির টার্গেট' : 'Monthly Sales Target'}
            </span>
            <button
              type="button"
              onClick={() => {
                setTargetInput(targetData.targetAmount > 0 ? targetData.targetAmount.toString() : '');
                setShowSetTargetModal(true);
              }}
              title={mode === 'bn' ? 'টার্গেট নির্ধারণ বা পরিবর্তন করুন' : 'Set or edit target'}
              className="text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 transition-colors flex items-center space-x-1"
            >
              <span>{targetData.isTargetSet ? (mode === 'bn' ? 'এডিট ✏️' : 'Edit ✏️') : (mode === 'bn' ? 'সেট করুন +' : 'Set +')}</span>
            </button>
          </div>
          <div className="flex items-center space-x-3 mt-3">
            <div className="size-11 rounded-full bg-[#d9c1b3] text-[#806d63] grid place-items-center shrink-0">
              <TrendingUp className="size-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {formatCurrency(targetData.targetAmount)}
              </div>
              <div className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#806d63] text-emerald-100">
                {targetData.isTargetSet ? (
                  mode === 'bn' ? (
                    `+ ${targetData.percentage}% টার্গেট অর্জিত (বাকি ৳${targetData.remaining.toLocaleString()})`
                  ) : (
                    `+ ${targetData.percentage}% Achieved (Left ৳${targetData.remaining.toLocaleString()})`
                  )
                ) : (
                  mode === 'bn' ? 'টার্গেট নির্ধারণ করা হয়নি' : 'No target set yet'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: SET MONTHLY SALES TARGET */}
      {showSetTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1c20] border border-[#252628] rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <div className="flex items-center space-x-2">
                <TrendingUp className="size-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">
                  {mode === 'bn' ? 'চলতি মাসের বিক্রয় লক্ষ্যমাত্রা' : 'Monthly Sales Target'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSetTargetModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-400">
              <p>
                {mode === 'bn'
                  ? 'এই মাসের জন্য আপনার প্রতিষ্ঠানের মোট বিক্রয় লক্ষ্যমাত্রা (টাকায়) নির্ধারণ করুন:'
                  : 'Enter total monthly sales target in BDT for your company:'}
              </p>
              <input
                type="number"
                min="0"
                step="5000"
                placeholder={mode === 'bn' ? 'যেমন: 500000' : 'e.g. 500000'}
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-full h-11 px-3 bg-[#0b0c10] border border-[#252628] focus:border-emerald-500 rounded-xl text-base text-white font-bold outline-none"
              />
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowSetTargetModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                {mode === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = parseFloat(targetInput) || 0;
                  erpStore.setMonthlyCompanyTarget(val);
                  setTargetData(erpStore.getMonthlyTargetData());
                  setShowSetTargetModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors shadow-lg shadow-emerald-950/40"
              >
                {mode === 'bn' ? 'সংরক্ষণ করুন' : 'Save Target'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK DRAWER FOR SELECTED STAFF MEMBER */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#1b1c20] border-l border-[#252628] h-full p-5 flex flex-col justify-between overflow-y-auto no-scrollbar shadow-2xl animate-fade-in">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
                <div className="flex items-center space-x-3">
                  <SmartAvatar
                    imageUrl={selectedStaff.image_url}
                    name={selectedStaff.name}
                    size="lg"
                    ringColor="border-emerald-500"
                  />
                  <div>
                    <h3 className="font-bold text-base text-white">{selectedStaff.name}</h3>
                    <p className="text-xs text-emerald-400 font-medium">{selectedStaff.designation}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{selectedStaff.phone} | ID: {selectedStaff.emp_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStaff(null)}
                  className="size-8 rounded-full border border-zinc-700 hover:bg-zinc-800 grid place-items-center text-zinc-400 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Staff Stats */}
              <div className="grid grid-cols-2 gap-2 my-4">
                <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="text-xs text-zinc-400">
                    {mode === 'bn' ? 'হাতে থাকা অবিক্রীত ওষুধ:' : 'Unsold Stock in Hand:'}
                  </div>
                  <div className="text-lg font-bold text-rose-400 mt-1">
                    {staffStock.reduce((acc, s) => acc + s.qty, 0)} {mode === 'bn' ? 'বক্স' : 'boxes'}
                  </div>
                </div>
                <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="text-xs text-zinc-400">
                    {mode === 'bn' ? 'হাতে থাকা ক্যাশ টাকা:' : 'Cash Collected:'}
                  </div>
                  <div className="text-lg font-bold text-amber-400 mt-1">
                    {formatCurrency(selectedStaff.current_due_balance)}
                  </div>
                </div>
              </div>

              {/* Unsold Stock Held by this Staff */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span>
                    {mode === 'bn'
                      ? `কর্মীর কাছে থাকা অবিক্রীত ওষুধ (${staffStock.length} আইটেম)`
                      : `Unsold Stock in Hand (${staffStock.length} items)`}
                  </span>
                  <Link
                    href={`/dashboard/employees`}
                    className="text-[#fae0d1] hover:underline text-xs"
                  >
                    {mode === 'bn' ? 'স্টক ম্যানেজ করুন →' : 'Manage Stock →'}
                  </Link>
                </div>

                {staffStock.length === 0 ? (
                  <div className="p-4 bg-[#0b0c10] rounded-xl text-center text-xs text-zinc-500 border border-dashed border-[#252628]">
                    {mode === 'bn'
                      ? 'এই কর্মীর কাছে বর্তমানে কোনো ওষুধ মজুত নেই।'
                      : 'No stock is currently held by this staff member.'}
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar">
                    {staffStock.map((es) => (
                      <div
                        key={es.id}
                        className="p-2.5 bg-[#0b0c10] rounded-xl border border-[#252628] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{es.product_name}</div>
                          <div className="text-xs text-zinc-400">{mode === 'bn' ? 'ব্যাচ:' : 'Batch:'} {es.batch_no}</div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 bg-[#15161c] text-emerald-400 border border-[#252628] rounded font-bold">
                            {es.qty} {mode === 'bn' ? 'বক্স' : 'boxes'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#252628] space-y-2">
              <Link
                href="/dashboard/employees"
                className="w-full py-3 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md active:scale-95 transition-all"
              >
                <Plus className="size-4" />
                <span>{mode === 'bn' ? 'গুদাম থেকে কর্মীকে ওষুধ দিন' : 'Issue Stock to Employee'}</span>
              </Link>
              <button
                onClick={() => setSelectedStaff(null)}
                className="w-full py-2.5 bg-[#15161c] hover:bg-[#252628] text-zinc-300 text-xs sm:text-sm rounded-xl font-medium border border-[#252628] transition-colors"
              >
                {mode === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
