"use client";

import { useState, useEffect } from "react";
import {
  X,
  Droplets,
  ShoppingCart,
  QrCode,
  CreditCard,
  Smartphone,
  ArrowRight,
  Gift,
} from "lucide-react";
import { Product, Variant, PaymentMethod } from "../types/storefront";

interface OrderModalProps {
  product: Product | null;
  selectedVariant: Variant | null;
  onSelectVariant: (v: Variant) => void;
  quantity: number;
  onUpdateQuantity: (qty: number) => void;
  onClose: () => void;
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
  notes: string;
  setNotes: (val: string) => void;
  orderSubmitting: boolean;
  orderError: string;
  onSubmitOrder: (e: React.FormEvent, redeemPoints?: number) => void;
  onAddToCart: () => void;
}

export default function OrderModal({
  product,
  selectedVariant,
  onSelectVariant,
  quantity,
  onUpdateQuantity,
  onClose,
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
  notes,
  setNotes,
  orderSubmitting,
  orderError,
  onSubmitOrder,
  onAddToCart,
}: OrderModalProps) {
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

  // Close on Escape key
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  if (!product) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const rawTotalPrice = currentPrice * quantity;

  // Loyalty calculations
  const maxDiscount = Math.floor(rawTotalPrice * 0.5);
  const requestedDiscount = (loyaltyPoints || 0) * 100;
  const actualDiscount = useLoyalty
    ? Math.min(requestedDiscount, maxDiscount)
    : 0;
  const redeemedPoints = Math.floor(actualDiscount / 100);
  const finalPrice = Math.max(0, rawTotalPrice - actualDiscount);
  const pointsEarned = Math.floor(finalPrice / 1000);

  const handleSubmit = (e: React.FormEvent) => {
    onSubmitOrder(e, useLoyalty ? redeemedPoints : 0);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto animate-fade-in cursor-pointer"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-4 sm:p-7 max-h-[94vh] overflow-y-auto relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-5 right-3 sm:right-5 text-stone-400 hover:text-stone-700 p-1 sm:p-1.5 rounded-full hover:bg-stone-100 transition cursor-pointer"
          aria-label="Tutup Formulir"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header */}
        <div className="pb-2.5 sm:pb-4 border-b border-stone-100 pr-7 sm:pr-8">
          <span className="text-[9px] sm:text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            Formulir Pemesanan
          </span>
          <h3 className="text-sm sm:text-lg font-extrabold text-stone-900 mt-0.5 truncate">
            Pesan {product.name}
          </h3>
        </div>

        {orderError && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-red-50 border border-red-200 text-red-700 text-[10px] sm:text-xs">
            {orderError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 sm:mt-5 space-y-3 sm:space-y-5 text-[11px] sm:text-xs">
          {/* Product Preview Card */}
          <div className="flex items-center gap-2.5 sm:gap-4 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-stone-50 border border-stone-200/80">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover border border-stone-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                {product.name}
              </h4>
              <p className="text-[10px] sm:text-xs text-stone-500 font-mono font-bold mt-0.5 text-rose-600">
                Rp {currentPrice.toLocaleString("id-ID")}
              </p>
              <span className="text-[9px] sm:text-[11px] text-stone-400">
                Stok tersedia: {currentStock}
              </span>
            </div>
          </div>

          {/* Size Variant Selector */}
          {product.hasVariants && product.variants.length > 0 && (
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5 sm:mb-2 text-[10px] sm:text-xs">
                Pilih Ukuran Kemasan:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onSelectVariant(v)}
                      className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-rose-50 border-rose-500 text-rose-900 shadow-xs ring-1 ring-rose-500/30"
                          : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Droplets
                          className={`w-3 h-3 ${
                            isSelected ? "text-rose-600" : "text-stone-400"
                          }`}
                        />
                        <span className="font-bold text-[11px] sm:text-xs">{v.size}</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-mono font-bold block mt-0.5">
                        Rp {v.price.toLocaleString("id-ID")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-stone-200 bg-stone-50/50">
            <span className="font-semibold text-stone-700 text-[10px] sm:text-xs">
              Jumlah Produk
            </span>
            <div className="flex items-center border border-stone-300 rounded-lg sm:rounded-xl bg-white overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="px-2.5 sm:px-3 py-1 text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer text-xs sm:text-sm font-bold"
              >
                -
              </button>
              <span className="px-3 sm:px-4 py-1 font-bold text-xs sm:text-sm font-mono text-stone-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(Math.min(currentStock, quantity + 1))}
                disabled={quantity >= currentStock}
                className="px-2.5 sm:px-3 py-1 text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer text-xs sm:text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="space-y-2 sm:space-y-3 pt-1">
            <div>
              <label className="block font-semibold text-stone-700 mb-0.5 sm:mb-1 text-[10px] sm:text-xs">
                Nama Penerima <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Rina Wijaya"
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
                  placeholder="rina@example.com (opsional)"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 text-[11px] sm:text-sm"
                />
              </div>
            </div>

            {/* LOYALTY POINTS REDEMPTION IN ORDER MODAL */}
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
                    Poin Loyalty: {loyaltyPoints} Pts
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
                placeholder="Jalan, No. Rumah, RT/RW, Kota & Kode Pos"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 text-[11px] sm:text-sm"
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-[10px] sm:text-xs">
                Metode Pembayaran <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("QRIS")}
                  className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                    paymentMethod === "QRIS"
                      ? "bg-purple-50 border-purple-500 text-purple-800 font-bold shadow-xs"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  <span className="text-[9px] sm:text-[11px]">QRIS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("BANK_TRANSFER")}
                  className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                    paymentMethod === "BANK_TRANSFER"
                      ? "bg-blue-50 border-blue-500 text-blue-800 font-bold shadow-xs"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="text-[9px] sm:text-[11px]">Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("E_WALLET")}
                  className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                    paymentMethod === "E_WALLET"
                      ? "bg-rose-50 border-rose-500 text-rose-800 font-bold shadow-xs"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                  <span className="text-[9px] sm:text-[11px]">E-Wallet</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-0.5 sm:mb-1 text-[10px] sm:text-xs">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Titipkan di satpam jika tidak ada orang"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-stone-200 text-[11px] sm:text-sm"
              />
            </div>
          </div>

          {/* Total Summary & Action Buttons */}
          <div className="pt-2.5 sm:pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
            <div>
              <span className="text-[9px] sm:text-[11px] text-stone-400 block font-medium">
                Total Pembayaran {actualDiscount > 0 && `(Hemat -Rp ${actualDiscount.toLocaleString("id-ID")})`}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-sm sm:text-lg font-black text-rose-600 font-mono">
                  Rp {finalPrice.toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                  +{pointsEarned} Poin
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onAddToCart}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] sm:text-xs transition cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
                <span>+ Keranjang</span>
              </button>

              <button
                type="submit"
                disabled={orderSubmitting || currentStock === 0}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-[11px] sm:text-sm shadow-md sm:shadow-lg shadow-rose-600/30 hover:scale-105 transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
              >
                {orderSubmitting ? (
                  <>
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Bayar Langsung</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
