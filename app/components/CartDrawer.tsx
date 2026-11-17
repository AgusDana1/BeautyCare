"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  X,
  Trash2,
  Minus,
  Plus,
  QrCode,
  CreditCard,
  Smartphone,
  ArrowRight,
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
      const points = data?.customer?.points ?? data?.points ?? 0;
      setLoyaltyPoints(points);
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
      className="fixed inset-0 z-[80] bg-[#292925]/70 backdrop-blur-xs flex justify-end animate-fade-in cursor-pointer"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-[#FAF8F4] w-full sm:max-w-md h-full shadow-2xl flex flex-col justify-between animate-fade-in-up cursor-default relative z-10 border-l border-[#EAE4DA] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE4DA] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#87947B]" />
            <h3 className="font-serif text-base text-[#292925]">
              Kantong Belanja ({totalCartItems})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#292925]/60 hover:text-[#292925] transition cursor-pointer"
            aria-label="Tutup Kantong"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-[#292925]/50 space-y-3 font-sans">
              <ShoppingBag className="w-10 h-10 mx-auto text-[#EAE4DA] stroke-[1.5]" />
              <p className="text-xs">Kantong belanja Anda masih kosong.</p>
              <button
                onClick={onClose}
                className="text-xs font-medium text-[#87947B] hover:text-[#292925] underline cursor-pointer"
              >
                Mulai Eksplorasi Formulasi →
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.productId}-${item.variantId || "base"}`}
                className="p-3 border border-[#EAE4DA] bg-white flex items-center justify-between gap-3 rounded-sm"
              >
                {item.productImage ? (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 object-cover border border-[#EAE4DA] shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#EAE4DA] text-[#292925] font-serif text-xs flex items-center justify-center shrink-0">
                    BC
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-0.5">
                  <h4 className="font-medium text-[#292925] text-xs truncate">
                    {item.productName}
                  </h4>
                  {item.selectedSize && (
                    <span className="inline-block text-[9px] font-mono px-1.5 py-0.2 bg-[#EAE4DA]/50 text-[#292925]">
                      {item.selectedSize}
                    </span>
                  )}
                  <p className="text-xs font-serif font-bold text-[#292925]">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center border border-[#EAE4DA] bg-white">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(idx, item.quantity - 1)}
                      className="px-2 py-0.5 text-[#292925] hover:bg-[#EAE4DA]/40 transition cursor-pointer"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="px-2 py-0.5 text-xs font-mono font-medium text-[#292925]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(idx, item.quantity + 1)}
                      className="px-2 py-0.5 text-[#292925] hover:bg-[#EAE4DA]/40 transition cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(idx)}
                    className="text-[#292925]/40 hover:text-red-600 transition cursor-pointer p-0.5"
                    title="Hapus barang"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer & Checkout Form */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#EAE4DA] bg-white space-y-3 max-h-[55vh] overflow-y-auto">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between text-[#292925]/70">
                <span>Subtotal ({totalCartItems} formulasi):</span>
                <span className="font-mono">Rp {totalCartPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-[#292925]/70">
                <span>Ongkos Kirim:</span>
                <span className="font-medium text-[#87947B]">BEBAS BIAYA</span>
              </div>

              {actualDiscount > 0 && (
                <div className="flex justify-between text-[#87947B] font-medium">
                  <span>Diskon Loyalty ({redeemedPoints} Pts):</span>
                  <span className="font-mono">-Rp {actualDiscount.toLocaleString("id-ID")}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-serif font-bold text-[#292925] pt-2 border-t border-[#EAE4DA]">
                <span>Total Pembayaran:</span>
                <span className="font-serif text-base text-[#292925]">
                  Rp {finalPaymentPrice.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Points Earned Preview */}
              <div className="flex items-center justify-between text-[11px] text-[#87947B] bg-[#87947B]/10 px-2.5 py-1 border border-[#87947B]/20 font-mono">
                <span>Loyalty Reward:</span>
                <span className="font-bold">+{potentialEarnedPoints} Poin</span>
              </div>
            </div>

            {orderError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {orderError}
              </div>
            )}

            {/* Direct Checkout Form inside Cart Drawer */}
            <form onSubmit={handleSubmit} className="space-y-2.5 pt-1 text-xs font-sans">
              <div>
                <label className="block font-medium text-[#292925] mb-1">
                  Nama Penerima <span className="text-[#87947B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border border-[#EAE4DA] outline-none focus:border-[#292925] text-xs bg-[#FAF8F4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-[#292925] mb-1">
                    No. WhatsApp <span className="text-[#87947B]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    onBlur={handleCheckLoyalty}
                    className="w-full p-2 border border-[#EAE4DA] outline-none focus:border-[#292925] text-xs bg-[#FAF8F4]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#292925] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="opsional"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-2 border border-[#EAE4DA] outline-none focus:border-[#292925] text-xs bg-[#FAF8F4]"
                  />
                </div>
              </div>

              {/* LOYALTY POINTS REDEMPTION WIDGET */}
              {checkingLoyalty && (
                <div className="text-[10px] text-[#292925]/50 italic">
                  Memeriksa saldo poin loyalty...
                </div>
              )}

              {loyaltyPoints !== null && loyaltyPoints > 0 && (
                <div className="p-2.5 bg-[#FAF8F4] border border-[#EAE4DA] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium flex items-center gap-1 text-[#292925]">
                      <Gift className="w-3.5 h-3.5 text-[#87947B]" />
                      Saldo Poin: {loyaltyPoints} Pts
                    </span>
                    <label className="flex items-center gap-1.5 font-medium text-[#87947B] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useLoyalty}
                        onChange={(e) => setUseLoyalty(e.target.checked)}
                        className="rounded text-[#87947B] focus:ring-0"
                      />
                      <span>Tukar Diskon</span>
                    </label>
                  </div>
                  {useLoyalty && (
                    <p className="text-[10px] text-[#87947B]">
                      Hemat Rp {actualDiscount.toLocaleString("id-ID")} dari {redeemedPoints} poin yang ditukarkan.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block font-medium text-[#292925] mb-1">
                  Alamat Pengiriman <span className="text-[#87947B]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Alamat lengkap tujuan pengiriman"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full p-2 border border-[#EAE4DA] outline-none focus:border-[#292925] text-xs bg-[#FAF8F4]"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-medium text-[#292925] mb-1">
                  Metode Pembayaran <span className="text-[#87947B]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("QRIS")}
                    className={`p-2 border text-center transition cursor-pointer ${
                      paymentMethod === "QRIS"
                        ? "bg-[#292925] border-[#292925] text-[#FAF8F4]"
                        : "bg-white border-[#EAE4DA] text-[#292925] hover:bg-[#FAF8F4]"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span className="text-[10px] block">QRIS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("BANK_TRANSFER")}
                    className={`p-2 border text-center transition cursor-pointer ${
                      paymentMethod === "BANK_TRANSFER"
                        ? "bg-[#292925] border-[#292925] text-[#FAF8F4]"
                        : "bg-white border-[#EAE4DA] text-[#292925] hover:bg-[#FAF8F4]"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span className="text-[10px] block">Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("E_WALLET")}
                    className={`p-2 border text-center transition cursor-pointer ${
                      paymentMethod === "E_WALLET"
                        ? "bg-[#292925] border-[#292925] text-[#FAF8F4]"
                        : "bg-white border-[#EAE4DA] text-[#292925] hover:bg-[#FAF8F4]"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span className="text-[10px] block">E-Wallet</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={orderSubmitting}
                className="w-full py-3 bg-[#292925] hover:bg-[#87947B] text-[#FAF8F4] font-medium text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {orderSubmitting ? (
                  <span>Memproses Pesanan...</span>
                ) : (
                  <>
                    <span>Selesaikan Pesanan ({totalCartItems})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
