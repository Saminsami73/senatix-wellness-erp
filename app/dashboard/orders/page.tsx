'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  CheckCircle,
  Clock,
  Package,
  FileDown,
  Printer,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { useLanguage } from '@/context/LanguageContext';
import { Invoice } from '@/types/erp';
import { generateDeliveryChallanPDF, generateInvoicePDF } from '@/lib/pdfGenerator';

export default function FieldOrdersPage() {
  const { mode, formatCurrency } = useLanguage();

  const [invoices, setInvoices] = useState<Invoice[]>(erpStore.getInvoices());
  const [statusFilter, setStatusFilter] = useState<'All' | 'Order_Booked' | 'Packed_Ready' | 'Delivered_Final'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = erpStore.subscribe(() => {
      setInvoices(erpStore.getInvoices());
    });
    return unsub;
  }, []);

  const handleUpdateStatus = (inv: Invoice, nextStatus: 'Packed_Ready' | 'Delivered_Final') => {
    erpStore.updateOrderStatus(inv.id, nextStatus);
    if (nextStatus === 'Packed_Ready') {
      generateDeliveryChallanPDF(inv);
    }
  };

  const filteredOrders = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'All' || inv.order_status === statusFilter;
    const matchesSearch =
      inv.invoice_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customer_name && inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inv.employee_name && inv.employee_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#252628] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="size-9 rounded-xl bg-amber-500/20 border border-amber-500/30 grid place-items-center text-amber-400">
            <Truck className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {mode === 'bn' ? 'অর্ডার ও ডেলিভারি ব্যবস্থাপনা' : 'Field Orders and Dispatch'}
            </h1>
            <p className="text-xs text-zinc-400">
              {mode === 'bn'
                ? 'প্রি-অর্ডার প্যাকিং, ডেলিভারি চালান প্রিন্ট ও সরবরাহ ট্র্যাকিং'
                : 'Order packing, delivery challan printing and fulfillment tracking'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-4 bg-[#1b1c20] rounded-xl border border-[#252628] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {(['All', 'Order_Booked', 'Packed_Ready', 'Delivered_Final'] as const).map((st) => {
            const count = st === 'All' ? invoices.length : invoices.filter((i) => i.order_status === st).length;
            const label =
              st === 'All'
                ? mode === 'bn' ? 'সব অর্ডার' : 'All Orders'
                : st === 'Order_Booked'
                ? mode === 'bn' ? 'পেন্ডিং বুকিং' : 'Pending Booked'
                : st === 'Packed_Ready'
                ? mode === 'bn' ? 'প্যাকড রেডি' : 'Packed Ready'
                : mode === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered';

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  statusFilter === st
                    ? 'bg-[#35383d] text-white shadow-sm'
                    : 'bg-[#15161c] text-zinc-400 hover:text-white border border-[#252628]'
                }`}
              >
                <span>{label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="size-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={mode === 'bn' ? 'চালান বা দোকানের নাম...' : 'Search invoice or customer...'}
            className="w-full h-9 pl-9 pr-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs bg-[#1b1c20] rounded-2xl border border-dashed border-[#252628]">
            {mode === 'bn' ? 'এই ফিল্টারে কোনো অর্ডার পাওয়া যায়নি।' : 'No orders found in this filter.'}
          </div>
        ) : (
          filteredOrders.map((inv) => (
            <div
              key={inv.id}
              className="p-4 bg-[#1b1c20] hover:bg-[#1f2026] rounded-2xl border border-[#252628] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
            >
              {/* Order Info */}
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white tracking-wide">
                    {inv.invoice_ref}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      inv.order_status === 'Delivered_Final'
                        ? 'bg-[#15161c] text-emerald-300 border border-emerald-500/20'
                        : inv.order_status === 'Packed_Ready'
                        ? 'bg-[#15161c] text-blue-300 border border-blue-500/20'
                        : 'bg-[#15161c] text-amber-300 border border-amber-500/20 animate-pulse'
                    }`}
                  >
                    {inv.order_status === 'Delivered_Final'
                      ? mode === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered'
                      : inv.order_status === 'Packed_Ready'
                      ? mode === 'bn' ? 'প্যাকড রেডি' : 'Packed Ready'
                      : mode === 'bn' ? 'পেন্ডিং অর্ডার বুকড' : 'Order Booked'}
                  </span>
                  <span className="text-xs text-zinc-500">• {inv.date_only}</span>
                </div>

                <div className="text-xs text-zinc-300">
                  {mode === 'bn' ? 'ক্রেতা বা দোকান:' : 'Customer:'} <strong className="text-white">{inv.customer_name}</strong>
                  {inv.customer_phone && <span> • 📞 {inv.customer_phone}</span>}
                </div>

                <div className="text-[11px] text-zinc-400">
                  {mode === 'bn' ? 'বিক্রেতা কর্মী:' : 'Staff:'} {inv.employee_name} ({inv.emp_id}) •{' '}
                  {mode === 'bn' ? 'উৎস: ' : 'Source: '}
                  {inv.stock_source === 'Employee_Stock'
                    ? mode === 'bn' ? 'কর্মীর হাতের স্টক' : 'Staff In-Hand'
                    : mode === 'bn' ? 'প্রধান গুদাম' : 'Godown Storage'}
                </div>

                {/* Items Preview */}
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {mode === 'bn' ? 'আইটেমসমূহ:' : 'Items:'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(inv.items || []).map((it, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#0b0c10] border border-[#252628] rounded-md text-[10px] text-zinc-300"
                      >
                        {it.product_name} ({it.qty} {it.bonus_qty > 0 ? `+${it.bonus_qty}` : ''})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Financials & Action Buttons */}
              <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-[#252628] shrink-0 gap-2">
                <div className="text-right">
                  <div className="text-base font-bold text-white">
                    {formatCurrency(inv.net_payable)}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {mode === 'bn' ? 'পরিশোধ: ' : 'Paid: '}
                    <span className="text-zinc-200 font-semibold">{formatCurrency(inv.paid_amount)}</span> •{' '}
                    {mode === 'bn' ? 'বাকি: ' : 'Due: '}
                    <span className="text-rose-400 font-semibold">{formatCurrency(inv.due_amount)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status Progression Workflow */}
                  {inv.order_status === 'Order_Booked' && (
                    <button
                      onClick={() => handleUpdateStatus(inv, 'Packed_Ready')}
                      className="px-3.5 py-1.5 bg-[#35383d] hover:bg-[#42464d] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                    >
                      <Package className="size-3.5 text-[#fae0d1]" />
                      <span>{mode === 'bn' ? 'প্যাক করুন ও চালান প্রিন্ট' : 'Pack & Print'}</span>
                    </button>
                  )}

                  {inv.order_status === 'Packed_Ready' && (
                    <button
                      onClick={() => handleUpdateStatus(inv, 'Delivered_Final')}
                      className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 text-[#0b0c10] rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <CheckCircle className="size-3.5 text-black" />
                      <span>{mode === 'bn' ? 'ডেলিভারি সম্পন্ন করুন' : 'Confirm Delivery'}</span>
                    </button>
                  )}

                  {/* Print Delivery Challan */}
                  <button
                    onClick={() => generateDeliveryChallanPDF(inv)}
                    className="p-2 bg-[#1b1c20] hover:bg-[#252628] text-zinc-300 rounded-xl text-xs border border-[#252628] transition-colors"
                    title={mode === 'bn' ? 'ডেলিভারি চালান প্রিন্ট' : 'Print Delivery Challan'}
                  >
                    <Printer className="size-4" />
                  </button>

                  {/* Print Regular Invoice */}
                  <button
                    onClick={() => generateInvoicePDF(inv)}
                    className="p-2 bg-[#1b1c20] hover:bg-[#252628] text-zinc-300 rounded-xl text-xs border border-[#252628] transition-colors"
                    title={mode === 'bn' ? 'বিক্রয় চালান প্রিন্ট' : 'Print Invoice'}
                  >
                    <FileDown className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
