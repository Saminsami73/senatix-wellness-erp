'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Boxes,
  DollarSign,
  CalendarCheck,
  RotateCcw,
  PackagePlus,
  FileDown,
  Building2,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { useLanguage } from '@/context/LanguageContext';
import { Employee, Invoice, EmpStock, Product, ProductBatch } from '@/types/erp';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { generateInvoicePDF } from '@/lib/pdfGenerator';

export default function FieldAppPage() {
  const { mode, formatCurrency } = useLanguage();

  const [currentUser, setCurrentUser] = useState<Employee>(erpStore.getCurrentUser());
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [empStock, setEmpStock] = useState<EmpStock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<ProductBatch[]>([]);

  // Modals
  const [showTakeStockModal, setShowTakeStockModal] = useState(false);
  const [showReturnStockModal, setShowReturnStockModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [transferQty, setTransferQty] = useState(1);

  // Return Stock state
  const [returnEmpStockItem, setReturnEmpStockItem] = useState<EmpStock | null>(null);
  const [returnQty, setReturnQty] = useState(1);

  const [attendanceSuccess, setAttendanceSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'in_hand_stock' | 'transfer_return' | 'today_memos'>('in_hand_stock');

  const refreshData = () => {
    const user = erpStore.getCurrentUser();
    setCurrentUser(user);
    const allInvs = erpStore.getInvoices();
    setInvoices(allInvs.filter((i) => i.emp_id === user.emp_id));
    setEmpStock(erpStore.getEmpStock(user.emp_id));
    setProducts(erpStore.getProducts());
    setBatches(erpStore.getProductBatches());
  };

  useEffect(() => {
    refreshData();
    const unsub = erpStore.subscribe(refreshData);
    return unsub;
  }, []);

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayInvoices = invoices.filter((i) => i.date_only === todayDateStr);
  const todayCashCollected = todayInvoices.reduce((acc, i) => acc + (i.paid_amount || 0), 0);
  const todaySalesCount = todayInvoices.length;
  const totalHeldBoxes = empStock.reduce((acc, s) => acc + (s.qty || 0), 0);
  const totalHeldValue = empStock.reduce((acc, s) => acc + (s.qty || 0) * (s.tp || 0), 0);

  const handleMarkAttendance = () => {
    erpStore.markAttendance(currentUser.emp_id, 'Present_Market_Duty', todayDateStr);
    setAttendanceSuccess(true);
    setTimeout(() => setAttendanceSuccess(false), 3000);
  };

  const handleTakeStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedBatchId || transferQty <= 0) {
      alert(mode === 'bn' ? 'অনুগ্রহ করে ওষুধ ও ব্যাচ সঠিকভাবে নির্বাচন করুন।' : 'Please select medicine and batch correctly.');
      return;
    }

    try {
      erpStore.transferStockToEmployee(currentUser.emp_id, selectedProductId, selectedBatchId, transferQty);
      alert(
        mode === 'bn'
          ? `গুদাম থেকে ${transferQty} বক্স ওষুধ আপনার কাছে সফলভাবে হস্তান্তর করা হয়েছে!`
          : `Successfully transferred ${transferQty} boxes to your in-hand stock!`
      );
      setShowTakeStockModal(false);
      setSelectedProductId('');
      setSelectedBatchId('');
      setTransferQty(1);
    } catch (err: any) {
      alert(err.message || 'Stock transfer failed');
    }
  };

  const handleReturnStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnEmpStockItem || returnQty <= 0) return;

    try {
      erpStore.transferStockBackToWarehouse(
        currentUser.emp_id,
        returnEmpStockItem.product_id,
        returnEmpStockItem.batch_id,
        returnQty
      );
      alert(
        mode === 'bn'
          ? `${returnQty} বক্স ওষুধ প্রধান গুদামে সফলভাবে ফেরত পাঠানো হয়েছে!`
          : `Returned ${returnQty} boxes back to main storage!`
      );
      setShowReturnStockModal(false);
      setReturnEmpStockItem(null);
      setReturnQty(1);
    } catch (err: any) {
      alert(err.message || 'Return failed');
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12">
      {/* Top Banner: Rep Identity & Switcher */}
      <div className="bg-[#15161c] border border-[#252628] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <SmartAvatar
            imageUrl={currentUser.image_url}
            name={currentUser.name}
            size="lg"
            ringColor="border-[#86759f]"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#86759f]/20 text-[#86759f] border border-[#86759f]/30">
                {currentUser.emp_id}
              </span>
              <h1 className="text-base sm:text-lg font-bold text-white">
                {currentUser.name}
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {currentUser.designation} • <span className="text-[#fae0d1] font-medium">{currentUser.phone}</span>
            </p>
          </div>
        </div>

        {/* Attendance & HQ Switcher */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleMarkAttendance}
            className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
              attendanceSuccess
                ? 'bg-white text-[#0b0c10] font-bold shadow-md'
                : 'bg-[#35383d] hover:bg-[#43474d] text-zinc-100 border border-[#43474d]'
            }`}
          >
            <CalendarCheck className="size-3.5" />
            <span>
              {attendanceSuccess
                ? mode === 'bn' ? '✓ হাজিরা সম্পন্ন!' : '✓ Attendance Logged!'
                : mode === 'bn' ? 'আজকের হাজিরা দিন' : 'Clock In Attendance'}
            </span>
          </button>

          <Link
            href="/dashboard"
            className="h-9 px-3.5 rounded-xl bg-[#1b1c20] hover:bg-[#252628] text-zinc-300 text-xs font-medium flex items-center space-x-1.5 border border-[#252628] transition-colors"
          >
            <Building2 className="size-3.5 text-[#fae0d1]" />
            <span>{mode === 'bn' ? 'হেড অফিস ভিউ' : 'HQ Dashboard'}</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Today's Cash Collection */}
        <div className="bg-[#15161c] border border-[#252628] rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>{mode === 'bn' ? 'আজকের নগদ কালেকশন' : 'Today’s Cash'}</span>
            <DollarSign className="size-4 text-[#fae0d1]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1.5">
            {formatCurrency(todayCashCollected)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {todaySalesCount} {mode === 'bn' ? 'টি মেমো থেকে আদায়' : 'bills collected today'}
          </div>
        </div>

        {/* Stat 2: My In-Hand Unsold Medicines */}
        <div className="bg-[#15161c] border border-[#252628] rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>{mode === 'bn' ? 'হাতে থাকা অবিক্রীত ওষুধ' : 'Unsold Stock In-Hand'}</span>
            <Boxes className="size-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1.5">
            {totalHeldBoxes} <span className="text-xs font-normal text-zinc-400">{mode === 'bn' ? 'বক্স' : 'boxes'}</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {empStock.length} {mode === 'bn' ? 'টি ওষুধ' : 'items'} • {formatCurrency(totalHeldValue)}
          </div>
        </div>

        {/* Stat 3: Today's Sales Count */}
        <div className="bg-[#15161c] border border-[#252628] rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>{mode === 'bn' ? 'আজকের তৈরি মেমো' : 'Today’s Bills'}</span>
            <Receipt className="size-4 text-[#86759f]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1.5">
            {todaySalesCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {mode === 'bn' ? 'গ্রাহকদের দেয়া চালান' : 'Customer receipts'}
          </div>
        </div>

        {/* Stat 4: Office Liability Balance */}
        <div className="bg-[#15161c] border border-[#252628] rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>{mode === 'bn' ? 'অফিসে জমাযোগ্য ক্যাশ' : 'Cash In Hand for Office'}</span>
            <DollarSign className="size-4 text-[#de9489]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1.5">
            {formatCurrency(currentUser.current_due_balance || 0)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {mode === 'bn' ? 'অফিস ক্যাশে জমা দিন' : 'Hand over to office'}
          </div>
        </div>
      </div>

      {/* Fast Operational Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Link
          href="/dashboard/billing"
          className="p-3.5 rounded-2xl bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-xs flex items-center justify-between transition-transform active:scale-95 shadow-md"
        >
          <div className="flex items-center space-x-2.5">
            <div className="size-8 rounded-xl bg-black/10 grid place-items-center">
              <Receipt className="size-4 text-black" />
            </div>
            <div>
              <div className="font-bold">{mode === 'bn' ? 'নতুন বিল ও রসিদ তৈরি' : 'Make New Bill'}</div>
              <div className="text-[10px] text-zinc-600 font-normal">{mode === 'bn' ? 'সরাসরি চালান প্রিন্ট করুন' : 'Instant print invoice'}</div>
            </div>
          </div>
          <span className="text-xs font-bold text-black">➔</span>
        </Link>

        <button
          type="button"
          onClick={() => setShowTakeStockModal(true)}
          className="p-3.5 rounded-2xl bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] text-white font-bold text-xs flex items-center justify-between transition-transform active:scale-95"
        >
          <div className="flex items-center space-x-2.5">
            <div className="size-8 rounded-xl bg-emerald-500/10 grid place-items-center">
              <PackagePlus className="size-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="font-bold">{mode === 'bn' ? 'গুদাম থেকে ওষুধ গ্রহণ' : 'Take Stock from Godown'}</div>
              <div className="text-[10px] text-zinc-400 font-normal">{mode === 'bn' ? 'বিক্রির জন্য মাল নিন' : 'Receive in-hand stock'}</div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400">+</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (empStock.length === 0) {
              alert(mode === 'bn' ? 'আপনার কাছে ফেরত দেওয়ার মতো কোনো অবিক্রীত ওষুধ নেই।' : 'No in-hand stock to return.');
              return;
            }
            setReturnEmpStockItem(empStock[0]);
            setReturnQty(1);
            setShowReturnStockModal(true);
          }}
          className="p-3.5 rounded-2xl bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] text-white font-bold text-xs flex items-center justify-between transition-transform active:scale-95"
        >
          <div className="flex items-center space-x-2.5">
            <div className="size-8 rounded-xl bg-amber-500/10 grid place-items-center">
              <RotateCcw className="size-4 text-amber-400" />
            </div>
            <div className="text-left">
              <div className="font-bold">{mode === 'bn' ? 'অবিক্রীত ওষুধ ফেরত' : 'Return Unsold Stock'}</div>
              <div className="text-[10px] text-zinc-400 font-normal">{mode === 'bn' ? 'গুদামে ওষুধ বুঝিয়ে দিন' : 'Send back to storage'}</div>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-400">↺</span>
        </button>
      </div>

      {/* Main Tabbed Workflow Container */}
      <div className="bg-[#15161c] border border-[#252628] rounded-2xl p-4 sm:p-5">
        {/* Sub-tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-[#252628] pb-3 mb-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('in_hand_stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'in_hand_stock'
                ? 'bg-[#35383d] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {mode === 'bn' ? 'আমার কাছে থাকা অবিক্রীত ওষুধ' : 'My In-Hand Unsold Stock'} ({empStock.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('today_memos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'today_memos'
                ? 'bg-[#35383d] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {mode === 'bn' ? 'আজকের বিক্রয় চালান ও রশিদ' : 'Today’s Invoices and Receipts'} ({todayInvoices.length})
          </button>
        </div>

        {/* TAB 1: My In-Hand Unsold Stock */}
        {activeTab === 'in_hand_stock' && (
          <div className="space-y-3">
            {empStock.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs border border-dashed border-[#252628] rounded-xl space-y-2">
                <Boxes className="size-8 text-zinc-600 mx-auto" />
                <p>
                  {mode === 'bn'
                    ? 'আপনার কাছে বর্তমানে কোনো অবিক্রীত ওষুধ নেই।'
                    : 'You currently have no unsold stock in hand.'}
                </p>
                <button
                  onClick={() => setShowTakeStockModal(true)}
                  className="px-3.5 py-1.5 bg-white text-[#0b0c10] text-xs font-bold rounded-lg shadow-sm"
                >
                  {mode === 'bn' ? '+ গুদাম থেকে ওষুধ নিন' : '+ Take Stock from Godown'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {empStock.map((stk) => {
                  const prod = products.find((p) => p.id === stk.product_id);
                  const lineTotalValue = stk.qty * (stk.tp || prod?.trade_price_tp || 0);

                  return (
                    <div
                      key={stk.id}
                      className="p-3.5 rounded-xl bg-[#1b1c20] border border-[#252628] hover:border-[#35383d] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <SmartAvatar
                          imageUrl={prod?.image_url}
                          name={prod?.name || 'Medicine'}
                          type="product"
                          category={prod?.category}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">
                              {prod?.name || stk.product_name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30">
                              {mode === 'bn' ? 'অবিক্রীত ওষুধ' : 'Unsold Stock'}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5">
                            {mode === 'bn' ? 'ব্যাচ:' : 'Batch:'} {stk.batch_no || stk.batch_id} • {mode === 'bn' ? 'দর:' : 'Rate:'} ৳{stk.tp || prod?.trade_price_tp}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-sm sm:text-base font-bold text-emerald-400">
                            {stk.qty} {mode === 'bn' ? 'বক্স' : 'boxes'}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {mode === 'bn' ? 'মূল্য:' : 'Value:'} {formatCurrency(lineTotalValue)}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            href="/dashboard/billing"
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-[#0b0c10] text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                          >
                            <Receipt className="size-3 text-black" />
                            <span>{mode === 'bn' ? 'বিক্রি করুন' : 'Sell Now'}</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setReturnEmpStockItem(stk);
                              setReturnQty(Math.min(1, stk.qty));
                              setShowReturnStockModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#35383d] hover:bg-[#43474d] text-zinc-200 text-xs font-semibold transition-colors flex items-center space-x-1"
                            title={mode === 'bn' ? 'গুদামে ফেরত পাঠান' : 'Return to warehouse'}
                          >
                            <RotateCcw className="size-3 text-amber-400" />
                            <span>{mode === 'bn' ? 'ফেরত' : 'Return'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Today's Invoices */}
        {activeTab === 'today_memos' && (
          <div className="space-y-3">
            {todayInvoices.length === 0 ? (
              <div className="py-10 text-center text-zinc-500 text-xs">
                {mode === 'bn'
                  ? 'আজ এখনও কোনো চালান বা মেমো করা হয়নি।'
                  : 'No bills or invoices logged today.'}
              </div>
            ) : (
              <div className="space-y-2">
                {todayInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl bg-[#1b1c20] border border-[#252628] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{inv.invoice_ref}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          {inv.stock_source === 'Employee_Stock' ? (mode === 'bn' ? 'কর্মীর স্টক থেকে' : 'From Staff Stock') : (mode === 'bn' ? 'গুদাম থেকে' : 'From Godown')}
                        </span>
                      </div>
                      <p className="text-zinc-400 mt-0.5">
                        {mode === 'bn' ? 'ক্রেতা:' : 'Buyer:'} <strong className="text-zinc-200">{inv.customer_name || 'সাধারণ ক্রেতা'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {formatCurrency(inv.net_payable)}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {mode === 'bn' ? 'নগদ জমা: ' : 'Paid: '}
                          <span className="text-emerald-400 font-semibold">{formatCurrency(inv.paid_amount)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => generateInvoicePDF(inv)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center space-x-1"
                      >
                        <FileDown className="size-3 text-white" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal 1: Take Stock from Godown */}
      {showTakeStockModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1c20] border border-[#252628] rounded-xl max-w-sm w-full p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <h3 className="font-bold text-sm sm:text-base">
                {mode === 'bn' ? 'গুদাম থেকে ওষুধ গ্রহণ' : 'Take Stock from Godown'}
              </h3>
              <button onClick={() => setShowTakeStockModal(false)} className="text-zinc-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleTakeStockSubmit} className="py-4 space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'ওষুধ নির্বাচন করুন *' : 'Select Medicine *'}
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const b = batches.find((batch) => batch.product_id === e.target.value && batch.warehouse_qty > 0);
                    if (b) setSelectedBatchId(b.id);
                  }}
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
                >
                  <option value="">{mode === 'bn' ? '-- ওষুধ নির্বাচন করুন --' : '-- Select Medicine --'}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {mode === 'bn'
                        ? `${p.name} (${p.pack_size}) - গুদাম মজুত: ${p.stock} বক্স`
                        : `${p.name} (${p.pack_size}) - Stock: ${p.stock} boxes`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'ব্যাচ নম্বর *' : 'Select Batch *'}
                </label>
                <select
                  required
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
                >
                  <option value="">{mode === 'bn' ? '-- ব্যাচ নির্বাচন করুন --' : '-- Select Batch --'}</option>
                  {batches
                    .filter((b) => b.product_id === selectedProductId && b.warehouse_qty > 0)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {mode === 'bn'
                          ? `${b.batch_no} (মজুত: ${b.warehouse_qty} বক্স, মেয়াদ: ${b.exp_date})`
                          : `${b.batch_no} (Stock: ${b.warehouse_qty} boxes, Exp: ${b.exp_date})`}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'বক্সের সংখ্যা *' : 'Number of Boxes *'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-sm font-bold text-white outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
                >
                  {mode === 'bn' ? 'ওষুধ গ্রহণ নিশ্চিত করুন' : 'Confirm Stock Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Return Unsold Stock Back to Warehouse */}
      {showReturnStockModal && returnEmpStockItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1c20] border border-[#252628] rounded-xl max-w-sm w-full p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <h3 className="font-bold text-sm sm:text-base">
                {mode === 'bn' ? 'অবিক্রীত ওষুধ গুদামে ফেরত' : 'Return Unsold Stock to Storage'}
              </h3>
              <button onClick={() => setShowReturnStockModal(false)} className="text-zinc-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleReturnStockSubmit} className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-[#0b0c10] rounded-xl border border-[#252628]">
                <div className="text-white font-bold">{returnEmpStockItem.product_name}</div>
                <div className="text-zinc-400 mt-0.5">
                  {mode === 'bn' ? 'ব্যাচ:' : 'Batch:'} {returnEmpStockItem.batch_no || returnEmpStockItem.batch_id} •{' '}
                  {mode === 'bn' ? 'হাতে আছে:' : 'In-hand:'} <strong className="text-emerald-400">{returnEmpStockItem.qty}</strong> বক্স
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'কত বক্স গুদামে ফেরত পাঠাবেন? *' : 'How many boxes to return? *'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={returnEmpStockItem.qty}
                  required
                  value={returnQty}
                  onChange={(e) => setReturnQty(parseInt(e.target.value) || 1)}
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-sm font-bold text-white outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
                >
                  {mode === 'bn' ? 'গুদামে ফেরত পাঠান' : 'Confirm Return to Storage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
