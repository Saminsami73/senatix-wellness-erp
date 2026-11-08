'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  CreditCard,
  FileDown,
  DollarSign,
  Plus,
  Calendar,
} from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { useLanguage } from '@/context/LanguageContext';
import { Attendance, EmployeeTarget, Payroll, Employee } from '@/types/erp';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { generatePayslipPDF } from '@/lib/pdfGenerator';
import { exportSingleTableToExcel } from '@/lib/excelExport';

export default function HRPayrollPage() {
  const { mode, formatCurrency } = useLanguage();

  const [activeTab, setActiveTab] = useState<'attendance' | 'targets' | 'payroll'>('attendance');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState('2026-11');

  const [attendance, setAttendance] = useState<Attendance[]>(erpStore.getAttendance(selectedDate));
  const [targets, setTargets] = useState<EmployeeTarget[]>(erpStore.getTargets());
  const [payroll, setPayroll] = useState<Payroll[]>(erpStore.getPayroll());
  const [employees, setEmployees] = useState<Employee[]>(erpStore.getEmployees());

  useEffect(() => {
    const unsub = erpStore.subscribe(() => {
      setAttendance(erpStore.getAttendance(selectedDate));
      setTargets(erpStore.getTargets());
      setPayroll(erpStore.getPayroll());
      setEmployees(erpStore.getEmployees());
    });
    return unsub;
  }, [selectedDate]);

  const handleStatusChange = (empId: string, status: any) => {
    erpStore.markAttendance(empId, status, selectedDate);
    setAttendance(erpStore.getAttendance(selectedDate));
  };

  const handleGeneratePayroll = () => {
    erpStore.generateMonthlyPayroll(selectedMonth);
    alert(
      mode === 'bn'
        ? `${selectedMonth} মাসের বেতন শিট সফলভাবে তৈরি হয়েছে!`
        : `Payroll generated for month ${selectedMonth}!`
    );
  };

  const handlePaySalary = (item: Payroll) => {
    const method = prompt(
      mode === 'bn' ? 'পেমেন্ট মাধ্যম লিখুন (নগদ, ব্যাংক বা বিকাশ):' : 'Enter payment method (Cash, Bank or bKash):',
      mode === 'bn' ? 'ব্যাংক' : 'Bank'
    );
    if (!method) return;
    erpStore.paySalary(item.id, method);
    alert(
      mode === 'bn'
        ? `${item.employee_name} এর বেতন পরিশোধ সম্পন্ন হয়েছে!`
        : `Salary paid for ${item.employee_name}!`
    );
  };

  const handlePrintPayslip = (item: Payroll) => {
    const emp = employees.find((e) => e.emp_id === item.emp_id);
    if (emp) {
      generatePayslipPDF(item, emp);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#252628] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="size-9 rounded-xl bg-purple-500/20 border border-purple-500/30 grid place-items-center text-purple-400">
            <CalendarCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {mode === 'bn' ? 'হাজিরা, টার্গেট ও বেতন ব্যবস্থাপনা' : 'Attendance, Targets and Payroll'}
            </h1>
            <p className="text-xs text-zinc-400">
              {mode === 'bn'
                ? 'দৈনিক হাজিরা, মাঠপর্যায়ের ভাতা, মাসিক বিক্রয় লক্ষ্যমাত্রা ও বেতন শিট'
                : 'Daily attendance, field allowances, monthly targets and automated payslips'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'payroll' && (
            <button
              onClick={handleGeneratePayroll}
              className="px-4 py-2 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="size-4" />
              <span>{mode === 'bn' ? 'বেতন শিট তৈরি করুন' : 'Generate Payroll Sheet'}</span>
            </button>
          )}

          <button
            onClick={() => exportSingleTableToExcel(payroll, `Senatix_Payroll_${selectedMonth}`)}
            className="px-3.5 py-2 bg-[#1b1c20] hover:bg-[#252628] text-zinc-300 rounded-xl text-xs flex items-center space-x-1.5 border border-[#252628] transition-colors"
          >
            <FileDown className="size-4 text-zinc-400" />
            <span>{mode === 'bn' ? 'এক্সেল ডাউনলোড' : 'Export Excel'}</span>
          </button>
        </div>
      </div>

      {/* 3 Tabs */}
      <div className="p-1.5 bg-[#1b1c20] rounded-xl border border-[#252628] flex items-center space-x-1">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 ${
            activeTab === 'attendance'
              ? 'bg-[#35383d] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CalendarCheck className="size-4 text-[#fae0d1]" />
          <span>{mode === 'bn' ? 'দৈনিক হাজিরা ও ভাতা' : 'Daily Attendance'}</span>
        </button>

        <button
          onClick={() => setActiveTab('targets')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 ${
            activeTab === 'targets'
              ? 'bg-[#35383d] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <TrendingUp className="size-4 text-[#de9489]" />
          <span>{mode === 'bn' ? 'মাসিক বিক্রয় ও কালেকশন লক্ষ্য' : 'Sales and Collection Targets'}</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 ${
            activeTab === 'payroll'
              ? 'bg-[#35383d] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CreditCard className="size-4 text-[#86759f]" />
          <span>{mode === 'bn' ? 'মাসিক বেতন ও পে-স্লিপ' : 'Monthly Salary and Payslips'}</span>
        </button>
      </div>

      {/* TAB 1: DAILY ATTENDANCE & TA/DA */}
      {activeTab === 'attendance' && (
        <div className="space-y-3">
          <div className="p-3 bg-[#1b1c20] rounded-xl border border-[#252628] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="size-4 text-zinc-400" />
              <span className="text-xs text-zinc-300 font-medium">
                {mode === 'bn' ? 'হাজিরার তারিখ:' : 'Attendance Date:'}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-8 px-2 bg-[#0b0c10] border border-[#252628] rounded-lg text-xs text-white outline-none focus:border-[#de9489]"
              />
            </div>
            <span className="text-xs text-zinc-300 font-semibold hidden sm:block">
              {mode === 'bn' ? 'ফিল্ড ডিউটি নির্বাচন করলে দৈনিক ভাতা স্বয়ংক্রিয়ভাবে যোগ হবে' : 'Field duty automatically earns daily allowance'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attendance.map((att) => {
              const emp = employees.find((e) => e.emp_id === att.emp_id);
              return (
                <div
                  key={att.emp_id}
                  className="p-3.5 bg-[#1b1c20] hover:bg-[#1f2026] rounded-xl border border-[#252628] flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <SmartAvatar
                      imageUrl={emp?.image_url}
                      name={att.employee_name || 'Staff'}
                      size="md"
                    />
                    <div>
                      <div className="font-semibold text-white text-xs">{att.employee_name}</div>
                      <div className="text-[11px] text-zinc-400">{emp?.designation} • ID: {att.emp_id}</div>
                      <div className="text-[10px] text-zinc-300 font-medium mt-0.5">
                        {mode === 'bn' ? 'অর্জিত ভাতা: ' : 'Daily Allowance: '}
                        <strong className="text-emerald-400">৳{att.ta_da_amount_earned}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleStatusChange(att.emp_id, 'Present_Market_Duty')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        att.status === 'Present_Market_Duty'
                          ? 'bg-[#35383d] text-white shadow-sm'
                          : 'bg-[#0b0c10] text-zinc-400 hover:text-white border border-[#252628]'
                      }`}
                      title={mode === 'bn' ? 'ফিল্ড ডিউটি' : 'Field Duty'}
                    >
                      {mode === 'bn' ? 'ফিল্ড' : 'Field'}
                    </button>

                    <button
                      onClick={() => handleStatusChange(att.emp_id, 'Present_Office')}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                        att.status === 'Present_Office'
                          ? 'bg-blue-500 text-black font-bold'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                      title={mode === 'bn' ? 'অফিস ডিউটি' : 'Office Duty'}
                    >
                      {mode === 'bn' ? 'অফিস' : 'Office'}
                    </button>

                    <button
                      onClick={() => handleStatusChange(att.emp_id, 'Absent')}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                        att.status === 'Absent'
                          ? 'bg-rose-500 text-white font-bold'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                      title={mode === 'bn' ? 'অনুপস্থিত' : 'Absent'}
                    >
                      {mode === 'bn' ? 'অনুপস্থিত' : 'Absent'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY TARGETS */}
      {activeTab === 'targets' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {targets.map((tar) => {
              const salesPct = Math.min(100, Math.round((tar.achieved_sales_amount / (tar.target_sales_amount || 1)) * 100));
              const collPct = Math.min(100, Math.round((tar.achieved_collection_amount / (tar.target_collection_amount || 1)) * 100));

              return (
                <div
                  key={tar.id}
                  className="p-4 bg-[#1b1c20] rounded-xl border border-[#252628] space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#252628]">
                    <div className="font-bold text-white text-sm">{tar.employee_name}</div>
                    <span className="text-[10px] text-zinc-400 font-mono">{tar.month_year}</span>
                  </div>

                  {/* Sales Target */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">
                        {mode === 'bn' ? 'বিক্রয় লক্ষ্যমাত্রা:' : 'Sales Target:'}
                      </span>
                      <span className="font-semibold text-white">
                        ৳{tar.achieved_sales_amount.toLocaleString()} / ৳{tar.target_sales_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                        style={{ width: `${salesPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold mt-0.5 block text-right">
                      {salesPct}% {mode === 'bn' ? 'অর্জিত' : 'achieved'}
                    </span>
                  </div>

                  {/* Collection Target */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">
                        {mode === 'bn' ? 'টাকা আদায় লক্ষ্যমাত্রা:' : 'Collection Target:'}
                      </span>
                      <span className="font-semibold text-white">
                        ৳{tar.achieved_collection_amount.toLocaleString()} / ৳{tar.target_collection_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                        style={{ width: `${collPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold mt-0.5 block text-right">
                      {collPct}% {mode === 'bn' ? 'সংগৃহীত' : 'collected'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PAYROLL & SALARY */}
      {activeTab === 'payroll' && (
        <div className="space-y-3">
          <div className="hidden md:block bg-[#1b1c20] rounded-xl border border-[#252628] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#15161c] text-zinc-400 border-b border-[#252628]">
                <tr>
                  <th className="p-3">{mode === 'bn' ? 'কর্মী ও পদবি' : 'Staff & Role'}</th>
                  <th className="p-3 text-right">{mode === 'bn' ? 'মূল বেতন' : 'Base Salary'}</th>
                  <th className="p-3 text-right">{mode === 'bn' ? 'অর্জিত ভাতা' : 'Allowances'}</th>
                  <th className="p-3 text-right">{mode === 'bn' ? 'কমিশন বোনাস' : 'Commission'}</th>
                  <th className="p-3 text-right">{mode === 'bn' ? 'অগ্রিম কর্তন' : 'Advance Deduct'}</th>
                  <th className="p-3 text-right font-bold text-white">{mode === 'bn' ? 'নিট প্রদেয়' : 'Net Payable'}</th>
                  <th className="p-3 text-center">{mode === 'bn' ? 'অবস্থা' : 'Status'}</th>
                  <th className="p-3 text-right">{mode === 'bn' ? 'কার্যক্রম' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252628]">
                {payroll.map((pay) => (
                  <tr key={pay.id} className="hover:bg-[#1f2026] transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{pay.employee_name}</div>
                      <div className="text-[11px] text-zinc-400">{pay.designation}</div>
                    </td>
                    <td className="p-3 text-right font-medium text-zinc-300">
                      ৳ {pay.base_salary.toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-zinc-100 font-medium">
                      +৳ {pay.total_ta_da_earned.toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-[#86759f] font-medium">
                      +৳ {pay.sales_commission_earned.toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-rose-400">
                      -৳ {pay.advance_salary_deducted.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-bold text-base text-white">
                      ৳ {pay.net_salary_payable.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pay.payment_status === 'Paid'
                            ? 'bg-[#15161c] text-emerald-300 border border-emerald-500/20'
                            : 'bg-[#15161c] text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {pay.payment_status === 'Paid'
                          ? mode === 'bn' ? 'পরিশোধিত' : 'Paid'
                          : mode === 'bn' ? 'বকেয়া' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {pay.payment_status === 'Unpaid' && (
                          <button
                            onClick={() => handlePaySalary(pay)}
                            className="px-3 py-1 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold rounded-xl text-xs transition-all shadow-sm active:scale-[0.99]"
                          >
                            {mode === 'bn' ? 'পরিশোধ' : 'Pay Now'}
                          </button>
                        )}
                        <button
                          onClick={() => handlePrintPayslip(pay)}
                          className="px-2.5 py-1 bg-[#35383d] hover:bg-[#43474d] text-zinc-200 rounded-xl text-xs font-medium"
                          title={mode === 'bn' ? 'পে-স্লিপ প্রিন্ট' : 'Print Payslip'}
                        >
                          {mode === 'bn' ? 'পে-স্লিপ' : 'Payslip'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
