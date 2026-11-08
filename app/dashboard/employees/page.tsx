'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  DollarSign,
  PackagePlus,
  FileSpreadsheet,
  X,
  RotateCcw,
  Boxes,
  CheckCircle,
  Printer,
  ShieldCheck,
  ArrowDownLeft,
} from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { useLanguage } from '@/context/LanguageContext';
import { Employee, Product, ProductBatch, EmpStock } from '@/types/erp';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { PhotoUploader } from '@/components/ui/PhotoUploader';
import { exportSingleTableToExcel } from '@/lib/excelExport';

export default function EmployeesDirectoryPage() {
  const { mode, formatCurrency } = useLanguage();

  const [employees, setEmployees] = useState<Employee[]>(erpStore.getEmployees());
  const [products, setProducts] = useState<Product[]>(erpStore.getProducts());
  const [batches, setBatches] = useState<ProductBatch[]>(erpStore.getProductBatches());
  const [empStocks, setEmpStocks] = useState<EmpStock[]>(erpStore.getEmpStock());

  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Stock Issue Modal State
  const [issueStaff, setIssueStaff] = useState<Employee | null>(null);
  const [issueProductId, setIssueProductId] = useState('');
  const [issueBatchId, setIssueBatchId] = useState('');
  const [issueQty, setIssueQty] = useState(1);

  // Stock Return Modal State
  const [returnStaff, setReturnStaff] = useState<Employee | null>(null);
  const [returnStockItem, setReturnStockItem] = useState<EmpStock | null>(null);
  const [returnQty, setReturnQty] = useState(1);

  // Cash Handover Modal State
  const [handoverStaff, setHandoverStaff] = useState<Employee | null>(null);
  const [handoverAmount, setHandoverAmount] = useState(0);
  const [handoverPaymentMethod, setHandoverPaymentMethod] = useState<'Cash' | 'bKash' | 'Bank'>('Cash');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [voucherData, setVoucherData] = useState<{
    voucherRef: string;
    employeeName: string;
    empId: string;
    phone: string;
    amount: number;
    paymentMethod: string;
    remainingBalance: number;
    notes: string;
    date: string;
  } | null>(null);

  // Add Employee Modal State
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmpId, setNewEmpId] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<any>('sales_rep');
  const [newDesignation, setNewDesignation] = useState('Sales Officer (MPO)');
  const [newBaseSalary, setNewBaseSalary] = useState(25000);
  const [newDailyTaDa, setNewDailyTaDa] = useState(350);
  const [newCommission, setNewCommission] = useState(2.0);
  const [newImage, setNewImage] = useState<string | null>(null);

  const refreshState = () => {
    setEmployees(erpStore.getEmployees());
    setProducts(erpStore.getProducts());
    setBatches(erpStore.getProductBatches());
    setEmpStocks(erpStore.getEmpStock());
  };

  useEffect(() => {
    const unsub = erpStore.subscribe(refreshState);
    return unsub;
  }, []);

  const roles = [
    { key: 'All', label: mode === 'bn' ? 'সকল কর্মী ও অফিসার' : 'All Staff' },
    { key: 'executor', label: mode === 'bn' ? 'ম্যানেজিং ডিরেক্টর' : 'Managing Director' },
    { key: 'super_admin', label: mode === 'bn' ? 'সুপার এডমিন' : 'Super Admin' },
    { key: 'manager', label: mode === 'bn' ? 'ম্যানেজার' : 'Manager' },
    { key: 'sales_rep', label: mode === 'bn' ? 'সেলস অফিসার' : 'Sales Representative' },
    { key: 'store_keeper', label: mode === 'bn' ? 'স্টোর কিপার' : 'Store Keeper' },
    { key: 'accountant', label: mode === 'bn' ? 'অ্যাকাউন্ট্যান্ট' : 'Accountant' },
  ];

  const filteredEmployees = employees.filter((e) => {
    const matchesRole = selectedRole === 'All' || e.role === selectedRole;
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.emp_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.phone.includes(searchQuery);
    return matchesRole && matchesSearch;
  });

  const handleStockIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueStaff || !issueProductId || !issueBatchId || issueQty <= 0) {
      alert(mode === 'bn' ? 'সকল তথ্য সঠিকভাবে পূরণ করুন' : 'Please fill all fields');
      return;
    }

    try {
      erpStore.transferStockToEmployee(issueStaff.emp_id, issueProductId, issueBatchId, issueQty);
      alert(
        mode === 'bn'
          ? `${issueStaff.name} এর কাছে ${issueQty} বক্স ওষুধ সফলভাবে বুঝিয়ে দেওয়া হয়েছে!`
          : `Successfully issued ${issueQty} boxes to ${issueStaff.name}!`
      );
      setIssueStaff(null);
      setIssueQty(1);
      refreshState();
    } catch (err: any) {
      alert(err.message || 'Stock transfer failed');
    }
  };

  const handleStockReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnStaff || !returnStockItem || returnQty <= 0) return;

    try {
      erpStore.transferStockBackToWarehouse(
        returnStaff.emp_id,
        returnStockItem.product_id,
        returnStockItem.batch_id,
        returnQty
      );
      alert(
        mode === 'bn'
          ? `${returnQty} বক্স অবিক্রীত ওষুধ প্রধান গুদামে ফেরত গ্রহণ করা হয়েছে!`
          : `Received ${returnQty} boxes back into warehouse!`
      );
      setReturnStaff(null);
      setReturnStockItem(null);
      setReturnQty(1);
      refreshState();
    } catch (err: any) {
      alert(err.message || 'Return failed');
    }
  };

  const handleCashHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverStaff || handoverAmount <= 0) return;

    try {
      const res = erpStore.collectEmployeeCashDue({
        emp_id: handoverStaff.emp_id,
        amount: handoverAmount,
        payment_method: handoverPaymentMethod,
        notes: handoverNotes,
      });

      setVoucherData({
        voucherRef: res.voucherRef,
        employeeName: handoverStaff.name,
        empId: handoverStaff.emp_id,
        phone: handoverStaff.phone,
        amount: handoverAmount,
        paymentMethod: handoverPaymentMethod,
        remainingBalance: res.balanceRemaining,
        notes: handoverNotes,
        date: new Date().toLocaleString(mode === 'bn' ? 'bn-BD' : 'en-US'),
      });

      setHandoverStaff(null);
      setHandoverAmount(0);
      setHandoverNotes('');
      refreshState();
    } catch (err: any) {
      alert(err.message || 'Cash collection failed');
    }
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpId || !newName || !newPhone) {
      alert(mode === 'bn' ? 'আইডি, নাম ও ফোন নম্বর পূরণ করা আবশ্যক' : 'ID, name and phone are required');
      return;
    }

    erpStore.addEmployee({
      emp_id: newEmpId.toUpperCase(),
      name: newName,
      phone: newPhone,
      role: newRole,
      designation: newDesignation,
      primary_market_id: null,
      base_salary: newBaseSalary,
      daily_ta_da: newDailyTaDa,
      commission_percent: newCommission,
      current_due_balance: 0,
      salary_advance_balance: 0,
      image_url: newImage,
      is_active: true,
    });

    alert(mode === 'bn' ? 'নতুন কর্মী সফলভাবে যুক্ত হয়েছে!' : 'New staff member added successfully!');
    setShowAddEmpModal(false);
    setNewEmpId('');
    setNewName('');
    setNewPhone('');
    setNewImage(null);
    refreshState();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#252628] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="size-9 rounded-xl bg-[#1b1c20] border border-[#252628] grid place-items-center text-[#86759f]">
            <Users className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {mode === 'bn' ? 'কর্মী তালিকা ও অবিক্রীত স্টক' : 'Staff Directory and In-Hand Stock'}
            </h1>
            <p className="text-xs text-zinc-400">
              {mode === 'bn'
                ? 'কর্মীদের ওষুধ বরাদ্দ দিন, অবিক্রীত স্টক ফেরত নিন ও নগদ কালেকশন হিসাব মেলান'
                : 'Issue medicines to staff, take back unsold stock and collect field cash'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportSingleTableToExcel(employees, 'Senatix_Employees_List')}
            className="px-3.5 py-2 bg-[#1b1c20] hover:bg-[#252628] text-zinc-300 rounded-xl text-xs flex items-center space-x-1.5 border border-[#252628] transition-colors"
          >
            <FileSpreadsheet className="size-4 text-zinc-400" />
            <span>{mode === 'bn' ? 'এক্সেল ডাউনলোড' : 'Export Excel'}</span>
          </button>

          <button
            onClick={() => setShowAddEmpModal(true)}
            className="px-4 py-2 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus className="size-4" />
            <span>{mode === 'bn' ? '+ নতুন কর্মী যোগ' : '+ Add Staff'}</span>
          </button>
        </div>
      </div>

      {/* 50+ Non-Tech Helpful Visual Guide Banner */}
      <div className="p-3.5 bg-[#15161c] border border-[#252628] rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 bg-[#0b0c10] border border-[#252628] rounded-xl flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <RotateCcw className="size-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">
              {mode === 'bn' ? '১. অবিক্রীত ওষুধ গুদামে ফেরত নেওয়ার নিয়ম' : '1. Returning Unsold Medicines to Godown'}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
              {mode === 'bn'
                ? 'কর্মী বাইরে থেকে অবিক্রীত ওষুধ নিয়ে এলে তার নামের পাশে "ফেরত নিন" বাটনে চাপুন। ওষুধটি সরাসরি গুদামের মূল মজুতে যুক্ত হবে।'
                : 'When a field rep brings back unsold boxes, click "Return Stock". Items will immediately be returned to warehouse inventory.'}
            </p>
          </div>
        </div>

        <div className="p-3 bg-[#0b0c10] border border-[#252628] rounded-xl flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <ArrowDownLeft className="size-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">
              {mode === 'bn' ? '২. কর্মীর ক্যাশ জমা ও বকেয়া পরিশোধ' : '2. Collecting Cash & Clearing Due Balance'}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
              {mode === 'bn'
                ? 'কর্মী কালেকশন টাকা অফিসে জমা দিলে "ক্যাশ গ্রহণ" বাটনে চাপুন। টাকা জমা হওয়ার সাথে সাথে ক্যাশ লেজারে এন্ট্রি পড়বে এবং মানি রিসিট প্রিন্ট করতে পারবেন।'
                : 'When a rep deposits collected cash, click "Take Cash". His due will decrease instantly, and a printable deposit receipt will be created.'}
            </p>
          </div>
        </div>
      </div>

      {/* Role Filter & Search */}
      <div className="p-3 bg-[#1b1c20] rounded-xl border border-[#252628] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {roles.map((r) => {
            const count = r.key === 'All' ? employees.length : employees.filter((e) => e.role === r.key).length;
            return (
              <button
                key={r.key}
                onClick={() => setSelectedRole(r.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  selectedRole === r.key
                    ? 'bg-[#35383d] text-white shadow-sm'
                    : 'bg-[#15161c] text-zinc-400 hover:text-white border border-[#252628]'
                }`}
              >
                <span>{r.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40">
                  {count}
                </span>
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
            placeholder={mode === 'bn' ? 'নাম বা আইডি দিয়ে খুঁজুন...' : 'Search by name or ID...'}
            className="w-full h-9 pl-9 pr-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredEmployees.map((emp) => {
          const isDirector = emp.role === 'super_admin' || emp.role === 'executor';
          const ring = isDirector ? 'border-amber-400' : 'border-emerald-500';

          const staffStock = empStocks.filter((s) => s.emp_id === emp.emp_id && s.qty > 0);
          const totalHeldBoxes = staffStock.reduce((acc, s) => acc + s.qty, 0);
          const totalHeldValue = staffStock.reduce((acc, s) => acc + s.qty * (s.tp || 0), 0);

          return (
            <div
              key={emp.emp_id}
              className="p-4 bg-[#1b1c20] hover:bg-[#1f2026] rounded-xl border border-[#252628] flex flex-col justify-between transition-colors space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <SmartAvatar
                      imageUrl={emp.image_url}
                      name={emp.name}
                      size="lg"
                      ringColor={ring}
                    />
                    <div>
                      <h3 className="font-bold text-sm text-white line-clamp-1">{emp.name}</h3>
                      <p className="text-xs text-zinc-400 font-medium">{emp.designation}</p>
                      <span className="text-[10px] text-zinc-500 font-mono">ID: {emp.emp_id}</span>
                    </div>
                  </div>

                  <a
                    href={`tel:${emp.phone}`}
                    className="size-9 rounded-full bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] grid place-items-center text-zinc-300 hover:text-white shrink-0 transition-colors"
                    title={mode === 'bn' ? 'কল করুন' : 'Call'}
                  >
                    <Phone className="size-4" />
                  </a>
                </div>

                {/* In-Hand Unsold Stock Highlights */}
                <div className="p-3 bg-[#0b0c10] rounded-xl border border-[#252628] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center space-x-1">
                      <Boxes className="size-3.5 text-emerald-400" />
                      <span>{mode === 'bn' ? 'অবিক্রীত ওষুধ (হাতে মজুত):' : 'Unsold Stock Held:'}</span>
                    </span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {totalHeldBoxes} {mode === 'bn' ? 'বক্স' : 'boxes'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{mode === 'bn' ? 'মজুত ওষুধের মোট মূল্য:' : 'Total Stock Value:'}</span>
                    <span className="text-white font-medium">{formatCurrency(totalHeldValue)}</span>
                  </div>

                  {/* Held items preview */}
                  {staffStock.length > 0 && (
                    <div className="pt-1.5 border-t border-[#1f2026] flex flex-wrap gap-1">
                      {staffStock.slice(0, 3).map((stk) => (
                        <span
                          key={stk.id}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300"
                        >
                          {stk.product_name}: <strong className="text-white">{stk.qty}</strong>
                        </span>
                      ))}
                      {staffStock.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-zinc-500">
                          +{staffStock.length - 3} {mode === 'bn' ? 'অন্যান্য' : 'more'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#0b0c10] border border-[#252628] rounded-xl">
                    <div className="text-[10px] text-zinc-400">{mode === 'bn' ? 'মাসিক বেতন' : 'Salary'}</div>
                    <div className="font-semibold text-white mt-0.5">
                      {formatCurrency(emp.base_salary)}
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#0b0c10] border border-[#252628] rounded-xl">
                    <div className="text-[10px] text-zinc-400">{mode === 'bn' ? 'হাতে থাকা ক্যাশ' : 'Cash in Hand'}</div>
                    <div className="font-bold text-amber-400 mt-0.5">
                      {formatCurrency(emp.current_due_balance)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Operational Action Buttons */}
              <div className="pt-2 border-t border-[#252628] grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setIssueStaff(emp)}
                  className="py-2 bg-[#35383d] hover:bg-[#42464d] text-white rounded-xl text-[11px] font-semibold flex items-center justify-center space-x-1 shadow-sm transition-colors"
                >
                  <PackagePlus className="size-3 text-[#fae0d1]" />
                  <span>{mode === 'bn' ? 'স্টক দিন' : 'Issue Stock'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const held = empStocks.filter((s) => s.emp_id === emp.emp_id && s.qty > 0);
                    if (held.length === 0) {
                      alert(
                        mode === 'bn'
                          ? 'এই কর্মীর কাছে বর্তমানে কোনো অবিক্রীত ওষুধ নেই।'
                          : 'This employee has no unsold stock in hand.'
                      );
                      return;
                    }
                    setReturnStaff(emp);
                    setReturnStockItem(held[0]);
                    setReturnQty(Math.min(1, held[0].qty));
                  }}
                  className="py-2 bg-[#1b1c20] hover:bg-[#252628] border border-[#252628] text-amber-300 rounded-xl text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors"
                >
                  <RotateCcw className="size-3 text-amber-400" />
                  <span>{mode === 'bn' ? 'ফেরত নিন' : 'Return Stock'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHandoverStaff(emp);
                    setHandoverAmount(emp.current_due_balance > 0 ? emp.current_due_balance : 0);
                  }}
                  className="py-2 bg-white hover:bg-zinc-100 text-[#0b0c10] rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 shadow-sm transition-all active:scale-[0.99]"
                >
                  <DollarSign className="size-3 text-[#0b0c10]" />
                  <span>{mode === 'bn' ? 'ক্যাশ গ্রহণ' : 'Take Cash'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Issue Stock from Warehouse to Staff */}
      {issueStaff && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1c20] border border-[#252628] rounded-xl max-w-sm w-full p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <h3 className="font-bold text-base">
                {mode === 'bn' ? 'কর্মীকে ওষুধ হস্তান্তর' : 'Issue Stock to Staff'}
              </h3>
              <button onClick={() => setIssueStaff(null)} className="text-zinc-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleStockIssueSubmit} className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-[#0b0c10] rounded-xl border border-[#252628]">
                <div className="text-white font-bold">{issueStaff.name} ({issueStaff.emp_id})</div>
                <div className="text-zinc-400 mt-0.5">{issueStaff.designation}</div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'ওষুধ নির্বাচন করুন *' : 'Select Medicine *'}
                </label>
                <select
                  required
                  value={issueProductId}
                  onChange={(e) => {
                    setIssueProductId(e.target.value);
                    const b = batches.find((batch) => batch.product_id === e.target.value && batch.warehouse_qty > 0);
                    if (b) setIssueBatchId(b.id);
                  }}
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
                >
                  <option value="">{mode === 'bn' ? '-- ওষুধ নির্বাচন করুন --' : '-- Select Medicine --'}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.pack_size}) - গুদাম মজুত: {p.stock} বক্স
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'ব্যাচ নম্বর *' : 'Batch Number *'}
                </label>
                <select
                  required
                  value={issueBatchId}
                  onChange={(e) => setIssueBatchId(e.target.value)}
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
                >
                  <option value="">{mode === 'bn' ? '-- ব্যাচ নির্বাচন করুন --' : '-- Select Batch --'}</option>
                  {batches
                    .filter((b) => b.product_id === issueProductId && b.warehouse_qty > 0)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batch_no} (মজুত: {b.warehouse_qty} বক্স, মেয়াদ: {b.exp_date})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'হস্তান্তর বক্স সংখ্যা *' : 'Number of Boxes to Issue *'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={issueQty}
                  onChange={(e) => setIssueQty(parseInt(e.target.value) || 1)}
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-sm font-bold text-white outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
                >
                  {mode === 'bn' ? 'ওষুধ হস্তান্তর নিশ্চিত করুন' : 'Confirm Issue to Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Return Unsold Stock Back to Warehouse */}
      {returnStaff && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1c20] border border-[#252628] rounded-xl max-w-sm w-full p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <h3 className="font-bold text-base">
                {mode === 'bn' ? 'অবিক্রীত ওষুধ গুদামে ফেরত গ্রহণ' : 'Return Unsold Stock to Warehouse'}
              </h3>
              <button onClick={() => setReturnStaff(null)} className="text-zinc-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleStockReturnSubmit} className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-[#0b0c10] rounded-xl border border-[#252628]">
                <div className="text-white font-bold">{returnStaff.name} ({returnStaff.emp_id})</div>
                <div className="text-zinc-400 mt-0.5">{mode === 'bn' ? 'কর্মীর কাছে থাকা অবিক্রীত ওষুধ তালিকা' : 'In-hand unsold items'}</div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'কোন ওষুধটি ফেরত নেবেন? *' : 'Select Item to Return *'}
                </label>
                <select
                  required
                  value={returnStockItem?.id || ''}
                  onChange={(e) => {
                    const found = empStocks.find((s) => s.id === e.target.value);
                    if (found) {
                      setReturnStockItem(found);
                      setReturnQty(Math.min(1, found.qty));
                    }
                  }}
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
                >
                  {empStocks
                    .filter((s) => s.emp_id === returnStaff.emp_id && s.qty > 0)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.product_name} (ব্যাচ: {s.batch_no || s.batch_id}) - হাতে আছে: {s.qty} বক্স
                      </option>
                    ))}
                </select>
              </div>

              {returnStockItem && (
                <div>
                  <label className="text-zinc-400 font-medium block mb-1">
                    {mode === 'bn' ? 'কত বক্স গুদামে ফেরত নেবেন? *' : 'Quantity to Return *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={returnStockItem.qty}
                    required
                    value={returnQty}
                    onChange={(e) => setReturnQty(parseInt(e.target.value) || 1)}
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-sm font-bold text-white outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    {mode === 'bn' ? `সর্বোচ্চ ফেরতযোগ্য: ${returnStockItem.qty} বক্স` : `Max returnable: ${returnStockItem.qty} boxes`}
                  </span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
                >
                  {mode === 'bn' ? 'গুদামে ফেরত গ্রহণ নিশ্চিত করুন' : 'Confirm Return to Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Cash Handover Modal */}
      {handoverStaff && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1c20] border border-[#252628] rounded-xl max-w-sm w-full p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <h3 className="font-bold text-base">
                {mode === 'bn' ? 'ক্যাশ জমা গ্রহণ' : 'Collect Cash from Staff'}
              </h3>
              <button onClick={() => setHandoverStaff(null)} className="text-zinc-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCashHandoverSubmit} className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-[#0b0c10] rounded-xl border border-[#252628]">
                <div className="text-white font-bold">{handoverStaff.name}</div>
                <div className="text-zinc-400 mt-0.5">
                  {mode === 'bn' ? 'বর্তমান ফিল্ড ক্যাশ:' : 'Cash in Hand:'}{' '}
                  <strong className="text-amber-400">{formatCurrency(handoverStaff.current_due_balance)}</strong>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'অফিসে জমা টাকার পরিমাণ (টাকা) *' : 'Amount Received (Tk) *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={handoverAmount}
                    onChange={(e) => setHandoverAmount(parseFloat(e.target.value) || 0)}
                    className="w-full h-11 pl-8 pr-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-base font-bold text-white outline-none"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">৳</span>
                </div>
                {handoverStaff.current_due_balance > 0 && (
                  <button
                    type="button"
                    onClick={() => setHandoverAmount(handoverStaff.current_due_balance)}
                    className="mt-1 text-[11px] text-[#fae0d1] hover:underline"
                  >
                    {mode === 'bn' ? `সম্পূর্ণ বকেয়া (${formatCurrency(handoverStaff.current_due_balance)}) সিলেক্ট করুন` : `Select full balance (${formatCurrency(handoverStaff.current_due_balance)})`}
                  </button>
                )}
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'টাকা প্রদানের মাধ্যম *' : 'Payment Method *'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Cash', 'bKash', 'Bank'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setHandoverPaymentMethod(method)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        handoverPaymentMethod === method
                          ? 'bg-white text-black border-white shadow-sm'
                          : 'bg-[#0b0c10] text-zinc-400 border-[#252628] hover:text-white'
                      }`}
                    >
                      {method === 'Cash' ? (mode === 'bn' ? 'নগদ ক্যাশ' : 'Cash') : method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  {mode === 'bn' ? 'সংক্ষিপ্ত বিবরণ বা নোট (ঐচ্ছিক)' : 'Notes / Remarks (Optional)'}
                </label>
                <input
                  type="text"
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder={mode === 'bn' ? 'যেমন: ধানমন্ডি রুটের কালেকশন' : 'e.g. Field sales collection'}
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-[#0b0c10] font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {mode === 'bn' ? 'ক্যাশ জমা নিশ্চিত করুন ও রিসিট নিন' : 'Confirm Deposit & Issue Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3.5: Printable Cash Deposit Voucher / Money Receipt */}
      {voucherData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-3xl max-w-md w-full p-6 shadow-2xl relative font-sans">
            {/* Header / Brand */}
            <div className="text-center pb-4 border-b-2 border-dashed border-zinc-300">
              <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase">
                {mode === 'bn' ? 'সেনাটিক্স ওয়েলনেস ডিস্ট্রিবিউশন' : 'SENATIX WELLNESS DISTRIBUTION'}
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                হাউজ #১২, রোড #০৪, ধানমন্ডি, ঢাকা • ফোন: +880 1770-578142
              </p>
              <div className="inline-block px-3 py-1 bg-zinc-900 text-white rounded-full text-xs font-bold tracking-wider uppercase mt-2">
                {mode === 'bn' ? 'অফিসিয়াল ক্যাশ জমা মানি রিসিট' : 'OFFICIAL MONEY RECEIPT VOUCHER'}
              </div>
            </div>

            {/* Voucher Details Table */}
            <div className="py-4 space-y-2.5 text-xs text-zinc-800">
              <div className="flex justify-between items-center py-1 border-b border-zinc-200">
                <span className="text-zinc-500 font-medium">{mode === 'bn' ? 'ভাউচার নম্বর:' : 'Voucher Ref:'}</span>
                <span className="font-mono font-bold text-zinc-900">{voucherData.voucherRef}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-200">
                <span className="text-zinc-500 font-medium">{mode === 'bn' ? 'তারিখ ও সময়:' : 'Date & Time:'}</span>
                <span className="font-semibold text-zinc-900">{voucherData.date}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-200">
                <span className="text-zinc-500 font-medium">{mode === 'bn' ? 'কর্মীর নাম ও আইডি:' : 'Employee Name & ID:'}</span>
                <span className="font-bold text-zinc-900">{voucherData.employeeName} ({voucherData.empId})</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-200">
                <span className="text-zinc-500 font-medium">{mode === 'bn' ? 'পেমেন্ট মাধ্যম:' : 'Payment Method:'}</span>
                <span className="font-bold text-zinc-900">
                  {voucherData.paymentMethod === 'Cash' ? (mode === 'bn' ? 'নগদ ক্যাশ' : 'Cash') : voucherData.paymentMethod}
                </span>
              </div>

              {voucherData.notes && (
                <div className="flex justify-between items-center py-1 border-b border-zinc-200">
                  <span className="text-zinc-500 font-medium">{mode === 'bn' ? 'মন্তব্য:' : 'Remarks:'}</span>
                  <span className="text-zinc-800">{voucherData.notes}</span>
                </div>
              )}

              {/* Big Amount Card */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center my-3">
                <div className="text-xs text-emerald-800 font-semibold uppercase">
                  {mode === 'bn' ? 'জমা গৃহীত টাকার পরিমাণ' : 'Total Amount Received'}
                </div>
                <div className="text-2xl font-black text-emerald-900 mt-0.5">
                  ৳ {voucherData.amount.toLocaleString()}
                </div>
              </div>

              <div className="flex justify-between items-center py-1 text-xs">
                <span className="text-zinc-600 font-medium">{mode === 'bn' ? 'কর্মীর অবশিষ্ট বকেয়া ব্যালেন্স:' : 'Remaining Due Balance:'}</span>
                <span className="font-bold text-zinc-900">৳ {voucherData.remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="pt-8 pb-3 grid grid-cols-2 gap-4 text-center text-[11px] text-zinc-700">
              <div>
                <div className="border-t border-zinc-400 pt-1 font-semibold">
                  {mode === 'bn' ? 'টাকা প্রদানকারীর স্বাক্ষর' : 'Staff / Depositor Signature'}
                </div>
              </div>
              <div>
                <div className="border-t border-zinc-400 pt-1 font-semibold">
                  {mode === 'bn' ? 'গ্রহণকারী ম্যানেজমেন্ট স্বাক্ষর' : 'Authorized Receiver Signature'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-200 flex space-x-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition-colors"
              >
                <Printer className="size-4" />
                <span>{mode === 'bn' ? 'রিসিট প্রিন্ট করুন' : 'Print Voucher'}</span>
              </button>

              <button
                type="button"
                onClick={() => setVoucherData(null)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-xl text-xs transition-colors"
              >
                {mode === 'bn' ? 'সম্পন্ন (বন্ধ করুন)' : 'Done (Close)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Add Employee Modal */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1c20] border border-[#252628] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <h3 className="font-bold text-base">
                {mode === 'bn' ? 'নতুন কর্মী যুক্ত করুন' : 'Add New Staff Member'}
              </h3>
              <button onClick={() => setShowAddEmpModal(false)} className="text-zinc-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="py-4 space-y-4 text-xs">
              {/* Photo Upload */}
              <div className="flex justify-center">
                <PhotoUploader
                  currentImageUrl={newImage}
                  onImageSelected={(b64) => setNewImage(b64)}
                  label={mode === 'bn' ? 'কর্মীর ছবি যোগ করুন' : 'Upload Staff Photo'}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-medium block mb-1">
                    {mode === 'bn' ? 'কর্মীর আইডি *' : 'Employee ID *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpId}
                    onChange={(e) => setNewEmpId(e.target.value)}
                    placeholder="EMP-006"
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1">
                    {mode === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={mode === 'bn' ? 'কর্মীর নাম' : 'Staff Name'}
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-medium block mb-1">
                    {mode === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Phone *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1">
                    {mode === 'bn' ? 'পদবি ও পদমর্যাদা' : 'Designation'}
                  </label>
                  <input
                    type="text"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    placeholder={mode === 'bn' ? 'মেডিকেল প্রমোশন অফিসার' : 'Medical Promotion Officer'}
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-medium block mb-1">
                    {mode === 'bn' ? 'সিস্টেম দায়িত্ব' : 'Role in System'}
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
                  >
                    <option value="sales_rep">{mode === 'bn' ? 'সেলস অফিসার' : 'Sales Officer'}</option>
                    <option value="manager">{mode === 'bn' ? 'ম্যানেজার' : 'Manager'}</option>
                    <option value="store_keeper">{mode === 'bn' ? 'স্টোর কিপার' : 'Store Keeper'}</option>
                    <option value="accountant">{mode === 'bn' ? 'অ্যাকাউন্ট্যান্ট' : 'Accountant'}</option>
                    <option value="executor">{mode === 'bn' ? 'ম্যানেজিং ডিরেক্টর' : 'Managing Director'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1">
                    {mode === 'bn' ? 'মূল মাসিক বেতন (টাকা)' : 'Monthly Base Salary (Tk)'}
                  </label>
                  <input
                    type="number"
                    value={newBaseSalary}
                    onChange={(e) => setNewBaseSalary(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
                >
                  {mode === 'bn' ? 'কর্মী সংরক্ষণ করুন' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
