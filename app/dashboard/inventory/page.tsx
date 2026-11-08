'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  Calendar,
  X,
  Package,
  CheckCircle,
  Truck,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { useLanguage } from '@/context/LanguageContext';
import { Product, ProductBatch, Supplier, Customer, SalesReturn, DamagedExpiredStock, Employee, EmpStock } from '@/types/erp';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { PhotoUploader } from '@/components/ui/PhotoUploader';
import { exportSingleTableToExcel } from '@/lib/excelExport';

function InventoryContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'catalog';
  const { mode, t, formatCurrency } = useLanguage();

  const [activeTab, setActiveTab] = useState<'catalog' | 'grn' | 'batches' | 'quarantine' | 'staff_stock'>(initialTab);

  const [products, setProducts] = useState<Product[]>(erpStore.getProducts());
  const [batches, setBatches] = useState<ProductBatch[]>(erpStore.getProductBatches());
  const [suppliers, setSuppliers] = useState<Supplier[]>(erpStore.getSuppliers());
  const [customers, setCustomers] = useState<Customer[]>(erpStore.getCustomers());
  const [returns, setReturns] = useState<SalesReturn[]>(erpStore.getReturns());
  const [damagedStock, setDamagedStock] = useState<DamagedExpiredStock[]>(erpStore.getDamagedStock());
  const [employees, setEmployees] = useState<Employee[]>(erpStore.getEmployees());
  const [empStocks, setEmpStocks] = useState<EmpStock[]>(erpStore.getEmpStock());

  const [searchQuery, setSearchQuery] = useState('');

  // Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdGeneric, setNewProdGeneric] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Tablet');
  const [newProdStrength, setNewProdStrength] = useState('');
  const [newProdPackSize, setNewProdPackSize] = useState('1 Box');
  const [newProdSupplierId, setNewProdSupplierId] = useState('');
  const [newProdCostDP, setNewProdCostDP] = useState(0);
  const [newProdTradeTP, setNewProdTradeTP] = useState(0);
  const [newProdMRP, setNewProdMRP] = useState(0);
  const [newProdBonusBuy, setNewProdBonusBuy] = useState(0);
  const [newProdBonusFree, setNewProdBonusFree] = useState(0);
  const [newProdLowStock, setNewProdLowStock] = useState(50);
  const [newProdImage, setNewProdImage] = useState<string | null>(null);

  // GRN Factory Stock State
  const [grnSupplierId, setGrnSupplierId] = useState('');
  const [grnChallanNo, setGrnChallanNo] = useState('');
  const [grnProductId, setGrnProductId] = useState('');
  const [grnBatchNo, setGrnBatchNo] = useState('');
  const [grnExpDate, setGrnExpDate] = useState('');
  const [grnReceivedQty, setGrnReceivedQty] = useState(0);
  const [grnBonusQty, setGrnBonusQty] = useState(0);
  const [grnUnitCost, setGrnUnitCost] = useState(0);
  const [grnPaidAmount, setGrnPaidAmount] = useState(0);

  // Customer Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnCustomerId, setReturnCustomerId] = useState('');
  const [returnProductId, setReturnProductId] = useState('');
  const [returnBatchId, setReturnBatchId] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnCondition, setReturnCondition] = useState<'Good_Resaleable' | 'Damaged_Broken' | 'Expired'>('Good_Resaleable');
  const [returnCreditAmount, setReturnCreditAmount] = useState(0);

  useEffect(() => {
    const unsub = erpStore.subscribe(() => {
      setProducts(erpStore.getProducts());
      setBatches(erpStore.getProductBatches());
      setSuppliers(erpStore.getSuppliers());
      setCustomers(erpStore.getCustomers());
      setReturns(erpStore.getReturns());
      setDamagedStock(erpStore.getDamagedStock());
      setEmployees(erpStore.getEmployees());
      setEmpStocks(erpStore.getEmpStock());
    });
    return unsub;
  }, []);

  // Save new medicine
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    erpStore.addProduct({
      sku_code: `SNX-${newProdCategory.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: newProdName,
      generic_name: newProdGeneric,
      category: newProdCategory,
      strength: newProdStrength,
      pack_size: newProdPackSize,
      supplier_id: newProdSupplierId || (suppliers[0]?.id || null),
      cost_price_dp: newProdCostDP,
      trade_price_tp: newProdTradeTP,
      mrp: newProdMRP,
      bonus_buy_qty: newProdBonusBuy,
      bonus_free_qty: newProdBonusFree,
      low_stock_alert_level: newProdLowStock,
      image_url: newProdImage,
      is_active: true,
    });
    setShowAddProductModal(false);
    // Reset
    setNewProdName('');
    setNewProdGeneric('');
    setNewProdImage(null);
  };

  // Submit Factory GRN
  const handleReceiveFactoryStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grnSupplierId || !grnProductId || !grnBatchNo || !grnExpDate || grnReceivedQty <= 0) {
      alert('অনুগ্রহ করে সকল আবশ্যক ফিল্ড পূরণ করুন');
      return;
    }

    const prod = products.find((p) => p.id === grnProductId);
    const cost = grnUnitCost || prod?.cost_price_dp || 0;

    erpStore.addPurchaseGRN({
      supplier_id: grnSupplierId,
      factory_challan_no: grnChallanNo || `CHL-${Date.now().toString().slice(-6)}`,
      items: [
        {
          product_id: grnProductId,
          batch_no: grnBatchNo,
          exp_date: grnExpDate,
          received_qty: grnReceivedQty,
          free_bonus_qty: grnBonusQty,
          unit_cost_dp: cost,
          trade_price_tp: prod?.trade_price_tp || 0,
          mrp: prod?.mrp || 0,
        },
      ],
      paid_amount: grnPaidAmount,
      notes: 'Direct Factory GRN Receive',
    });

    alert('ফ্যাক্টরি থেকে নতুন স্টক গোডাউনে রিসিভ করা হয়েছে!');
    setGrnChallanNo('');
    setGrnBatchNo('');
    setGrnReceivedQty(0);
    setGrnBonusQty(0);
    setActiveTab('catalog');
  };

  // Process Sales Return
  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnCustomerId || !returnProductId || !returnBatchId || returnQty <= 0) {
      alert('সকল তথ্য নির্বাচন করুন');
      return;
    }

    erpStore.processReturn({
      customer_id: returnCustomerId,
      product_id: returnProductId,
      batch_id: returnBatchId,
      returned_qty: returnQty,
      condition: returnCondition,
      credit_amount: returnCreditAmount,
    });

    alert('ঔষধ রিটার্ন সফলভাবে গৃহীত হয়েছে!');
    setShowReturnModal(false);
  };

  // 1-Click Move Batch to Quarantine
  const handleMoveToQuarantine = (batch: ProductBatch) => {
    const qty = prompt(`কত বক্স নষ্ট/মেয়াদোত্তীর্ণ কোয়ারেন্টাইনে নিতে চান? (মজুত: ${batch.warehouse_qty})`, `${batch.warehouse_qty}`);
    if (!qty) return;
    const parsed = parseInt(qty);
    if (parsed > 0 && parsed <= batch.warehouse_qty) {
      erpStore.moveBatchToQuarantine(batch.id, parsed, 'Expired_In_Store');
      alert(`${parsed} বক্স ঔষধ কোয়ারেন্টাইন বক্সে স্থানান্তর করা হয়েছে!`);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.generic_name && p.generic_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#252628] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="size-9 rounded-xl bg-blue-500/20 border border-blue-500/30 grid place-items-center text-blue-400">
            <Boxes className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {mode === 'bn' ? 'ওষুধ ইনভেন্টরি ও গুদাম স্টক' : 'Medicine Inventory and Storage'}
            </h1>
            <p className="text-xs text-zinc-400">
              {mode === 'bn'
                ? 'ওষুধ তালিকা, ফ্যাক্টরি থেকে মালামাল গ্রহণ, ব্যাচ ট্র্যাকার ও কোয়ারেন্টাইন'
                : 'Catalog, factory receiving, expiry tracking and quarantine'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportSingleTableToExcel(products, 'Senatix_Medicines_Catalog')}
            className="px-3 py-1.5 bg-[#35383d] hover:bg-[#43474d] text-zinc-100 rounded-xl text-xs flex items-center space-x-1.5 border border-[#43474d] transition-colors"
          >
            <FileSpreadsheet className="size-4 text-[#fae0d1]" />
            <span>{mode === 'bn' ? 'এক্সেল ডাউনলোড' : 'Export Excel'}</span>
          </button>

          <button
            onClick={() => setShowAddProductModal(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus className="size-4 text-black stroke-[3]" />
            <span>{mode === 'bn' ? '+ নতুন ওষুধ যোগ' : '+ Add Medicine'}</span>
          </button>
        </div>
      </div>

      {/* 5 Tabs Segmented Bar */}
      <div className="p-1.5 bg-[#1b1c20] rounded-xl border border-[#252628] flex items-center space-x-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center justify-center space-x-1.5 ${
            activeTab === 'catalog'
              ? 'bg-[#35383d] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Package className="size-4 text-emerald-400" />
          <span>{mode === 'bn' ? 'মাস্টার ক্যাটালগ' : 'Master Catalog'} ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff_stock')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center justify-center space-x-1.5 ${
            activeTab === 'staff_stock'
              ? 'bg-[#35383d] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Boxes className="size-4 text-[#fae0d1]" />
          <span>{mode === 'bn' ? 'কর্মীদের অবিক্রীত স্টক' : 'Staff In-Hand Stock'} ({empStocks.reduce((a, s) => a + s.qty, 0)})</span>
        </button>

        <button
          onClick={() => setActiveTab('grn')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center justify-center space-x-1.5 ${
            activeTab === 'grn'
              ? 'bg-[#35383d] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Truck className="size-4 text-blue-400" />
          <span>{mode === 'bn' ? 'ফ্যাক্টরি ইনওয়ার্ড' : 'Factory GRN'}</span>
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center justify-center space-x-1.5 ${
            activeTab === 'batches'
              ? 'bg-[#35383d] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="size-4 text-amber-400" />
          <span>{mode === 'bn' ? 'ব্যাচ ও মেয়াদ ট্র্যাকার' : 'Batch Tracker'} ({batches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quarantine')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center justify-center space-x-1.5 ${
            activeTab === 'quarantine'
              ? 'bg-[#35383d] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <RotateCcw className="size-4 text-rose-400" />
          <span>{mode === 'bn' ? 'রিটার্ন ও কোয়ারেন্টাইন' : 'Quarantine'} ({damagedStock.length + returns.length})</span>
        </button>
      </div>

      {/* TAB 1: MASTER MEDICINE CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-3">
          <div className="p-3 bg-[#1b1c20] rounded-xl border border-[#252628] flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="size-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নাম বা জেনেরিক দিয়ে ঔষধ খুঁজুন..."
                className="w-full h-9 pl-9 pr-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
              />
            </div>
            <span className="text-xs text-zinc-400 hidden sm:block">
              মোট ঔষধ সংখ্যা: <strong className="text-white">{filteredProducts.length}</strong>
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-[#1b1c20] rounded-xl border border-[#252628] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#15161c] text-zinc-400 border-b border-[#252628]">
                <tr>
                  <th className="p-3">{mode === 'bn' ? 'ছবি' : 'Photo'}</th>
                  <th className="p-3">{mode === 'bn' ? 'ওষুধের নাম ও উপাদান' : 'Medicine & Generic'}</th>
                  <th className="p-3">{mode === 'bn' ? 'ধরন ও প্যাক সাইজ' : 'Category & Pack'}</th>
                  <th className="p-3 text-right">{mode === 'bn' ? 'কেনা দাম' : 'Cost Price'}</th>
                  <th className="p-3 text-right">{mode === 'bn' ? 'বিক্রয় দর' : 'Trade Price'}</th>
                  <th className="p-3 text-right">{mode === 'bn' ? 'গায়ের দাম' : 'Retail Price'}</th>
                  <th className="p-3 text-center">{mode === 'bn' ? 'বোনাস অফার' : 'Bonus'}</th>
                  <th className="p-3 text-center">{mode === 'bn' ? 'গুদাম স্টক' : 'Godown Stock'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252628]">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                          <Package className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-semibold text-white">
                          {mode === 'bn' ? 'কোনো ওষুধ এখনও তালিকাভুক্ত হয়নি' : 'No Medicines Added Yet'}
                        </h3>
                        <p className="text-xs text-zinc-400">
                          {mode === 'bn'
                            ? 'ডেমো ডেটা সফলভাবে সরানো হয়েছে। আপনার বাণিজ্যিক ব্যবহারের জন্য প্রথম আসল ওষুধ যুক্ত করতে নিচের বাটনে চাপ দিন।'
                            : 'All demo items removed. Click below to add your first commercial product.'}
                        </p>
                        <button
                          onClick={() => setShowAddProductModal(true)}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-emerald-900/30"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{mode === 'bn' ? 'নতুন ওষুধ যোগ করুন' : 'Add First Medicine'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#1f2026] transition-colors">
                      <td className="p-3">
                        <SmartAvatar
                          imageUrl={p.image_url}
                          name={p.name}
                          type="product"
                          category={p.category}
                          size="md"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-[11px] text-zinc-400">{p.generic_name}</div>
                        <div className="text-[10px] text-zinc-500">{p.sku_code}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px]">
                          {p.category}
                        </span>
                        <div className="text-[11px] text-zinc-400 mt-1">{p.pack_size}</div>
                      </td>
                      <td className="p-3 text-right font-medium text-zinc-300">
                        ৳ {p.cost_price_dp.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        ৳ {p.trade_price_tp.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-zinc-400">
                        ৳ {p.mrp.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        {p.bonus_buy_qty > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            {p.bonus_buy_qty}+{p.bonus_free_qty}
                          </span>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            p.stock <= p.low_stock_alert_level
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {p.stock} বক্স
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-2.5">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center bg-[#1b1c20] rounded-xl border border-[#252628] space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {mode === 'bn' ? 'কোনো ওষুধ এখনও যুক্ত হয়নি' : 'No Medicines Yet'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {mode === 'bn'
                    ? 'আসল পণ্য যুক্ত করে গোডাউন ইনভেন্টরি শুরু করুন।'
                    : 'Add real medicines to begin commercial tracking.'}
                </p>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  {mode === 'bn' ? '+ নতুন ওষুধ যোগ করুন' : '+ Add New Medicine'}
                </button>
              </div>
            ) : (
              filteredProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-[#1b1c20] rounded-xl border border-[#252628] flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <SmartAvatar
                    imageUrl={p.image_url}
                    name={p.name}
                    type="product"
                    category={p.category}
                    size="lg"
                  />
                  <div>
                    <div className="font-semibold text-white text-sm">{p.name}</div>
                    <div className="text-[11px] text-zinc-400">{p.generic_name}</div>
                    <div className="text-[11px] text-emerald-400 font-bold mt-1">
                      TP: ৳{p.trade_price_tp} | DP: ৳{p.cost_price_dp}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      p.stock <= p.low_stock_alert_level ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    {p.stock} বক্স
                  </div>
                  {p.bonus_buy_qty > 0 && (
                    <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                      {p.bonus_buy_qty}+{p.bonus_free_qty} ফ্রি
                    </div>
                  )}
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RECEIVE FACTORY STOCK (GRN) */}
      {activeTab === 'grn' && (
        <div className="p-5 bg-[#1b1c20] rounded-xl border border-[#252628] max-w-2xl mx-auto space-y-4">
          <div className="pb-3 border-b border-[#252628]">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Truck className="size-5 text-blue-400" />
              <span>{mode === 'bn' ? 'ফ্যাক্টরি থেকে নতুন ওষুধ গ্রহণ' : 'Factory Stock Receipt'}</span>
            </h2>
            <p className="text-xs text-zinc-400">
              {mode === 'bn'
                ? 'সাপ্লায়ার চালান ও ব্যাচ অনুযায়ী নতুন স্টক গুদামে যুক্ত করুন'
                : 'Add new stock to warehouse by supplier challan and batch'}
            </p>
          </div>

          <form onSubmit={handleReceiveFactoryStock} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 font-medium">
                  {mode === 'bn' ? 'সরবরাহকারী বা ফ্যাক্টরি *' : 'Supplier or Factory *'}
                </label>
                <select
                  required
                  value={grnSupplierId}
                  onChange={(e) => setGrnSupplierId(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none focus:border-blue-500"
                >
                  <option value="">{mode === 'bn' ? '-- সাপ্লায়ার নির্বাচন করুন --' : '-- Select Supplier --'}</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-medium">
                  {mode === 'bn' ? 'ফ্যাক্টরি চালান নম্বর' : 'Factory Challan Number'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. CHL-BX-9812"
                  value={grnChallanNo}
                  onChange={(e) => setGrnChallanNo(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 font-medium">
                {mode === 'bn' ? 'ওষুধ নির্বাচন করুন *' : 'Select Medicine *'}
              </label>
              <select
                required
                value={grnProductId}
                onChange={(e) => {
                  setGrnProductId(e.target.value);
                  const p = products.find((prod) => prod.id === e.target.value);
                  if (p) setGrnUnitCost(p.cost_price_dp);
                }}
                className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none focus:border-blue-500"
              >
                <option value="">{mode === 'bn' ? '-- ওষুধ নির্বাচন করুন --' : '-- Select Medicine --'}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.pack_size}) - {mode === 'bn' ? 'বর্তমান কেনা দর: ' : 'Cost: '}৳{p.cost_price_dp}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 font-medium">
                  {mode === 'bn' ? 'ব্যাচ নম্বর *' : 'Batch Number *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B26-902"
                  value={grnBatchNo}
                  onChange={(e) => setGrnBatchNo(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">
                  {mode === 'bn' ? 'মেয়াদ উত্তীর্ণের তারিখ *' : 'Expiry Date *'}
                </label>
                <input
                  type="date"
                  required
                  value={grnExpDate}
                  onChange={(e) => setGrnExpDate(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-zinc-400 font-medium">
                  {mode === 'bn' ? 'প্রাপ্ত বক্স সংখ্যা *' : 'Received Boxes *'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={grnReceivedQty}
                  onChange={(e) => setGrnReceivedQty(parseInt(e.target.value) || 0)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">
                  {mode === 'bn' ? 'ফ্রি বোনাস বক্স (যদি থাকে)' : 'Free Bonus Boxes (If any)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={grnBonusQty}
                  onChange={(e) => setGrnBonusQty(parseInt(e.target.value) || 0)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium">
                  {mode === 'bn' ? 'প্রতি বক্সের কেনা দর' : 'Unit Cost Price'}
                </label>
                <input
                  type="number"
                  value={grnUnitCost}
                  onChange={(e) => setGrnUnitCost(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex justify-between items-center text-sm">
              <span className="text-zinc-400">
                {mode === 'bn' ? 'চালানের সর্বমোট ক্রয়মূল্য:' : 'Total Cost Amount:'}
              </span>
              <span className="font-bold text-emerald-400 text-base">
                ৳ {(grnReceivedQty * grnUnitCost).toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md active:scale-98 transition-transform"
            >
              <CheckCircle className="size-4 text-black" />
              <span>{mode === 'bn' ? 'ফ্যাক্টরি স্টক গ্রহণ নিশ্চিত করুন' : 'Confirm Stock Receipt'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: BATCH & EXPIRY TRACKER (FEFO) */}
      {activeTab === 'batches' && (
        <div className="space-y-3">
          <div className="p-3 bg-[#1b1c20] rounded-xl border border-[#252628] flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-semibold">
              FEFO অটোমেশন: বিক্রির সময় স্বয়ংক্রিয়ভাবে নিকটবর্তী মেয়াদের বৈধ ব্যাচ নির্বাচন হয়
            </span>
            <span className="text-zinc-400">
              ব্যাচ সংখ্যা: <strong className="text-white">{batches.length}</strong>
            </span>
          </div>

          {batches.length === 0 ? (
            <div className="p-12 text-center bg-[#1b1c20] rounded-xl border border-[#252628] space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white">
                {mode === 'bn' ? 'কোনো ব্যাচ এখনও যুক্ত করা হয়নি' : 'No Batches Registered Yet'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {mode === 'bn'
                  ? 'ওষুধ ক্রয় বা কারখানার চালান আসার পর ‘নতুন চালান গ্রহন (GRN)’ অপশন থেকে ব্যাচ ও মেয়াদ দিয়ে স্টক ইন করুন।'
                  : 'Receive incoming stock from GRN to register batches with manufacturing and expiry dates.'}
              </p>
              <button
                onClick={() => setActiveTab('grn')}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-emerald-900/30"
              >
                <span>{mode === 'bn' ? 'চালান গ্রহন (GRN) শুরু করুন' : 'Go to Stock In (GRN)'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {batches.map((b) => {
              const isExpired = (b.days_to_expiry || 0) <= 0;
              const isNearExpiry = (b.days_to_expiry || 0) <= 90 && !isExpired;

              return (
                <div
                  key={b.id}
                  className={`p-4 bg-[#1b1c20] rounded-xl border transition-colors flex flex-col justify-between ${
                    isExpired
                      ? 'border-rose-500/50 bg-rose-950/20'
                      : isNearExpiry
                      ? 'border-amber-500/50 bg-amber-950/20'
                      : 'border-[#252628]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{b.product_name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isExpired
                            ? 'bg-rose-500 text-white'
                            : isNearExpiry
                            ? 'bg-amber-500 text-black'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isExpired
                          ? mode === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Expired'
                          : isNearExpiry
                          ? `${b.days_to_expiry} ${mode === 'bn' ? 'দিন বাকি' : 'days left'}`
                          : mode === 'bn' ? 'নিরাপদ স্টক' : 'Safe Stock'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                      <div>
                        {mode === 'bn' ? 'ব্যাচ নম্বর: ' : 'Batch: '}<strong className="text-white">{b.batch_no}</strong>
                      </div>
                      <div>
                        {mode === 'bn' ? 'মেয়াদ: ' : 'Expiry: '}<strong className="text-white">{b.exp_date}</strong>
                      </div>
                      <div>
                        {mode === 'bn' ? 'কেনা দর: ' : 'Cost: '}৳{b.cost_price_dp}
                      </div>
                      <div>
                        {mode === 'bn' ? 'বিক্রয় দর: ' : 'Trade Price: '}৳{b.trade_price_tp}
                      </div>
                    </div>

                    <div className="p-2 bg-zinc-900 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-zinc-400">{mode === 'bn' ? 'গুদামে আছে:' : 'In Warehouse:'}</span>
                      <span className="font-bold text-white text-sm">{b.warehouse_qty} {mode === 'bn' ? 'বক্স' : 'boxes'}</span>
                    </div>
                  </div>

                  {/* Move to Quarantine Button */}
                  <button
                    onClick={() => handleMoveToQuarantine(b)}
                    className="w-full mt-3 py-1.5 bg-zinc-800 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-zinc-700 hover:border-rose-500/40 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
                  >
                    <ShieldAlert className="size-3.5" />
                    <span>{mode === 'bn' ? 'কোয়ারেন্টাইন বক্সে স্থানান্তর করুন' : 'Move to Quarantine'}</span>
                  </button>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* TAB 4: RETURNS & QUARANTINE */}
      {activeTab === 'quarantine' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-300 font-semibold uppercase tracking-wider">
              ঔষধ ফেরত ও নষ্ট/মেয়াদোত্তীর্ণ লগ
            </span>
            <button
              onClick={() => setShowReturnModal(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
            >
              <RotateCcw className="size-4" />
              <span>{mode === 'bn' ? '+ কাস্টমার ফেরত ও নষ্ট এন্ট্রি' : '+ Return & Damage Entry'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Returns List */}
            <div className="p-4 bg-[#1b1c20] rounded-xl border border-[#252628] space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                {mode === 'bn' ? 'ফার্মেসি থেকে গৃহীত ফেরত' : 'Pharmacy Sales Returns'}
              </h3>
              {returns.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-lg">
                  কোনো সেলস রিটার্ন রেকর্ড নেই।
                </div>
              ) : (
                <div className="space-y-2">
                  {returns.map((r) => (
                    <div key={r.id} className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-white">{r.customer_name}</strong>
                        <span className="text-emerald-400 font-bold">-৳ {r.credit_amount_reduced_from_due}</span>
                      </div>
                      <div className="text-zinc-400">
                        {r.product_name} • {r.returned_qty} বক্স ({r.condition})
                      </div>
                      <div className="text-[10px] text-zinc-500">{r.return_date} • Ref: {r.return_ref}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quarantine Damaged/Expired */}
            <div className="p-4 bg-[#1b1c20] rounded-xl border border-[#252628] space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-rose-400">
                নষ্ট বা মেয়াদোত্তীর্ণ কোয়ারেন্টাইন স্টক (Damaged Stock)
              </h3>
              {damagedStock.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-lg">
                  কোয়ারেন্টাইন বক্সে কোনো নষ্ট ঔষধ নেই।
                </div>
              ) : (
                <div className="space-y-2">
                  {damagedStock.map((d) => (
                    <div key={d.id} className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-white">{d.product_name}</strong>
                        <span className="text-rose-400 font-bold">ক্ষতি: ৳ {d.loss_amount_at_dp}</span>
                      </div>
                      <div className="text-zinc-400">
                        ব্যাচ: {d.batch_no} • {d.qty} বক্স • কারণ: {d.reason}
                      </div>
                      <div className="text-[10px] text-zinc-500">{d.date_logged} • অবস্থা: {d.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STAFF IN-HAND UNSOLD STOCK */}
      {activeTab === 'staff_stock' && (
        <div className="space-y-4">
          {/* Top Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-[#1b1c20] rounded-xl border border-[#252628]">
              <div className="text-xs text-zinc-400">{mode === 'bn' ? 'কর্মীদের কাছে মোট অবিক্রীত ওষুধ' : 'Total Staff In-Hand Stock'}</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-1">
                {empStocks.reduce((a, s) => a + s.qty, 0)}{' '}
                <span className="text-xs font-normal text-zinc-400">{mode === 'bn' ? 'বক্স' : 'boxes'}</span>
              </div>
            </div>

            <div className="p-4 bg-[#1b1c20] rounded-xl border border-[#252628]">
              <div className="text-xs text-zinc-400">{mode === 'bn' ? 'মজুত ওষুধের মোট বাজারমূল্য' : 'Total Held Stock Value (TP)'}</div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
                {formatCurrency(empStocks.reduce((a, s) => a + s.qty * (s.tp || 0), 0))}
              </div>
            </div>

            <div className="p-4 bg-[#1b1c20] rounded-xl border border-[#252628]">
              <div className="text-xs text-zinc-400">{mode === 'bn' ? 'ওষুধ গ্রহণকারী সক্রিয় কর্মী' : 'Staff With Stock'}</div>
              <div className="text-xl sm:text-2xl font-bold text-[#fae0d1] mt-1">
                {new Set(empStocks.filter((s) => s.qty > 0).map((s) => s.emp_id)).size}{' '}
                <span className="text-xs font-normal text-zinc-400">{mode === 'bn' ? 'জন কর্মী' : 'staff members'}</span>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-3 bg-[#1b1c20] rounded-xl border border-[#252628] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="size-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={mode === 'bn' ? 'কর্মী বা ওষুধের নাম দিয়ে খুঁজুন...' : 'Search by staff or medicine name...'}
                className="w-full h-9 pl-9 pr-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-xs text-white outline-none"
              />
            </div>
            <div className="text-xs text-zinc-400">
              {mode === 'bn' ? 'অবিক্রীত স্টক তালিকা' : 'Unsold Inventory Table'}
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-[#1b1c20] rounded-xl border border-[#252628] overflow-hidden">
            {empStocks.filter((s) => s.qty > 0).length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                {mode === 'bn' ? 'বর্তমানে কোনো কর্মীর কাছে অবিক্রীত ওষুধ নেই।' : 'No unsold stock is currently held by any employee.'}
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#15161c] text-zinc-400 border-b border-[#252628]">
                    <tr>
                      <th className="p-3">{mode === 'bn' ? 'কর্মী' : 'Employee'}</th>
                      <th className="p-3">{mode === 'bn' ? 'ওষুধের নাম' : 'Medicine'}</th>
                      <th className="p-3">{mode === 'bn' ? 'ব্যাচ নম্বর' : 'Batch'}</th>
                      <th className="p-3 text-right">{mode === 'bn' ? 'হাতে মজুত' : 'In-Hand Qty'}</th>
                      <th className="p-3 text-right">{mode === 'bn' ? 'মোট মূল্য' : 'Total Value (TP)'}</th>
                      <th className="p-3 text-center">{mode === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252628]">
                    {empStocks
                      .filter((s) => s.qty > 0)
                      .filter((s) => {
                        const emp = employees.find((e) => e.emp_id === s.emp_id);
                        const matchText = `${emp?.name || ''} ${s.product_name || ''} ${s.batch_no || ''}`.toLowerCase();
                        return matchText.includes(searchQuery.toLowerCase());
                      })
                      .map((stk) => {
                        const emp = employees.find((e) => e.emp_id === stk.emp_id);
                        const lineValue = stk.qty * (stk.tp || 0);

                        return (
                          <tr key={stk.id} className="hover:bg-[#1f2026] transition-colors">
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <SmartAvatar
                                  imageUrl={emp?.image_url}
                                  name={emp?.name || 'Staff'}
                                  size="sm"
                                />
                                <div>
                                  <div className="font-semibold text-white">{emp?.name || stk.emp_id}</div>
                                  <div className="text-[10px] text-zinc-400">{emp?.phone}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-white">
                              {stk.product_name}
                            </td>
                            <td className="p-3 font-mono text-[11px] text-zinc-400">
                              {stk.batch_no || stk.batch_id}
                            </td>
                            <td className="p-3 text-right font-bold text-emerald-400">
                              {stk.qty} {mode === 'bn' ? 'বক্স' : 'boxes'}
                            </td>
                            <td className="p-3 text-right font-semibold text-white">
                              {formatCurrency(lineValue)}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const confirmReturn = confirm(
                                    mode === 'bn'
                                      ? `আপনি কি ${emp?.name || stk.emp_id} এর থেকে ${stk.qty} বক্স ${stk.product_name} গুদামে ফেরত নিতে চান?`
                                      : `Return ${stk.qty} boxes of ${stk.product_name} from ${emp?.name} to godown?`
                                  );
                                  if (confirmReturn) {
                                    erpStore.transferStockBackToWarehouse(stk.emp_id, stk.product_id, stk.batch_id, stk.qty);
                                    alert(mode === 'bn' ? 'সফলভাবে গুদামে ফেরত গ্রহণ করা হয়েছে!' : 'Stock returned successfully!');
                                    setEmpStocks(erpStore.getEmpStock());
                                    setBatches(erpStore.getProductBatches());
                                    setProducts(erpStore.getProducts());
                                  }
                                }}
                                className="px-2.5 py-1 bg-[#35383d] hover:bg-[#43474d] text-zinc-200 rounded-lg text-xs font-medium transition-colors"
                              >
                                {mode === 'bn' ? 'গুদামে ফেরত নিন' : 'Return to Godown'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Medicine Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1c20] border border-[#252628] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <h3 className="font-bold text-base">
                {mode === 'bn' ? 'নতুন ওষুধ যোগ করুন' : 'Add New Medicine'}
              </h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-zinc-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="py-4 space-y-3 text-xs">
              <PhotoUploader
                currentImageUrl={newProdImage}
                onImageSelected={(url) => setNewProdImage(url)}
                label={mode === 'bn' ? 'ওষুধের ছবি আপলোড (ঐচ্ছিক)' : 'Product Photo (Optional)'}
                type="product"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400">
                    {mode === 'bn' ? 'ওষুধের নাম *' : 'Medicine Brand Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. Cal-D Plus"
                    className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400">
                    {mode === 'bn' ? 'জেনেরিক বা মূল উপাদান' : 'Generic Formula'}
                  </label>
                  <input
                    type="text"
                    value={newProdGeneric}
                    onChange={(e) => setNewProdGeneric(e.target.value)}
                    placeholder="e.g. Calcium Carbonate"
                    className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400">
                    {mode === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Drop">Drop</option>
                    <option value="Supplement">Supplement</option>
                    <option value="Injection">Injection</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400">
                    {mode === 'bn' ? 'প্যাক সাইজ' : 'Pack Size'}
                  </label>
                  <input
                    type="text"
                    value={newProdPackSize}
                    onChange={(e) => setNewProdPackSize(e.target.value)}
                    placeholder="Box of 30 Tablets"
                    className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400">
                    {mode === 'bn' ? 'কম স্টক সতর্কতা মাত্রা' : 'Low Stock Alert Level'}
                  </label>
                  <input
                    type="number"
                    value={newProdLowStock}
                    onChange={(e) => setNewProdLowStock(parseInt(e.target.value) || 50)}
                    className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400">
                    {mode === 'bn' ? 'ফ্যাক্টরি কেনা দাম *' : 'Factory Cost Price *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdCostDP}
                    onChange={(e) => setNewProdCostDP(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400">
                    {mode === 'bn' ? 'বিক্রয় দর *' : 'Trade Price *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdTradeTP}
                    onChange={(e) => setNewProdTradeTP(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400">
                    {mode === 'bn' ? 'খুচরা গায়ের দাম' : 'Retail Price'}
                  </label>
                  <input
                    type="number"
                    value={newProdMRP}
                    onChange={(e) => setNewProdMRP(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <div>
                  <label className="text-zinc-400">
                    {mode === 'bn' ? 'বোনাস অফার (কত বক্স কিনলে)' : 'Bonus Buy Quantity'}
                  </label>
                  <input
                    type="number"
                    value={newProdBonusBuy}
                    onChange={(e) => setNewProdBonusBuy(parseInt(e.target.value) || 0)}
                    placeholder="e.g. 10"
                    className="w-full h-8 px-2 bg-black border border-zinc-700 rounded text-xs text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-zinc-400">
                    {mode === 'bn' ? 'ফ্রি দেওয়া হবে (কত বক্স)' : 'Free Bonus Boxes'}
                  </label>
                  <input
                    type="number"
                    value={newProdBonusFree}
                    onChange={(e) => setNewProdBonusFree(parseInt(e.target.value) || 0)}
                    placeholder="e.g. 1"
                    className="w-full h-8 px-2 bg-black border border-zinc-700 rounded text-xs text-white mt-1"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg"
                >
                  {mode === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold rounded-xl shadow-md transition-all"
                >
                  {mode === 'bn' ? 'সংরক্ষণ করুন' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1c20] border border-[#252628] rounded-xl max-w-md w-full p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252628]">
              <h3 className="font-bold text-base">
                {mode === 'bn' ? 'ওষুধ ফেরত গ্রহণ' : 'Medicine Return'}
              </h3>
              <button onClick={() => setShowReturnModal(false)} className="text-zinc-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleProcessReturn} className="py-4 space-y-3 text-xs">
              <div>
                <label className="text-zinc-400">
                  {mode === 'bn' ? 'ক্রেতা বা দোকান নির্বাচন করুন *' : 'Select Customer or Shop *'}
                </label>
                <select
                  required
                  value={returnCustomerId}
                  onChange={(e) => setReturnCustomerId(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1"
                >
                  <option value="">{mode === 'bn' ? '-- ক্রেতা নির্বাচন করুন --' : '-- Select Customer --'}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shop_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400">
                  {mode === 'bn' ? 'ওষুধ নির্বাচন করুন *' : 'Select Medicine *'}
                </label>
                <select
                  required
                  value={returnProductId}
                  onChange={(e) => {
                    setReturnProductId(e.target.value);
                    const b = batches.find((batch) => batch.product_id === e.target.value);
                    if (b) setReturnBatchId(b.id);
                  }}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1"
                >
                  <option value="">{mode === 'bn' ? '-- ওষুধ নির্বাচন করুন --' : '-- Select Medicine --'}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400">
                    {mode === 'bn' ? 'ফেরত বক্স সংখ্যা *' : 'Returned Box Quantity *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={returnQty}
                    onChange={(e) => {
                      const q = parseInt(e.target.value) || 1;
                      setReturnQty(q);
                      const p = products.find((prod) => prod.id === returnProductId);
                      if (p) setReturnCreditAmount(q * p.trade_price_tp);
                    }}
                    className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1 font-bold"
                  />
                </div>
                <div>
                  <label className="text-zinc-400">
                    {mode === 'bn' ? 'ওষুধের বর্তমান অবস্থা *' : 'Medicine Condition *'}
                  </label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value as any)}
                    className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white mt-1"
                  >
                    <option value="Good_Resaleable">{mode === 'bn' ? 'ভালো (পুনর্বিক্রয়যোগ্য)' : 'Good and Resaleable'}</option>
                    <option value="Damaged_Broken">{mode === 'bn' ? 'ভাঙা বা নষ্ট' : 'Damaged or Broken'}</option>
                    <option value="Expired">{mode === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Expired'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400">
                  {mode === 'bn' ? 'বাকি থেকে বাদ যাবে (টাকা) *' : 'Deduct from Due Balance (Tk) *'}
                </label>
                <input
                  type="number"
                  required
                  value={returnCreditAmount}
                  onChange={(e) => setReturnCreditAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-sm text-white mt-1 font-bold outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-sm rounded-xl mt-2 shadow-md transition-all"
              >
                {mode === 'bn' ? 'রিটার্ন সম্পন্ন করুন' : 'Confirm Return'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const { mode } = useLanguage();
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-zinc-500">{mode === 'bn' ? 'লোড হচ্ছে...' : 'Loading inventory...'}</div>}>
      <InventoryContent />
    </React.Suspense>
  );
}

