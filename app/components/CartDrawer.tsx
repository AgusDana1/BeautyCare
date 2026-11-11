"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  X,
  Trash2,
  Minus,
  Plus,
  QrCode,
  CreditCard,
  Smartphone,
  ArrowRight,
  Sparkles,
  Gift,
} from "lucide-react";
import { CartItem, PaymentMethod } from "../types/storefront";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  totalCartItems: number;
  totalCartPrice: number;
  onUpdateQty: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  customerEmail: string;
  setCustomerEmail: (val: string) => void;
  customerAddress: string;
  setCustomerAddress: (val: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (val: PaymentMethod) => void;
  orderSubmitting: boolean;
  orderError: string;
  onSubmitOrder: (e: React.FormEvent, redeemPoints?: number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  totalCartItems,
  totalCartPrice,
  onUpdateQty,
  onRemoveItem,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  customerAddress,
  setCustomerAddress,
  paymentMethod,
  setPaymentMethod,
  orderSubmitting,
  orderError,
  onSubmitOrder,
}: CartDrawerProps) {
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [checkingLoyalty, setCheckingLoyalty] = useState(false);

  // Check loyalty points for customer
  const handleCheckLoyalty = async () => {
    const clean = customerPhone.replace(/[^0-9]/g, "");
    if (clean.length < 10) return;
    setCheckingLoyalty(true);
    try {
      const res = await fetch(`/api/loyalty?phone=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data?.customer?.points) {
        setLoyaltyPoints(data.customer.points);
      } else {
        setLoyaltyPoints(0);
      }
    } catch {
      setLoyaltyPoints(null);
    } finally {
      setCheckingLoyalty(false);
    }
  };

  // Close cart drawer on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate discount (1 pt = Rp 100, max 50% total)
  const maxDiscount = Math.floor(totalCartPrice * 0.5);
  const requestedDiscount = (loyaltyPoints || 0) * 100;
  const actualDiscount = useLoyalty
    ? Math.min(requestedDiscount, maxDiscount)
    : 0;
  const redeemedPoints = Math.floor(actualDiscount / 100);
  const finalPaymentPrice = Math.max(0, totalCartPrice - actualDiscount);
  const potentialEarnedPoints = Math.floor(finalPaymentPrice / 1000);

  const handleSubmit = (e: React.FormEvent) => {
    onSubmitOrder(e, useLoyalty ? redeemedPoints : 0);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end animate-fade-in cursor-pointer"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white w-full sm:max-w-md h-full shadow-2xl flex flex-col justify-between animate-fade-in-up cursor-default relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
            <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
              Keranjang Belanja ({totalCartItems})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
            aria-label="Tutup Keranjang"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="p-3 sm:p-5 flex-1 overflow-y-auto space-y-2 sm:space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12 sm:py-16 text-stone-400 space-y-2.5 sm:space-y-3">
              <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-stone-300 stroke-[1.5]" />
              <p className="text-[11px] sm:text-xs">Keranjang belanja Anda masih kosong.</p>
              <button
                onClick={onClose}
                className="text-[11px] sm:text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Mulai Belanja Produk →
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.productId}-${item.variantId || "base"}`}
                className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-stone-200/80 bg-stone-50/50 flex items-center justify-between gap-2.5 sm:gap-3"
              >
                {item.productImage ? (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-stone-200 text-stone-400 font-bold text-xs flex items-center justify-center shrink-0">
                    BC
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-0.5">
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                    {item.productName}
                  </h4>
                  {item.selectedSize && (
                    <span className="inline-block text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200/60">
                      Ukuran: {item.selectedSize}
                    </span>
                  )}
                  <p className="text-[11px] sm:text-xs font-mono font-bold text-stone-700">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(idx, item.quantity - 1)}
                      className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-stone-500 hover:bg-stone-100 transition cursor-pointer"
                    >
                      <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-stone-800 font-mono">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(idx, item.quantity + 1)}
                      className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-stone-500 hover:bg-stone-100 transition cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(idx)}
                    className="text-stone-400 hover:text-red-500 transition cursor-pointer p-0.5"
                    title="Hapus barang"
                  >
                    <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer & Checkout Form */}
        {cart.length > 0 && (
          <div className="p-3 sm:p-5 border-t border-stone-100 bg-white space-y-2.5 sm:space-y-3.5 max-h-[55vh] overflow-y-auto">
            {/* Price Breakdown */}
            <div className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal ({totalCartItems} barang):</span>
                <span className="font-mono">Rp {totalCartPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Ongkos Kirim:</span>
                <span className="font-bold text-emerald-600">GRATIS</span>
              </div>

              {actualDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Diskon Loyalty ({redeemedPoints} Pts):</span>
                  <span className="font-mono">-Rp {actualDiscount.toLocaleString("id-ID")}</span>
                </div>
              )}

              <div className="flex justify-between text-xs sm:text-sm font-extrabold text-stone-900 pt-1 border-t border-stone-100">
                <span>Total Pembayaran:</span>
                <span className="font-mono text-rose-600 text-sm sm:text-base">
                  Rp {finalPaymentPrice.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Points Earned Preview */}
              <div className="flex items-center justify-between text-[10px] text-amber-700 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/50">
                <span className="flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Reward Pesanan Ini:
                </span>
                <span className="font-bold">+{potentialEarnedPoints} Poin</span>
              </div>
            </div>

            {orderError && (
              <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-50 border border-red-200 text-red-700 text-[10px] sm:text-xs">
                {orderError}
              </div>
            )}

            {/* Direct Checkout Form inside Cart Drawer */}
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3 pt-0.5 text-[11px] sm:text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-0.5 sm:mb-1 text-[10px] sm:text-xs">
                  Nama Penerima <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 text-[11px] sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-0.5 sm:mb-1 text-[10px] sm:text-xs">
                    No. WA / HP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    onBlur={handleCheckLoyalty}
                    className="w-full p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 text-[11px] sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-0.5 sm:mb-1 text-[10px] sm:text-xs">Email</label>
                  <input
                    type="email"
                    placeholder="opsional"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 text-[11px] sm:text-sm"
                  />
                </div>
              </div>

              {/* LOYALTY POINTS REDEMPTION WIDGET */}
              {checkingLoyalty && (
                <div className="text-[10px] text-stone-400 italic">
                  Memeriksa saldo poin loyalty...
                </div>
              )}

              {loyaltyPoints !== null && loyaltyPoints > 0 && (
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 text-stone-800 text-[10px] sm:text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1 text-rose-800">
                      <Gift className="w-3.5 h-3.5 text-rose-600" />
                      Saldo Poin: {loyaltyPoints} Pts
                    </span>
                    <label className="flex items-center gap-1 font-bold text-rose-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useLoyalty}
                        onChange={(e) => setUseLoyalty(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>Tukar Diskon</span>
                    </label>
                  </div>
                  {useLoyalty && (
                    <p className="text-[10px] text-emerald-700 font-semibold">
                      ✓ Hemat Rp {actualDiscount.toLocaleString("id-ID")} dari {redeemedPoints} poin yang ditukarkan!
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-0.5 sm:mb-1 text-[10px] sm:text-xs">
                  Alamat Pengiriman <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jalan, No. Rumah, RT/RW, Kota"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 text-[11px] sm:text-sm"
                />
              </div>

              {/* Payment Method Selector in Cart */}
              <div>
                <label className="block font-semibold text-stone-700 mb-0.5 sm:mb-1 text-[10px] sm:text-xs">
                  Metode Pembayaran <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("QRIS")}
                    className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === "QRIS"
                        ? "bg-purple-50 border-purple-500 text-purple-800 font-bold"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-0.5 text-purple-600" />
                    <span className="text-[9px] sm:text-[10px] block">QRIS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("BANK_TRANSFER")}
                    className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === "BANK_TRANSFER"
                        ? "bg-blue-50 border-blue-500 text-blue-800 font-bold"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-0.5 text-blue-600" />
                    <span className="text-[9px] sm:text-[10px] block">Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("E_WALLET")}
                    className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === "E_WALLET"
                        ? "bg-rose-50 border-rose-500 text-rose-800 font-bold"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-0.5 text-rose-600" />
                    <span className="text-[9px] sm:text-[10px] block">E-Wallet</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={orderSubmitting}
                className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-[11px] sm:text-sm shadow-md sm:shadow-lg shadow-rose-600/30 hover:scale-[1.01] active:scale-98 transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 mt-1 sm:mt-2"
              >
                {orderSubmitting ? (
                  <>
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <>
                    <span>Checkout &amp; Bayar ({totalCartItems} Barang)</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
