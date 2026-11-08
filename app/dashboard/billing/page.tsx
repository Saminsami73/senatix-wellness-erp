'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Minus,
  Trash2,
  FileDown,
  ShoppingBag,
  User,
  Boxes,
  Check,
  Phone,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { useLanguage } from '@/context/LanguageContext';
import { Customer, Product, ProductBatch, Employee, Invoice, EmpStock } from '@/types/erp';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { generateInvoicePDF } from '@/lib/pdfGenerator';

interface CartItem {
  product: Product;
  batch: ProductBatch;
  qty: number;
  bonusQty: number;
  price: number;
  maxAvailable: number;
}

export default function BillingPOSPage() {
  const { mode, formatCurrency } = useLanguage();

  const [employees, setEmployees] = useState<Employee[]>(erpStore.getEmployees());
  const [products, setProducts] = useState<Product[]>(erpStore.getProducts());
  const [batches, setBatches] = useState<ProductBatch[]>(erpStore.getProductBatches());
  const [currentUser, setCurrentUser] = useState<Employee>(erpStore.getCurrentUser());

  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState(currentUser.emp_id || (employees[0]?.emp_id ?? ''));
  const [stockSource, setStockSource] = useState<'Employee_Stock' | 'Warehouse_Direct'>('Employee_Stock');
  const [orderType, setOrderType] = useState<'Instant' | 'PreOrder'>('Instant');

  // Customer / Buyer Details (Simple text input, direct sale friendly)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart & Financials
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank'>('Cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCompletedInvoice, setLastCompletedInvoice] = useState<Invoice | null>(null);

  // Load employee stock
  const [staffStockList, setStaffStockList] = useState<EmpStock[]>([]);

  const refreshState = () => {
    const emps = erpStore.getEmployees();
    setEmployees(emps);
    setProducts(erpStore.getProducts());
    setBatches(erpStore.getProductBatches());
    const user = erpStore.getCurrentUser();
    setCurrentUser(user);
    if (!selectedEmpId && emps.length > 0) {
      setSelectedEmpId(user.emp_id || emps[0].emp_id);
    }
  };

  useEffect(() => {
    refreshState();
    const unsub = erpStore.subscribe(refreshState);
    return unsub;
  }, []);

  useEffect(() => {
    if (selectedEmpId) {
      setStaffStockList(erpStore.getEmpStock(selectedEmpId));
    }
  }, [selectedEmpId]);

  const selectedEmployee = employees.find((e) => e.emp_id === selectedEmpId) || currentUser;

  const categories = ['All', 'Tablet', 'Capsule', 'Syrup', 'Drop', 'Supplement'];

  // Products available based on stock source
  const availableProducts = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.generic_name && p.generic_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.sku_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

    if (!matchesQuery || !matchesCat) return false;

    if (stockSource === 'Employee_Stock') {
      // Must have at least 1 box in employee stock
      const hasEmpStock = staffStockList.some((es) => es.product_id === p.id && es.qty > 0);
      return hasEmpStock;
    }

    return true;
  });

  const handleAddProduct = (prod: Product) => {
    let chosenBatch: ProductBatch | undefined;
    let maxQty = 0;

    if (stockSource === 'Employee_Stock') {
      const empItem = staffStockList.find((es) => es.product_id === prod.id && es.qty > 0);
      if (!empItem) {
        alert(mode === 'bn' ? 'এই কর্মীর কাছে এই ওষুধটির কোনো মজুত নেই।' : 'No in-hand stock for this medicine with this employee.');
        return;
      }
      chosenBatch = batches.find((b) => b.id === empItem.batch_id);
      maxQty = empItem.qty;
    } else {
      // FEFO from warehouse
      const validBatches = batches
        .filter((b) => b.product_id === prod.id && b.warehouse_qty > 0)
        .sort((a, b) => new Date(a.exp_date).getTime() - new Date(b.exp_date).getTime());

      chosenBatch = validBatches[0];
      maxQty = chosenBatch ? chosenBatch.warehouse_qty : 0;
    }

    if (!chosenBatch) {
      alert(mode === 'bn' ? 'ওষুধটির উপযুক্ত কোনো ব্যাচ পাওয়া যায়নি।' : 'No valid batch found for this medicine.');
      return;
    }

    const existingIndex = cart.findIndex((it) => it.product.id === prod.id && it.batch.id === chosenBatch!.id);
    if (existingIndex >= 0) {
      const updated = [...cart];
      if (updated[existingIndex].qty + 1 > maxQty) {
        alert(
          mode === 'bn'
            ? `মজুতের বেশি দেওয়া যাবে না। সর্বোচ্চ মজুত: ${maxQty} বক্স`
            : `Cannot exceed available stock. Max: ${maxQty} boxes`
        );
        return;
      }
      updated[existingIndex].qty += 1;
      if (prod.bonus_buy_qty > 0 && updated[existingIndex].qty >= prod.bonus_buy_qty) {
        updated[existingIndex].bonusQty = Math.floor(updated[existingIndex].qty / prod.bonus_buy_qty) * prod.bonus_free_qty;
      }
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          product: prod,
          batch: chosenBatch,
          qty: 1,
          bonusQty: prod.bonus_buy_qty === 1 ? prod.bonus_free_qty : 0,
          price: prod.trade_price_tp,
          maxAvailable: maxQty,
        },
      ]);
    }
  };

  const handleQtyChange = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const item = cart[index];
    if (newQty > item.maxAvailable) {
      alert(
        mode === 'bn'
          ? `সর্বোচ্চ প্রাপ্তব্য পরিমাণ ${item.maxAvailable} বক্স`
          : `Maximum available is ${item.maxAvailable} boxes`
      );
      return;
    }
    const updated = [...cart];
    updated[index].qty = newQty;
    const prod = updated[index].product;
    if (prod.bonus_buy_qty > 0) {
      updated[index].bonusQty = Math.floor(newQty / prod.bonus_buy_qty) * prod.bonus_free_qty;
    }
    setCart(updated);
  };

  const handleRemoveItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subTotal = cart.reduce((acc, it) => acc + it.qty * it.price, 0);
  const discountAmount = (subTotal * discountPercent) / 100;
  const netPayable = Math.max(0, subTotal - discountAmount);
  const dueAmount = Math.max(0, netPayable - paidAmount);

  const handleSubmitBill = () => {
    if (cart.length === 0) {
      alert(mode === 'bn' ? 'অনুগ্রহ করে অন্তত ১টি ওষুধ বিলে যোগ করুন।' : 'Please add at least 1 medicine to the bill.');
      return;
    }

    const buyerDisplayName = customerName.trim() || (mode === 'bn' ? 'সাধারণ ক্রেতা' : 'Direct Customer');

    setIsSubmitting(true);
    try {
      const invoice = erpStore.completeSaleOrOrder({
        customer_name: buyerDisplayName,
        customer_phone: customerPhone.trim() || undefined,
        customer_address: customerAddress.trim() || undefined,
        emp_id: selectedEmpId,
        stock_source: stockSource,
        order_status: orderType === 'Instant' ? 'Delivered_Final' : 'Order_Booked',
        items: cart.map((it) => ({
          product_id: it.product.id,
          batch_id: it.batch.id,
          qty: it.qty,
          bonus_qty: it.bonusQty,
          unit_cost_dp: it.product.cost_price_dp,
          unit_price: it.price,
          discount_percent: discountPercent,
          total_price: it.qty * it.price - (it.qty * it.price * discountPercent) / 100,
        })),
        sub_total: subTotal,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        net_payable: netPayable,
        paid_amount: paidAmount,
        payment_method: paidAmount > 0 ? paymentMethod : 'Due_Only',
        notes: notes || `Direct bill via ${selectedEmployee.name}`,
      });

      setLastCompletedInvoice(invoice);
      setCart([]);
      setDiscountPercent(0);
      setPaidAmount(0);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setNotes('');
      // Refresh local staff stock
      setStaffStockList(erpStore.getEmpStock(selectedEmpId));
      alert(mode === 'bn' ? 'বিল সফলভাবে সম্পন্ন ও স্টক থেকে কর্তন করা হয়েছে!' : 'Bill created and stock updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Error creating invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#252628] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="size-9 rounded-xl sidebar-right-selected grid place-items-center">
            <Receipt className="size-5 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {mode === 'bn' ? 'নতুন বিল ও রসিদ তৈরি' : 'Create New Bill and Receipt'}
            </h1>
            <p className="text-xs text-zinc-400">
              {mode === 'bn'
                ? 'কর্মী নির্বাচন করুন, ওষুধ বাছাই করে সরাসরি বিল ও চালান তৈরি করুন'
                : 'Select the seller, choose medicines and print customer invoice'}
            </p>
          </div>
        </div>

        {lastCompletedInvoice && (
          <button
            onClick={() => generateInvoicePDF(lastCompletedInvoice)}
            className="px-4 py-2 bg-white hover:bg-zinc-100 text-[#0b0c10] font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md active:scale-95 transition-all self-start sm:self-auto"
          >
            <FileDown className="size-4" />
            <span>
              {mode === 'bn' ? 'শেষ চালান প্রিন্ট' : 'Print Invoice'}: {lastCompletedInvoice.invoice_ref}
            </span>
          </button>
        )}
      </div>

      {/* Split-Screen POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Seller, Stock Source, Customer Info + Medicine Grid */}
        <div className="lg:col-span-7 space-y-4">
          {/* Step 1: Seller & Stock Source Card */}
          <div className="p-4 bg-[#1b1c20] rounded-xl border border-[#252628] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                {mode === 'bn' ? 'ধাপ ১: বিক্রেতা কর্মী ও মজুত সূত্র' : 'Step 1: Seller and Stock Origin'}
              </span>
              <span className="text-[11px] text-[#fae0d1] font-medium">
                {mode === 'bn' ? 'অফিস লগইন' : 'Active User'}: {currentUser.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Employee Selector */}
              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  {mode === 'bn' ? 'কে ওষুধ বিক্রি করছেন' : 'Select Seller Employee'}
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full h-11 px-3 bg-[#0b0c10] border border-[#252628] focus:border-[#de9489] rounded-xl text-sm text-white outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.emp_id} value={emp.emp_id}>
                      {emp.name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Source Selector */}
              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  {mode === 'bn' ? 'ওষুধ কোথা থেকে দেওয়া হবে' : 'Stock Source'}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStockSource('Employee_Stock')}
                    className={`h-11 px-2 text-xs font-semibold rounded-xl border transition-all text-center flex items-center justify-center ${
                      stockSource === 'Employee_Stock'
                        ? 'bg-white text-[#0b0c10] border-white font-bold shadow-md'
                        : 'bg-[#0b0c10] text-zinc-300 border-[#252628] hover:text-white'
                    }`}
                  >
                    {mode === 'bn' ? 'কর্মীর হাতের স্টক' : 'Staff In-Hand'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockSource('Warehouse_Direct')}
                    className={`h-11 px-2 text-xs font-semibold rounded-xl border transition-all text-center flex items-center justify-center ${
                      stockSource === 'Warehouse_Direct'
                        ? 'bg-white text-[#0b0c10] border-white font-bold shadow-md'
                        : 'bg-[#0b0c10] text-zinc-300 border-[#252628] hover:text-white'
                    }`}
                  >
                    {mode === 'bn' ? 'প্রধান গুদাম' : 'Main Godown'}
                  </button>
                </div>
              </div>
            </div>

            {/* Buyer Details */}
            <div className="pt-2 border-t border-[#252628]">
              <label className="text-xs text-zinc-400 block mb-1.5">
                {mode === 'bn' ? 'ক্রেতার তথ্য (সরাসরি বিক্রয়)' : 'Buyer Details (Direct Sale)'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={mode === 'bn' ? 'ক্রেতা বা দোকানের নাম' : 'Customer or shop name'}
                  className="h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-xs text-white outline-none focus:border-[#de9489] placeholder-zinc-500"
                />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={mode === 'bn' ? 'ফোন নম্বর (ঐচ্ছিক)' : 'Phone number (optional)'}
                  className="h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-xs text-white outline-none focus:border-[#de9489] placeholder-zinc-500"
                />
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder={mode === 'bn' ? 'ঠিকানা (ঐচ্ছিক)' : 'Address (optional)'}
                  className="h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-xs text-white outline-none focus:border-[#de9489] placeholder-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Medicine Picker Grid */}
          <div className="p-4 bg-[#1b1c20] rounded-xl border border-[#252628] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                {mode === 'bn'
                  ? 'ধাপ ২: ওষুধ বাছাই করুন (ট্যাপ করে যোগ করুন)'
                  : 'Step 2: Choose Medicine (Tap to Add)'}
              </span>

              {/* Category Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#35383d] text-white shadow-sm'
                        : 'bg-[#0b0c10] text-zinc-400 border border-[#252628] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="size-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  mode === 'bn'
                    ? 'ওষুধের নাম বা উপাদান দিয়ে খুঁজুন...'
                    : 'Search by medicine name or generic...'
                }
                className="w-full h-11 pl-9 pr-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-sm text-white outline-none focus:border-[#de9489] placeholder-zinc-500"
              />
            </div>

            {/* Stock Notification Banner */}
            <div className="text-[11px] text-zinc-400 flex items-center justify-between px-1">
              <span>
                {stockSource === 'Employee_Stock'
                  ? mode === 'bn'
                    ? `${selectedEmployee.name} এর কাছে থাকা ওষুধ দেখানো হচ্ছে`
                    : `Showing medicines held by ${selectedEmployee.name}`
                  : mode === 'bn'
                  ? 'প্রধান গুদামের মোট ওষুধ দেখানো হচ্ছে'
                  : 'Showing main godown inventory'}
              </span>
              <span className="text-zinc-500">{availableProducts.length} {mode === 'bn' ? 'টি পাওয়া গেছে' : 'items found'}</span>
            </div>

            {/* Medicine Cards Grid */}
            {availableProducts.length === 0 ? (
              <div className="py-12 px-4 text-center text-zinc-400 text-xs border border-dashed border-[#252628] rounded-xl space-y-3">
                <p>
                  {stockSource === 'Employee_Stock'
                    ? mode === 'bn'
                      ? 'এই কর্মকর্তার কাছে বর্তমানে বিক্রির কোনো ঔষধ হস্তান্তর করা নেই। গুদাম হতে ঔষধ বরাদ্দ দিন।'
                      : 'This employee does not currently hold any van stock. Transfer stock from godown first.'
                    : products.length === 0
                    ? mode === 'bn'
                      ? 'সিস্টেমে কোনো ঔষধ তালিকাভুক্ত নেই। ইনভেন্টরিতে আপনার আসল বাণিজ্যিক ঔষধ যোগ করুন।'
                      : 'No medicines exist in the system yet. Please add your real products in Inventory first.'
                    : mode === 'bn'
                    ? 'এই ক্যাটাগরিতে কোনো ওষুধ পাওয়া যায়নি।'
                    : 'No medicines found in this category.'}
                </p>
                {products.length === 0 && (
                  <a
                    href="/dashboard/inventory"
                    className="inline-flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <span>{mode === 'bn' ? '+ ইনভেন্টরিতে ঔষধ যোগ করুন' : '+ Add Medicine in Inventory'}</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto no-scrollbar pt-1">
                {availableProducts.map((prod) => {
                  let heldCount = 0;
                  if (stockSource === 'Employee_Stock') {
                    const found = staffStockList.find((es) => es.product_id === prod.id);
                    heldCount = found?.qty || 0;
                  } else {
                    heldCount = prod.stock;
                  }

                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleAddProduct(prod)}
                      className="p-3 bg-[#15161c] hover:bg-[#1b1c20] cursor-pointer border border-[#252628] hover:border-[#35383d] rounded-xl flex items-center justify-between transition-all group active:scale-[0.98]"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <SmartAvatar
                          imageUrl={prod.image_url}
                          name={prod.name}
                          type="product"
                          category={prod.category}
                          size="md"
                        />
                        <div className="overflow-hidden">
                          <div className="font-semibold text-white text-xs truncate group-hover:text-[#fae0d1] transition-colors">
                            {prod.name}
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate">{prod.generic_name}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{prod.pack_size}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <div className="text-xs font-bold text-white">{mode === 'bn' ? '৳' : 'Tk'} {prod.trade_price_tp}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          {mode === 'bn' ? 'মজুত: ' : 'Stock: '}
                          <strong className={heldCount <= 5 ? 'text-amber-400' : 'text-emerald-400'}>
                            {heldCount}
                          </strong>{' '}
                          {mode === 'bn' ? 'বক্স' : 'boxes'}
                        </div>
                        {prod.bonus_buy_qty > 0 && (
                          <span className="inline-block mt-0.5 text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                            {prod.bonus_buy_qty}+{prod.bonus_free_qty}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Cart & Bill Settlement */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          <div className="p-4 bg-[#1b1c20] rounded-xl border border-[#252628] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#252628]">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="size-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">
                  {mode === 'bn' ? 'বর্তমান বিল ও চালান' : 'Current Bill and Invoice'}
                </h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {cart.length} {mode === 'bn' ? 'টি আইটেম' : 'items'}
              </span>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                {mode === 'bn'
                  ? 'বাম পাশের তালিকা থেকে ওষুধ নির্বাচন করে বিলে যোগ করুন।'
                  : 'Select medicines from the left to add them to this bill.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${idx}`}
                    className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div className="overflow-hidden mr-2">
                      <div className="font-semibold text-white truncate">{item.product.name}</div>
                      <div className="text-[10px] text-zinc-400">
                        {mode === 'bn'
                          ? `দর: ৳${item.price} • ব্যাচ: ${item.batch.batch_no}`
                          : `Price: Tk ${item.price} • Batch: ${item.batch.batch_no}`}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {/* Qty Controls */}
                      <div className="flex items-center space-x-1 bg-black p-1 rounded-md border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(idx, item.qty - 1)}
                          className="size-5 rounded grid place-items-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-7 text-center font-bold text-white text-xs">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(idx, item.qty + 1)}
                          className="size-5 rounded grid place-items-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      {item.bonusQty > 0 && (
                        <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-bold">
                          +{item.bonusQty} {mode === 'bn' ? 'ফ্রি' : 'free'}
                        </span>
                      )}

                      <div className="w-14 text-right font-bold text-white text-xs">
                        {mode === 'bn' ? '৳' : 'Tk'} {(item.qty * item.price).toLocaleString()}
                      </div>

                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Calculations & Discount */}
            <div className="pt-2 border-t border-[#252628] space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>{mode === 'bn' ? 'উপ-মোট মূল্য' : 'Subtotal'}:</span>
                <span className="text-white font-medium">{mode === 'bn' ? '৳' : 'Tk'} {subTotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">{mode === 'bn' ? 'বিশেষ ছাড় (%)' : 'Special Discount (%)'}:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-16 h-7 px-2 bg-zinc-900 border border-zinc-700 rounded text-right text-xs text-white outline-none"
                />
              </div>

              <div className="flex justify-between text-sm font-bold pt-1 border-t border-zinc-800">
                <span className="text-white">{mode === 'bn' ? 'সর্বমোট প্রদেয়' : 'Net Total'}:</span>
                <span className="text-emerald-400">{mode === 'bn' ? '৳' : 'Tk'} {netPayable.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Collection */}
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2.5">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                {mode === 'bn' ? 'ধাপ ৩: টাকা গ্রহণ ও পরিশোধ' : 'Step 3: Payment and Settlement'}
              </span>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  {mode === 'bn' ? 'নগদ বা ডিজিটাল পরিশোধের পরিমাণ (টাকা)' : 'Amount Paid by Buyer (Tk)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full h-10 px-3 bg-[#0b0c10] border border-[#252628] rounded-xl text-sm text-white font-bold outline-none focus:border-[#de9489]"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center space-x-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPaidAmount(netPayable)}
                  className="px-2.5 py-1 bg-[#1b1c20] hover:bg-[#252628] text-[#fae0d1] border border-[#252628] rounded-lg font-medium"
                >
                  {mode === 'bn' ? 'পুরো পরিশোধ' : 'Full Paid'}
                </button>
                <button
                  type="button"
                  onClick={() => setPaidAmount(0)}
                  className="px-2.5 py-1 bg-[#1b1c20] hover:bg-[#252628] text-rose-300 border border-[#252628] rounded-lg font-medium"
                >
                  {mode === 'bn' ? 'সম্পূর্ণ বাকি' : 'Full Due'}
                </button>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center space-x-1.5 pt-1 text-xs">
                {(['Cash', 'bKash', 'Nagad', 'Bank'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      paymentMethod === method
                        ? 'bg-[#35383d] text-white shadow-sm'
                        : 'bg-[#0b0c10] text-zinc-400 border border-[#252628] hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Due Warning / Balance */}
              <div className="p-2.5 bg-[#0b0c10] rounded-xl border border-[#252628] flex justify-between text-xs font-semibold">
                <span className="text-zinc-400">{mode === 'bn' ? 'বাকি থাকবে' : 'Remaining Due'}:</span>
                <span className={dueAmount > 0 ? 'text-rose-400 font-bold' : 'text-zinc-200'}>
                  {mode === 'bn' ? '৳' : 'Tk'} {dueAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit & PDF Button */}
            <button
              type="button"
              disabled={isSubmitting || cart.length === 0}
              onClick={handleSubmitBill}
              className="w-full h-12 bg-white hover:bg-zinc-100 disabled:opacity-50 text-[#0b0c10] font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg active:scale-98 transition-transform"
            >
              {isSubmitting ? (
                <span>{mode === 'bn' ? 'বিল তৈরি হচ্ছে...' : 'Saving bill...'}</span>
              ) : (
                <>
                  <FileDown className="size-5 text-black" />
                  <span>
                    {mode === 'bn' ? 'বিল সম্পন্ন করুন ও চালান প্রিন্ট' : 'Complete Bill and Print PDF'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
