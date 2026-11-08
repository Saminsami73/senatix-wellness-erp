'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Receipt, FileDown, Boxes, User } from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { Product, ProductBatch, Employee, EmpStock } from '@/types/erp';
import { useLanguage } from '@/context/LanguageContext';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { SmartAvatar } from '@/components/ui/SmartAvatar';

interface QuickBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickBillModal: React.FC<QuickBillModalProps> = ({ isOpen, onClose }) => {
  const { mode } = useLanguage();

  const [employees, setEmployees] = useState<Employee[]>(erpStore.getEmployees());
  const [products, setProducts] = useState<Product[]>(erpStore.getProducts());
  const [batches, setBatches] = useState<ProductBatch[]>(erpStore.getProductBatches());
  const [currentUser, setCurrentUser] = useState<Employee>(erpStore.getCurrentUser());

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [stockSource, setStockSource] = useState<'Employee_Stock' | 'Warehouse_Direct'>('Employee_Stock');
  const [orderType, setOrderType] = useState<'Instant' | 'PreOrder'>('Instant');

  // Customer Direct Info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  interface CartItem {
    product: Product;
    batch: ProductBatch;
    qty: number;
    bonusQty: number;
    price: number;
    maxAvailable: number;
  }

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank'>('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staffStockList, setStaffStockList] = useState<EmpStock[]>([]);

  useEffect(() => {
    if (isOpen) {
      const emps = erpStore.getEmployees();
      setEmployees(emps);
      setProducts(erpStore.getProducts());
      setBatches(erpStore.getProductBatches());
      const user = erpStore.getCurrentUser();
      setCurrentUser(user);
      const activeId = user.emp_id || (emps[0]?.emp_id ?? '');
      setSelectedEmpId(activeId);
      setStaffStockList(erpStore.getEmpStock(activeId));
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedEmpId) {
      setStaffStockList(erpStore.getEmpStock(selectedEmpId));
    }
  }, [selectedEmpId]);

  if (!isOpen) return null;

  const selectedEmployee = employees.find((e) => e.emp_id === selectedEmpId) || currentUser;

  const handleAddToCart = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    let chosenBatch: ProductBatch | undefined;
    let maxQty = 0;

    if (stockSource === 'Employee_Stock') {
      const held = staffStockList.find((es) => es.product_id === prod.id && es.qty > 0);
      if (!held) {
        alert(
          mode === 'bn'
            ? 'এই কর্মীর কাছে এই ওষুধটির কোনো মজুত নেই।'
            : 'No stock available for this medicine with this employee.'
        );
        return;
      }
      chosenBatch = batches.find((b) => b.id === held.batch_id);
      maxQty = held.qty;
    } else {
      const validBatches = batches
        .filter((b) => b.product_id === prod.id && b.warehouse_qty > 0)
        .sort((a, b) => new Date(a.exp_date).getTime() - new Date(b.exp_date).getTime());
      chosenBatch = validBatches[0];
      maxQty = chosenBatch ? chosenBatch.warehouse_qty : 0;
    }

    if (!chosenBatch) {
      alert(mode === 'bn' ? 'এই ওষুধের কোনো স্টক ব্যাচ পাওয়া যায়নি।' : 'No valid batch found for this medicine.');
      return;
    }

    const existingIndex = cart.findIndex((it) => it.product.id === prod.id && it.batch.id === chosenBatch!.id);
    if (existingIndex >= 0) {
      const updated = [...cart];
      if (updated[existingIndex].qty + 1 > maxQty) {
        alert(mode === 'bn' ? `মজুতের বেশি দেওয়া সম্ভব নয়। মজুত: ${maxQty} বক্স` : `Stock limit reached: ${maxQty} boxes`);
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
    setSelectedProductId('');
  };

  const handleQtyChange = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const item = cart[index];
    if (newQty > item.maxAvailable) {
      alert(mode === 'bn' ? `সর্বোচ্চ প্রাপ্তব্য পরিমাণ: ${item.maxAvailable} বক্স` : `Max available: ${item.maxAvailable} boxes`);
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

  const handleSubmitBill = async () => {
    if (cart.length === 0) {
      alert(mode === 'bn' ? 'অনুগ্রহ করে অন্তত ১টি ওষুধ যোগ করুন' : 'Please add at least 1 medicine');
      return;
    }

    const buyerDisplayName = customerName.trim() || (mode === 'bn' ? 'সাধারণ ক্রেতা' : 'Direct Customer');

    setIsSubmitting(true);
    try {
      const invoice = erpStore.completeSaleOrOrder({
        customer_name: buyerDisplayName,
        customer_phone: customerPhone.trim() || undefined,
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
        notes: `Quick bill via ${selectedEmployee.name}`,
      });

      generateInvoicePDF(invoice);

      alert(mode === 'bn' ? `বিল সম্পন্ন হয়েছে! চালান নম্বর: ${invoice.invoice_ref}` : `Bill saved! Invoice: ${invoice.invoice_ref}`);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error creating invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products for dropdown
  const filteredDropdownProducts = products.filter((p) => {
    if (stockSource === 'Employee_Stock') {
      return staffStockList.some((es) => es.product_id === p.id && es.qty > 0);
    }
    return p.stock > 0;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#1b1c20] border border-[#252628] rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-white shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-[#15161c] border-b border-[#252628] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="size-8 rounded-lg sidebar-right-selected grid place-items-center">
              <Receipt className="size-4 text-black" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base">
                {mode === 'bn' ? 'দ্রুত নতুন বিল তৈরি' : 'Quick Sales Bill'}
              </h2>
              <p className="text-xs text-zinc-400">
                {mode === 'bn' ? 'বিল সম্পন্ন হলেই সরাসরি রসিদ বা চালান তৈরি হবে' : 'Invoice will be generated immediately'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full border border-zinc-700 hover:bg-zinc-800 grid place-items-center text-zinc-400 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto no-scrollbar space-y-4">
          {/* Seller & Stock Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">
                {mode === 'bn' ? 'বিক্রেতা কর্মী নির্বাচন করুন' : 'Seller Employee'}
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white outline-none focus:border-emerald-500"
              >
                {employees.map((e) => (
                  <option key={e.emp_id} value={e.emp_id}>
                    {e.name} ({e.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">
                {mode === 'bn' ? 'মজুত ওষুধের উৎস' : 'Stock Source'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStockSource('Employee_Stock')}
                  className={`h-10 text-xs font-semibold rounded-lg border transition-all ${
                    stockSource === 'Employee_Stock'
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {mode === 'bn' ? 'কর্মীর হাতের স্টক' : 'Staff Stock'}
                </button>
                <button
                  type="button"
                  onClick={() => setStockSource('Warehouse_Direct')}
                  className={`h-10 text-xs font-semibold rounded-lg border transition-all ${
                    stockSource === 'Warehouse_Direct'
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {mode === 'bn' ? 'প্রধান গুদাম' : 'Godown'}
                </button>
              </div>
            </div>
          </div>

          {/* Buyer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">
                {mode === 'bn' ? 'ক্রেতা বা দোকানের নাম' : 'Customer Name'}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={mode === 'bn' ? 'ক্রেতার নাম লিখুন' : 'Enter buyer name'}
                className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">
                {mode === 'bn' ? 'ক্রেতার মোবাইল নম্বর (ঐচ্ছিক)' : 'Customer Phone (Optional)'}
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Add Medicine Box */}
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2">
            <label className="text-xs text-zinc-300 font-medium flex items-center justify-between">
              <span>{mode === 'bn' ? 'ওষুধ নির্বাচন করুন' : 'Select Medicine'}</span>
              <span className="text-emerald-400 text-xs">
                {stockSource === 'Employee_Stock'
                  ? mode === 'bn'
                    ? `${selectedEmployee.name} এর কাছে আছে`
                    : `In-hand with ${selectedEmployee.name}`
                  : mode === 'bn'
                  ? 'গুদামের স্টক'
                  : 'Godown stock'}
              </span>
            </label>
            <div className="flex space-x-2">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="grow h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white outline-none focus:border-emerald-500"
              >
                <option value="">{mode === 'bn' ? '-- ওষুধ নির্বাচন করুন --' : '-- Select Medicine --'}</option>
                {filteredDropdownProducts.map((p) => {
                  let qty = 0;
                  if (stockSource === 'Employee_Stock') {
                    const held = staffStockList.find((es) => es.product_id === p.id);
                    qty = held?.qty || 0;
                  } else {
                    qty = p.stock;
                  }
                  return (
                    <option key={p.id} value={p.id}>
                      {mode === 'bn'
                        ? `${p.name} (${p.pack_size}) - দর: ৳${p.trade_price_tp} | মজুত: ${qty} বক্স`
                        : `${p.name} (${p.pack_size}) - Price: Tk ${p.trade_price_tp} | Stock: ${qty} boxes`}
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedProductId}
                className="h-10 px-4 bg-white hover:bg-zinc-100 disabled:opacity-50 text-[#0b0c10] font-bold text-xs rounded-lg flex items-center space-x-1 shrink-0 transition-colors"
              >
                <Plus className="size-4 text-black" />
                <span>{mode === 'bn' ? 'যোগ' : 'Add'}</span>
              </button>
            </div>
          </div>

          {/* Cart Table */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {mode === 'bn' ? `বিলে যোগ করা ওষুধসমূহ (${cart.length})` : `Selected Medicines (${cart.length})`}
            </div>

            {cart.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                {mode === 'bn'
                  ? 'কোনো ওষুধ এখনও বিলে যোগ করা হয়নি। ওপরের তালিকা থেকে ওষুধ নির্বাচন করুন।'
                  : 'No medicines added to the bill yet. Select a medicine above.'}
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${idx}`}
                    className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <SmartAvatar
                        imageUrl={item.product.image_url}
                        name={item.product.name}
                        type="product"
                        category={item.product.category}
                        size="sm"
                      />
                      <div>
                        <div className="font-semibold text-white">{item.product.name}</div>
                        <div className="text-xs text-zinc-400">
                          {mode === 'bn' ? 'ব্যাচ:' : 'Batch:'} {item.batch.batch_no} • {mode === 'bn' ? 'দর:' : 'Rate:'} ৳{item.price}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 bg-black p-1 rounded-md border border-zinc-800">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 1)}
                          className="w-12 h-6 bg-transparent text-center text-white text-xs outline-none font-bold"
                        />
                        <span className="text-xs text-zinc-500 pr-1">{mode === 'bn' ? 'বক্স' : 'box'}</span>
                      </div>

                      {item.bonusQty > 0 && (
                        <span className="px-2 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded text-xs font-bold">
                          +{item.bonusQty} {mode === 'bn' ? 'ফ্রি' : 'Free'}
                        </span>
                      )}

                      <div className="w-16 text-right font-bold text-white">
                        ৳ {(item.qty * item.price).toLocaleString()}
                      </div>

                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment & Summary */}
          {cart.length > 0 && (
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-zinc-400">{mode === 'bn' ? 'মোট মূল্য' : 'Total Price'}</label>
                  <div className="text-sm font-bold text-white mt-0.5">৳ {subTotal.toLocaleString()}</div>
                </div>

                <div>
                  <label className="text-zinc-400">{mode === 'bn' ? 'ডিসকাউন্ট (%)' : 'Discount (%)'}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    className="w-full h-8 px-2 bg-black border border-zinc-700 rounded mt-0.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400">{mode === 'bn' ? 'পরিশোধযোগ্য বিল' : 'Net Payable'}</label>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">৳ {netPayable.toLocaleString()}</div>
                </div>

                <div>
                  <label className="text-zinc-400">{mode === 'bn' ? 'পরিশোধের পরিমাণ' : 'Paid Amount'}</label>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-full h-8 px-2 bg-black border border-emerald-500/50 rounded mt-0.5 text-xs text-white font-bold"
                  />
                </div>
              </div>

              {/* Payment Method Pills */}
              <div className="flex items-center space-x-2 pt-1 border-t border-zinc-800 text-xs">
                <span className="text-zinc-400">{mode === 'bn' ? 'পেমেন্ট মাধ্যম:' : 'Payment:'}</span>
                {(['Cash', 'bKash', 'Nagad', 'Bank'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      paymentMethod === method
                        ? 'bg-white text-black font-bold'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {method}
                  </button>
                ))}
                <span className="ml-auto text-rose-400 font-semibold">
                  {mode === 'bn' ? 'বাকি থাকবে:' : 'Due:'} ৳ {dueAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-[#15161c] border-t border-[#252628] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs"
          >
            {mode === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            type="button"
            disabled={isSubmitting || cart.length === 0}
            onClick={handleSubmitBill}
            className="px-6 py-2.5 bg-white hover:bg-zinc-100 disabled:opacity-50 text-[#0b0c10] font-bold text-xs sm:text-sm rounded-lg flex items-center space-x-2 shadow-lg active:scale-95 transition-transform"
          >
            {isSubmitting ? (
              <span>{mode === 'bn' ? 'বিল তৈরি হচ্ছে...' : 'Saving bill...'}</span>
            ) : (
              <>
                <FileDown className="size-4 text-black" />
                <span>{mode === 'bn' ? 'চালান নিশ্চিত ও ডাউনলোড করুন' : 'Confirm and Download Invoice'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
