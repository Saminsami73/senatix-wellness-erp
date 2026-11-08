'use client';

import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Search,
  Plus,
  Gift,
  FileText,
  DollarSign,
  Phone,
  MapPin,
  UserCheck,
  Building2,
  Calendar,
  X,
  Check,
  ChevronDown,
  Pill,
  Award,
} from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { useLanguage } from '@/context/LanguageContext';
import { Doctor, DoctorExpense, Market, Employee, Product } from '@/types/erp';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { PhotoUploader } from '@/components/ui/PhotoUploader';

export default function DoctorsPage() {
  const { mode, t, formatCurrency } = useLanguage();

  const [doctors, setDoctors] = useState<Doctor[]>(erpStore.getDoctors());
  const [expenses, setExpenses] = useState<DoctorExpense[]>(erpStore.getDoctorExpenses());
  const [markets, setMarkets] = useState<Market[]>(erpStore.getMarkets());
  const [employees, setEmployees] = useState<Employee[]>(erpStore.getEmployees());
  const [products, setProducts] = useState<Product[]>(erpStore.getProducts());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarketId, setSelectedMarketId] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [activeTab, setActiveTab] = useState<'directory' | 'expenses'>('directory');

  // Modals
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [targetDoctorForExpense, setTargetDoctorForExpense] = useState<Doctor | null>(null);

  // Form states - Doctor
  const [docName, setDocName] = useState('');
  const [docDegrees, setDocDegrees] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docChamber, setDocChamber] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docMarketId, setDocMarketId] = useState('mkt-1');
  const [docAssignedEmpId, setDocAssignedEmpId] = useState('EMP-001');
  const [docPhoto, setDocPhoto] = useState<string | null>(null);
  const [docPrescribedProducts, setDocPrescribedProducts] = useState<string[]>([]);

  // Form states - Expense
  const [expDoctorId, setExpDoctorId] = useState('');
  const [expEmpId, setExpEmpId] = useState('EMP-001');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expType, setExpType] = useState<'Gift_Item' | 'Sample_Medicine' | 'Cash_Honorarium' | 'Dinner_Conference'>('Gift_Item');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expRxCount, setExpRxCount] = useState<number>(0);
  const [expNotes, setExpNotes] = useState('');

  useEffect(() => {
    const unsub = erpStore.subscribe(() => {
      setDoctors(erpStore.getDoctors());
      setExpenses(erpStore.getDoctorExpenses());
      setMarkets(erpStore.getMarkets());
      setEmployees(erpStore.getEmployees());
      setProducts(erpStore.getProducts());
    });
    return unsub;
  }, []);

  // Filtered Doctors
  const filteredDoctors = doctors.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(q) ||
      doc.doctor_code.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.hospital_chamber.toLowerCase().includes(q) ||
      doc.phone.includes(q);

    const matchesMarket = selectedMarketId === 'all' || doc.market_id === selectedMarketId;
    const matchesSpecialty = selectedSpecialty === 'all' || doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());

    return matchesSearch && matchesMarket && matchesSpecialty;
  });

  // Aggregates
  const totalDoctorsCount = doctors.length;
  const totalPrescriptionsMonthly = doctors.reduce((acc, d) => acc + (d.prescriptions_written_monthly || 0), 0);
  const totalPromotionalExpense = doctors.reduce((acc, d) => acc + (d.total_promotional_expense || 0), 0);
  const totalGiftEvents = expenses.length;

  const handleOpenAddDoctor = (doc?: Doctor) => {
    if (doc) {
      setEditingDoctor(doc);
      setDocName(doc.name);
      setDocDegrees(doc.degrees);
      setDocSpecialty(doc.specialty);
      setDocChamber(doc.hospital_chamber);
      setDocPhone(doc.phone);
      setDocMarketId(doc.market_id);
      setDocAssignedEmpId(doc.assigned_emp_id || 'EMP-001');
      setDocPhoto(doc.image_url || null);
      setDocPrescribedProducts(doc.prescribed_products || []);
    } else {
      setEditingDoctor(null);
      setDocName('');
      setDocDegrees('MBBS, FCPS');
      setDocSpecialty('General Medicine');
      setDocChamber('');
      setDocPhone('');
      setDocMarketId(markets[0]?.id || 'mkt-1');
      setDocAssignedEmpId(employees[0]?.emp_id || 'EMP-001');
      setDocPhoto(null);
      setDocPrescribedProducts([]);
    }
    setShowAddDoctorModal(true);
  };

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    if (editingDoctor) {
      erpStore.updateDoctor(editingDoctor.id, {
        name: docName.trim(),
        degrees: docDegrees.trim(),
        specialty: docSpecialty.trim(),
        hospital_chamber: docChamber.trim(),
        phone: docPhone.trim(),
        market_id: docMarketId,
        assigned_emp_id: docAssignedEmpId,
        image_url: docPhoto,
        prescribed_products: docPrescribedProducts,
      });
    } else {
      erpStore.addDoctor({
        doctor_code: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        name: docName.trim(),
        degrees: docDegrees.trim(),
        specialty: docSpecialty.trim(),
        hospital_chamber: docChamber.trim(),
        phone: docPhone.trim(),
        market_id: docMarketId,
        assigned_emp_id: docAssignedEmpId,
        prescriptions_written_monthly: 0,
        total_promotional_expense: 0,
        prescribed_products: docPrescribedProducts,
        image_url: docPhoto,
        is_active: true,
      });
    }

    setShowAddDoctorModal(false);
  };

  const handleOpenAddExpense = (doc?: Doctor) => {
    if (doc) {
      setTargetDoctorForExpense(doc);
      setExpDoctorId(doc.id);
      setExpEmpId(doc.assigned_emp_id || 'EMP-001');
    } else {
      setTargetDoctorForExpense(null);
      setExpDoctorId(doctors[0]?.id || '');
      setExpEmpId('EMP-001');
    }
    setExpDate(new Date().toISOString().split('T')[0]);
    setExpType('Gift_Item');
    setExpTitle('');
    setExpAmount(0);
    setExpRxCount(0);
    setExpNotes('');
    setShowExpenseModal(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDoctorId || !expTitle.trim()) return;

    erpStore.addDoctorExpense({
      doctor_id: expDoctorId,
      emp_id: expEmpId,
      expense_date: expDate,
      expense_type: expType,
      title: expTitle.trim(),
      amount: Number(expAmount) || 0,
      prescriptions_written_count: Number(expRxCount) || 0,
      notes: expNotes.trim() || undefined,
    });

    setShowExpenseModal(false);
  };

  const togglePrescribedProduct = (prodName: string) => {
    if (docPrescribedProducts.includes(prodName)) {
      setDocPrescribedProducts(docPrescribedProducts.filter((p) => p !== prodName));
    } else {
      setDocPrescribedProducts([...docPrescribedProducts, prodName]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            <span>Senatix ERP</span>
            <span>/</span>
            <span className="text-[#fae0d1] font-medium">{t('nav_doctors')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {mode === 'bn' ? 'ডাক্তার ও প্রেসক্রিপশন ব্যবস্থাপনা' : 'Doctors & Prescribers Directory'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {mode === 'bn'
              ? 'ডাক্তারদের প্রোফাইল, প্রেসক্রিপশন সংখ্যা, নমুনা ঔষধ ও উপহার প্রদানের পূর্ণাঙ্গ হিসাব।'
              : 'Track doctor prescribers, monthly prescriptions written, sample medicines & promotional gifts.'}
          </p>
        </div>

        {/* Action Buttons styled strictly to UI Template Palette */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => handleOpenAddExpense()}
            className="h-10 px-4 rounded-xl bg-[#35383d] hover:bg-[#43474d] text-zinc-100 text-xs font-semibold flex items-center space-x-2 border border-[#43474d] transition-all shadow-sm active:scale-95"
          >
            <Gift className="size-4 text-[#fae0d1]" />
            <span>{mode === 'bn' ? 'উপহার ও স্যাম্পল খাতা' : 'Log Gift or Sample'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddDoctor()}
            className="h-10 px-4 rounded-xl bg-white hover:bg-zinc-100 text-[#0b0c10] text-xs font-bold flex items-center space-x-2 transition-all shadow-md active:scale-95"
          >
            <Plus className="size-4 text-[#0b0c10] stroke-[3]" />
            <span>{mode === 'bn' ? '+ নতুন ডাক্তার' : '+ Add Doctor'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metric Cards (UI Template pastel theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Doctors */}
        <div className="bg-[#15161c] border border-[#252628] rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {mode === 'bn' ? 'তালিকাভুক্ত ডাক্তার' : 'Listed Doctors'}
            </span>
            <div className="size-8 rounded-lg bg-[#fae0d1]/10 text-[#fae0d1] grid place-items-center">
              <Stethoscope className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalDoctorsCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {mode === 'bn' ? 'সকল টেরিটরিতে সক্রিয়' : 'Active across all territories'}
          </div>
        </div>

        {/* Card 2: Monthly Prescriptions Written */}
        <div className="bg-[#15161c] border border-[#252628] rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {mode === 'bn' ? 'মাসিক প্রেসক্রিপশন সংখ্যা' : 'Monthly Prescriptions'}
            </span>
            <div className="size-8 rounded-lg bg-[#de9489]/10 text-[#de9489] grid place-items-center">
              <FileText className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalPrescriptionsMonthly} <span className="text-sm font-normal text-zinc-400">{mode === 'bn' ? 'টি' : 'Rx'}</span></div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {mode === 'bn' ? 'সেনাটিক্স ওষুধের জন্য লেখা' : 'Written for Senatix brands'}
          </div>
        </div>

        {/* Card 3: Total Promotional Expense */}
        <div className="bg-[#15161c] border border-[#252628] rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {mode === 'bn' ? 'মোট প্রচার ও উপহার খরচ' : 'Doctor Promotion & Gifts'}
            </span>
            <div className="size-8 rounded-lg bg-[#86759f]/10 text-[#86759f] grid place-items-center">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{formatCurrency(totalPromotionalExpense)}</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {mode === 'bn' ? 'স্যাম্পল, গিফট ও সম্মানী' : 'Samples, gifts & honorarium'}
          </div>
        </div>

        {/* Card 4: Gift & Visit Events */}
        <div className="bg-[#15161c] border border-[#252628] rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {mode === 'bn' ? 'ভিজিট ও স্যাম্পল ইভেন্ট' : 'Visit & Gift Events'}
            </span>
            <div className="size-8 rounded-lg bg-[#1b1c20] text-[#fae0d1] border border-[#252628] grid place-items-center">
              <Award className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalGiftEvents}</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {mode === 'bn' ? 'ফিল্ড প্রতিনিধিদের অডিট রেকর্ড' : 'Field MPO logs on record'}
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#15161c] border border-[#252628] rounded-2xl p-4 sm:p-5">
        {/* Navigation Tabs (Directory vs Recent Expenses) */}
        <div className="flex items-center justify-between border-b border-[#252628] pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'directory'
                  ? 'bg-[#35383d] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {mode === 'bn' ? 'ডাক্তারদের প্রোফাইল ও চেম্বার' : 'Doctor Directory'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'expenses'
                  ? 'bg-[#35383d] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gift className="size-3.5 text-[#fae0d1]" />
              <span>{mode === 'bn' ? 'উপহার ও স্যাম্পল খরচের খাতা' : 'Promotional Gift History'}</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-[#252628] rounded-md text-zinc-300">
                {expenses.length}
              </span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                mode === 'bn'
                  ? 'ডাক্তারের নাম, চেম্বার বা ফোন নম্বর খুঁজুন...'
                  : 'Search doctor, chamber, specialty or phone...'
              }
              className="w-full h-10 pl-9 pr-3.5 bg-[#0b0c10] border border-[#252628] rounded-xl text-xs text-white placeholder-zinc-500 focus:border-[#de9489] outline-none"
            />
          </div>

          <div>
            <select
              value={selectedMarketId}
              onChange={(e) => setSelectedMarketId(e.target.value)}
              className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-xs text-zinc-300 focus:border-[#de9489] outline-none cursor-pointer"
            >
              <option value="all">{mode === 'bn' ? 'সকল এলাকা ও বাজার' : 'All Territories'}</option>
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-xs text-zinc-300 focus:border-[#de9489] outline-none cursor-pointer"
            >
              <option value="all">{mode === 'bn' ? 'সকল বিশেষজ্ঞ পদবী' : 'All Medical Specialties'}</option>
              <option value="Medicine">Medicine Specialist</option>
              <option value="Gynecologist">Gynecology & Obstetrics</option>
              <option value="Cardiologist">Cardiology</option>
              <option value="Dermatology">Dermatology & Skin</option>
              <option value="Pediatric">{mode === 'bn' ? 'শিশু রোগ বিশেষজ্ঞ' : 'Pediatrics'}</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Doctor Directory Cards */}
        {activeTab === 'directory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDoctors.length === 0 ? (
              <div className="col-span-full py-12 text-center text-zinc-400">
                <Stethoscope className="size-10 mx-auto text-zinc-600 mb-2" />
                <p className="text-sm font-medium">
                  {mode === 'bn' ? 'কোনো ডাক্তার পাওয়া যায়নি।' : 'No doctors found matching filters.'}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenAddDoctor()}
                  className="mt-3 text-xs text-[#fae0d1] hover:underline"
                >
                  {mode === 'bn' ? '+ নতুন ডাক্তার প্রোফাইল যুক্ত করুন' : '+ Add a new doctor profile'}
                </button>
              </div>
            ) : (
              filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-[#1b1c20] border border-[#252628] hover:border-[#35383d] rounded-2xl p-4 transition-all flex flex-col justify-between"
                >
                  {/* Top section: Avatar, Info, Code */}
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <SmartAvatar
                          imageUrl={doc.image_url}
                          name={doc.name}
                          size="lg"
                          ringColor="border-[#fae0d1]"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-white hover:text-[#fae0d1] cursor-pointer">
                              {doc.name}
                            </h3>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#252628] text-zinc-300">
                              {doc.doctor_code}
                            </span>
                          </div>
                          <p className="text-xs text-[#fae0d1] font-medium mt-0.5">
                            {doc.degrees}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {doc.specialty}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenAddDoctor(doc)}
                        className="text-[11px] font-medium text-zinc-400 hover:text-white px-2 py-1 bg-[#252628] rounded-lg transition-colors"
                      >
                        {mode === 'bn' ? 'সম্পাদনা' : 'Edit'}
                      </button>
                    </div>

                    {/* Chamber, Phone, MPO Details */}
                    <div className="mt-3.5 space-y-1.5 text-xs text-zinc-300 pt-3 border-t border-[#252628]">
                      <div className="flex items-center space-x-2 text-zinc-400">
                        <Building2 className="size-3.5 text-[#de9489] shrink-0" />
                        <span className="truncate">{doc.hospital_chamber}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <div className="flex items-center space-x-2">
                          <Phone className="size-3.5 text-[#fae0d1] shrink-0" />
                          <span className="text-zinc-200">{doc.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[11px]">
                          <MapPin className="size-3 text-[#86759f]" />
                          <span className="text-zinc-300">{doc.market_name || 'Assigned Market'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-zinc-400 text-[11px]">
                        <UserCheck className="size-3 text-amber-400 shrink-0" />
                        <span>{mode === 'bn' ? 'অফিসার:' : 'Officer:'} <strong className="text-zinc-200">{doc.assigned_emp_name || 'Tanvir Hossain'}</strong></span>
                      </div>
                    </div>

                    {/* Prescribed Products Tags */}
                    {doc.prescribed_products && doc.prescribed_products.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {doc.prescribed_products.map((prod, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#252628] text-zinc-300 text-[10px] rounded-md font-medium border border-[#35383d]"
                          >
                            💊 {prod}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Stats & 1-Click Action */}
                  <div className="mt-4 pt-3 border-t border-[#252628] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-400">
                        {mode === 'bn' ? 'মাসিক প্রেসক্রিপশন' : 'Monthly Prescriptions'}
                      </div>
                      <div className="text-sm font-bold text-white">
                        {doc.prescriptions_written_monthly} <span className="text-[10px] font-normal text-zinc-400">{mode === 'bn' ? 'টি' : 'Rx'}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-zinc-400">
                        {mode === 'bn' ? 'প্রচার ও উপহার খরচ' : 'Promotional Spend'}
                      </div>
                      <div className="text-sm font-bold text-[#fae0d1]">
                        {formatCurrency(doc.total_promotional_expense)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAddExpense(doc)}
                      className="px-3 py-1.5 bg-[#35383d] hover:bg-[#43474d] text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <Gift className="size-3.5 text-[#fae0d1]" />
                      <span>{mode === 'bn' ? 'উপহার দিন' : 'Log Gift'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Promotional Expenses History Table */}
        {activeTab === 'expenses' && (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#252628] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">{mode === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="py-3 px-3">{mode === 'bn' ? 'ডাক্তারের নাম' : 'Doctor Name'}</th>
                  <th className="py-3 px-3">{mode === 'bn' ? 'ক্যাটাগরি' : 'Type'}</th>
                  <th className="py-3 px-3">{mode === 'bn' ? 'বিবরণ ও আইটেম' : 'Details'}</th>
                  <th className="py-3 px-3">{mode === 'bn' ? 'প্রেসক্রিপশন' : 'Prescriptions'}</th>
                  <th className="py-3 px-3">{mode === 'bn' ? 'পরিমাণ (টাকা)' : 'Amount (Tk)'}</th>
                  <th className="py-3 px-3">{mode === 'bn' ? 'প্রতিনিধি' : 'Field Officer'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252628]">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                      {mode === 'bn' ? 'কোনো উপহার বা প্রচারের রেকর্ড নেই।' : 'No promotional expense records logged yet.'}
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#1b1c20]/60 transition-colors">
                      <td className="py-3 px-3 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                        {exp.expense_date}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                        {exp.doctor_name}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            exp.expense_type === 'Sample_Medicine'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : exp.expense_type === 'Gift_Item'
                              ? 'bg-[#fae0d1]/20 text-[#fae0d1] border border-[#fae0d1]/30'
                              : exp.expense_type === 'Cash_Honorarium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {exp.expense_type === 'Sample_Medicine'
                            ? (mode === 'bn' ? '💊 নমুনা ঔষধ' : '💊 Sample Medicine')
                            : exp.expense_type === 'Gift_Item'
                            ? (mode === 'bn' ? '🎁 উপহার' : '🎁 Gift Item')
                            : exp.expense_type === 'Cash_Honorarium'
                            ? (mode === 'bn' ? '💰 সম্মানী ভাতা' : '💰 Honorarium')
                            : (mode === 'bn' ? '🍽️ সেমিনার ও খাবার' : '🍽️ Seminar & Food')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-300 max-w-xs truncate" title={exp.title}>
                        <div className="font-medium truncate">{exp.title}</div>
                        {exp.notes && (
                          <div className="text-[10px] text-zinc-500 truncate">{exp.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-zinc-200 font-semibold whitespace-nowrap">
                        {exp.prescriptions_written_count ? `${exp.prescriptions_written_count} ${mode === 'bn' ? 'টি' : 'Rx'}` : '—'}
                      </td>
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                        {exp.employee_name}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Add or Edit Doctor Profile */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#15161c] border border-[#252628] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <div className="flex items-center space-x-2">
                <Stethoscope className="size-5 text-[#fae0d1]" />
                <h3 className="font-bold text-base text-white">
                  {editingDoctor
                    ? mode === 'bn'
                      ? 'ডাক্তারের প্রোফাইল সম্পাদন'
                      : 'Edit Doctor Profile'
                    : mode === 'bn'
                    ? 'নতুন ডাক্তার প্রোফাইল যুক্ত করুন'
                    : 'Add New Doctor Profile'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDoctorModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-4 py-4 text-xs">
              {/* Optional Photo Uploader */}
              <div>
                <label className="block font-medium text-zinc-300 mb-1">
                  {mode === 'bn' ? 'ডাক্তারের ছবি (ঐচ্ছিক)' : 'Doctor Photo (Optional)'}
                </label>
                <PhotoUploader
                  currentImageUrl={docPhoto}
                  onImageSelected={setDocPhoto}
                  label={mode === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Doctor Photo'}
                  type="person"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block font-medium text-zinc-300 mb-1">
                  {mode === 'bn' ? 'ডাক্তারের পুরো নাম *' : 'Doctor Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Dr. M. A. Karim"
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-white outline-none focus:border-[#de9489]"
                />
              </div>

              {/* Degrees & Specialty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-300 mb-1">
                    {mode === 'bn' ? 'ডিগ্রিসমূহ' : 'Degrees'}
                  </label>
                  <input
                    type="text"
                    value={docDegrees}
                    onChange={(e) => setDocDegrees(e.target.value)}
                    placeholder="MBBS, FCPS (Medicine)"
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-white outline-none focus:border-[#de9489]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-300 mb-1">
                    {mode === 'bn' ? 'বিশেষজ্ঞ পদবী' : 'Specialty'}
                  </label>
                  <input
                    type="text"
                    value={docSpecialty}
                    onChange={(e) => setDocSpecialty(e.target.value)}
                    placeholder="Medicine Specialist"
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-white outline-none focus:border-[#de9489]"
                  />
                </div>
              </div>

              {/* Hospital / Chamber */}
              <div>
                <label className="block font-medium text-zinc-300 mb-1">
                  {mode === 'bn' ? 'হাসপাতাল বা চেম্বার ঠিকানা *' : 'Chamber Address *'}
                </label>
                <input
                  type="text"
                  required
                  value={docChamber}
                  onChange={(e) => setDocChamber(e.target.value)}
                  placeholder="Popular Diagnostic Center, Mirpur-10, Dhaka"
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-white outline-none focus:border-[#de9489]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-medium text-zinc-300 mb-1">
                  {mode === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  value={docPhone}
                  onChange={(e) => setDocPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-white outline-none focus:border-[#de9489]"
                />
              </div>

              {/* Territory & Assigned MPO */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-300 mb-1">
                    {mode === 'bn' ? 'নির্ধারিত এলাকা' : 'Territory'}
                  </label>
                  <select
                    value={docMarketId}
                    onChange={(e) => setDocMarketId(e.target.value)}
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-zinc-300 outline-none focus:border-[#de9489]"
                  >
                    {markets.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-300 mb-1">
                    {mode === 'bn' ? 'দায়িত্বপ্রাপ্ত সেলস অফিসার' : 'Assigned Sales Officer'}
                  </label>
                  <select
                    value={docAssignedEmpId}
                    onChange={(e) => setDocAssignedEmpId(e.target.value)}
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-zinc-300 outline-none focus:border-[#de9489]"
                  >
                    {employees.map((emp) => (
                      <option key={emp.emp_id} value={emp.emp_id}>
                        {emp.name} ({emp.emp_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prescribed Products Selection */}
              <div>
                <label className="block font-medium text-zinc-300 mb-1.5">
                  {mode === 'bn' ? 'প্রেসক্রাইব করা ঔষধসমূহ নির্বাচন করুন' : 'Select Prescribed Medicines'}
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-[#0b0c10] rounded-xl border border-[#252628]">
                  {products.map((p) => {
                    const isSelected = docPrescribedProducts.includes(p.name);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePrescribedProduct(p.name)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                          isSelected
                            ? 'bg-[#35383d] text-white border-[#fae0d1]'
                            : 'bg-[#1b1c20] text-zinc-400 border-[#252628] hover:text-white'
                        }`}
                      >
                        {isSelected && <Check className="size-3 inline mr-1 text-[#fae0d1]" />}
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="pt-4 border-t border-[#252628] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#252628] hover:bg-[#35383d] text-zinc-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold shadow-md"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Log Doctor Promotional Gift / Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#15161c] border border-[#252628] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <div className="flex items-center space-x-2">
                <Gift className="size-5 text-[#fae0d1]" />
                <h3 className="font-bold text-base text-white">
                  {mode === 'bn' ? 'ডাক্তার উপহার ও স্যাম্পল খাতা' : 'Log Doctor Promotion'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 py-4 text-xs">
              {/* Doctor Selector */}
              <div>
                <label className="block font-medium text-zinc-300 mb-1">
                  {mode === 'bn' ? 'ডাক্তার নির্বাচন করুন *' : 'Select Doctor *'}
                </label>
                <select
                  required
                  value={expDoctorId}
                  onChange={(e) => setExpDoctorId(e.target.value)}
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-zinc-200 outline-none focus:border-[#de9489]"
                >
                  <option value="">{mode === 'bn' ? '-- ডাক্তার নির্বাচন করুন --' : '-- Choose Doctor --'}</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.hospital_chamber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Expense Type & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-300 mb-1">
                    {mode === 'bn' ? 'খরচ বা প্রচারের ধরন *' : 'Promotional Type *'}
                  </label>
                  <select
                    value={expType}
                    onChange={(e) => setExpType(e.target.value as any)}
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-zinc-200 outline-none focus:border-[#de9489]"
                  >
                    <option value="Gift_Item">🎁 Clinical Gift Item</option>
                    <option value="Sample_Medicine">💊 Sample Medicine Boxes</option>
                    <option value="Cash_Honorarium">💰 {mode === 'bn' ? 'সম্মানী ভাতা' : 'Honorarium'}</option>
                    <option value="Dinner_Conference">🍽️ {mode === 'bn' ? 'সেমিনার ও আপ্যায়ন' : 'Conference & Hospitality'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-300 mb-1">
                    {mode === 'bn' ? 'ভিজিটের তারিখ' : 'Visit Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-zinc-200 outline-none focus:border-[#de9489]"
                  />
                </div>
              </div>

              {/* Title & Details */}
              <div>
                <label className="block font-medium text-zinc-300 mb-1">
                  {mode === 'bn' ? 'উপহার বা আইটেমের বিবরণ *' : 'Item Description *'}
                </label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder={
                    expType === 'Sample_Medicine'
                      ? 'e.g. Sample Pack: Cal-D Plus (10 boxes) + Gastroloc (10 boxes)'
                      : expType === 'Gift_Item'
                      ? 'e.g. Executive Leather Prescription Pad & Parker Pen Set'
                      : 'e.g. Clinical Observational Remuneration'
                  }
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-white outline-none focus:border-[#de9489]"
                />
              </div>

              {/* Amount & Prescriptions Written Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-300 mb-1">
                    {mode === 'bn' ? 'খরচের পরিমাণ (টাকা)' : 'Cost Amount (Tk)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    placeholder={mode === 'bn' ? '৳ ০' : 'Tk 0'}
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-white outline-none focus:border-[#de9489]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-300 mb-1">
                    {mode === 'bn' ? 'লেখা প্রেসক্রিপশন সংখ্যা' : 'Prescriptions Written'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={expRxCount}
                    onChange={(e) => setExpRxCount(Number(e.target.value))}
                    placeholder="25"
                    className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-white outline-none focus:border-[#de9489]"
                  />
                </div>
              </div>

              {/* Visiting Field Officer */}
              <div>
                <label className="block font-medium text-zinc-300 mb-1">
                  {mode === 'bn' ? 'ভিজিটকারী সেলস অফিসার' : 'Visiting Field Officer'}
                </label>
                <select
                  value={expEmpId}
                  onChange={(e) => setExpEmpId(e.target.value)}
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-zinc-200 outline-none focus:border-[#de9489]"
                >
                  {employees.map((emp) => (
                    <option key={emp.emp_id} value={emp.emp_id}>
                      {emp.name} ({emp.emp_id} - {emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field Notes */}
              <div>
                <label className="block font-medium text-zinc-300 mb-1">
                  {mode === 'bn' ? 'ভিজিট ও ফিডব্যাক নোট (ঐচ্ছিক)' : 'Doctor Feedback & Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder={
                    mode === 'bn'
                      ? 'ডাক্তার সেনাটিক্স ওষুধের গুণমানের প্রশংসা করেছেন এবং নতুন ব্যাচের স্যাম্পল চেয়েছেন...'
                      : 'Doctor committed regular Rx for Cal-D Plus in evening chamber...'
                  }
                  className="w-full p-2.5 bg-[#0b0c10] border border-[#252628] rounded-xl text-white outline-none focus:border-[#de9489]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#252628] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#252628] hover:bg-[#35383d] text-zinc-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold shadow-md"
                >
                  {mode === 'bn' ? 'খরচ জমা করুন' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
