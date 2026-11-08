'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  FileSpreadsheet,
} from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { useLanguage } from '@/context/LanguageContext';
import { LedgerEntry } from '@/types/erp';
import { exportSingleTableToExcel } from '@/lib/excelExport';

export default function MoneyBookLedgerPage() {
  const { mode } = useLanguage();

  const [ledger, setLedger] = useState<LedgerEntry[]>(erpStore.getLedger());
  const [accountFilter, setAccountFilter] = useState<'All' | 'Customer' | 'Employee' | 'Supplier'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = erpStore.subscribe(() => {
      setLedger(erpStore.getLedger());
    });
    return unsub;
  }, []);

  const filteredLedger = ledger.filter((item) => {
    const matchesAccount = accountFilter === 'All' || item.account_type === accountFilter;
    const matchesSearch =
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.party_name && item.party_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.invoice_ref && item.invoice_ref.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAccount && matchesSearch;
  });

  const totalDebit = filteredLedger.reduce((acc, l) => acc + Number(l.debit || 0), 0);
  const totalCredit = filteredLedger.reduce((acc, l) => acc + Number(l.credit || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#252628] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="size-9 rounded-xl bg-[#1b1c20] border border-[#252628] grid place-items-center text-[#fae0d1]">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {mode === 'bn' ? 'বাকি ও জমা খাতা' : 'Unified Ledger Book'}
            </h1>
            <p className="text-xs text-zinc-400">
              {mode === 'bn'
                ? 'ক্রেতা, কর্মী ও সরবরাহকারীদের যাবতীয় দেনা-পাওনা ও জমা হিসাব'
                : 'Customer balances, employee cash collections and supplier payables'}
            </p>
          </div>
        </div>

        <button
          onClick={() => exportSingleTableToExcel(filteredLedger, 'Senatix_Ledger_Book')}
          className="px-3.5 py-2 bg-[#1b1c20] hover:bg-[#252628] text-zinc-300 rounded-xl text-xs flex items-center space-x-1.5 border border-[#252628] self-start sm:self-auto transition-colors"
        >
          <FileSpreadsheet className="size-4 text-zinc-400" />
          <span>{mode === 'bn' ? 'এক্সেল ডাউনলোড' : 'Export Excel'}</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-[#1b1c20] rounded-xl border border-[#252628]">
          <span className="text-xs text-zinc-400">
            {mode === 'bn' ? 'মোট নতুন বিল ও বাকি' : 'Total Debit Added'}
          </span>
          <div className="text-lg font-bold text-white mt-1">
            ৳ {totalDebit.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 bg-[#1b1c20] rounded-xl border border-[#252628]">
          <span className="text-xs text-zinc-400">
            {mode === 'bn' ? 'মোট টাকা জমা আদায়' : 'Total Payment Received'}
          </span>
          <div className="text-lg font-bold text-zinc-100 mt-1">
            ৳ {totalCredit.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 bg-[#1b1c20] rounded-xl border border-[#252628]">
          <span className="text-xs text-zinc-400">
            {mode === 'bn' ? 'অবশিষ্ট মোট বকেয়া' : 'Total Outstanding Balance'}
          </span>
          <div className="text-lg font-bold text-rose-400 mt-1">
            ৳ {Math.max(0, totalDebit - totalCredit).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-3 bg-[#1b1c20] rounded-xl border border-[#252628] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {(['All', 'Customer', 'Employee', 'Supplier'] as const).map((acc) => {
            const label =
              acc === 'All'
                ? mode === 'bn' ? 'সব হিসাব' : 'All Accounts'
                : acc === 'Customer'
                ? mode === 'bn' ? 'ক্রেতা হিসাব' : 'Customers'
                : acc === 'Employee'
                ? mode === 'bn' ? 'কর্মী কালেকশন' : 'Staff Collections'
                : mode === 'bn' ? 'কারখানা বিল' : 'Suppliers';

            return (
              <button
                key={acc}
                onClick={() => setAccountFilter(acc)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  accountFilter === acc
                    ? 'bg-[#35383d] text-white shadow-sm'
                    : 'bg-[#15161c] text-zinc-400 hover:text-white border border-[#252628]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="size-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={mode === 'bn' ? 'বিবরণ বা পার্টির নাম...' : 'Search description or party...'}
            className="w-full h-9 pl-9 pr-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#1b1c20] rounded-xl border border-[#252628] overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#15161c] text-zinc-400 border-b border-[#252628]">
              <tr>
                <th className="p-3">{mode === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="p-3">{mode === 'bn' ? 'পার্টি ও হিসাব' : 'Account'}</th>
                <th className="p-3">{mode === 'bn' ? 'বিবরণ' : 'Description'}</th>
                <th className="p-3">{mode === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Method'}</th>
                <th className="p-3 text-right">{mode === 'bn' ? 'নতুন বিল' : 'Debit'}</th>
                <th className="p-3 text-right">{mode === 'bn' ? 'টাকা জমা' : 'Credit'}</th>
                <th className="p-3 text-right">{mode === 'bn' ? 'ব্যালেন্স' : 'Balance'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252628]">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    {mode === 'bn' ? 'কোনো লেজার এন্ট্রি পাওয়া যায়নি।' : 'No ledger records found.'}
                  </td>
                </tr>
              ) : (
                filteredLedger.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1f2026] transition-colors">
                    <td className="p-3 text-zinc-400 font-mono text-[11px]">
                      {item.date_only}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{item.party_name || 'N/A'}</div>
                      <span className="text-[10px] text-zinc-500 uppercase">{item.account_type}</span>
                    </td>
                    <td className="p-3 text-zinc-300 max-w-xs truncate">
                      {item.description}
                      {item.invoice_ref && (
                        <span className="block text-[10px] text-zinc-500">{item.invoice_ref}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300">
                        {item.payment_method}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium text-white">
                      {item.debit > 0 ? (
                        <span className="text-white">৳ {item.debit.toLocaleString()}</span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      {item.credit > 0 ? (
                        <span>+৳ {item.credit.toLocaleString()}</span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-semibold text-zinc-300">
                      ৳ {item.balance.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
