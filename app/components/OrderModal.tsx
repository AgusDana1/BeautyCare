"use client";

import { useState, useEffect } from "react";
import {
  X,
  Droplets,
  ShoppingBag,
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
      className="fixed inset-0 z-[80] bg-[#292925]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in cursor-pointer font-sans"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white border border-[#EAE4DA] shadow-2xl max-w-lg w-full p-5 sm:p-8 max-h-[94vh] overflow-y-auto relative cursor-default rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#292925]/50 hover:text-[#292925] p-1 transition cursor-pointer"
          aria-label="Tutup Formulir"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pb-3 border-b border-[#EAE4DA] pr-8 space-y-0.5">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#87947B] block font-sans">
            Pemesanan Instan
          </span>
          <h3 className="font-serif text-lg sm:text-xl text-[#292925] truncate">
            {product.name}
          </h3>
        </div>

        {orderError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {orderError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs font-sans">
          {/* Product Preview Card */}
          <div className="flex items-center gap-3 p-3 bg-[#FAF8F4] border border-[#EAE4DA] rounded-sm">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-14 h-14 object-cover border border-[#EAE4DA] shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-xs sm:text-sm text-[#292925] truncate">
                {product.name}
              </h4>
              <p className="font-serif font-bold text-sm text-[#292925] mt-0.5">
                Rp {currentPrice.toLocaleString("id-ID")}
              </p>
              <span className="text-[10px] text-[#87947B] font-mono">
                Stok siap kirim: {currentStock}
              </span>
            </div>
          </div>

          {/* Size Variant Selector */}
          {product.hasVariants && product.variants.length > 0 && (
            <div className="space-y-1.5">
              <label className="block font-medium text-[#292925]">
                Pilih Ukuran Kemasan:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onSelectVariant(v)}
                      className={`p-2.5 border text-left transition cursor-pointer rounded-sm ${
                        isSelected
                          ? "bg-white border-[#292925] ring-1 ring-[#292925]"
                          : "bg-[#FAF8F4] border-[#EAE4DA] hover:border-[#87947B]"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Droplets
                          className={`w-3 h-3 ${
                            isSelected ? "text-[#87947B]" : "text-[#292925]/40"
                          }`}
                        />
                        <span className="font-mono font-bold text-xs text-[#292925]">{v.size}</span>
                      </div>
                      <span className="text-[11px] font-serif font-bold text-[#292925] block mt-1">
                        Rp {v.price.toLocaleString("id-ID")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-3 border border-[#EAE4DA] bg-[#FAF8F4] rounded-sm">
            <span className="font-medium text-[#292925]">
              Jumlah Botol:
            </span>
            <div className="flex items-center border border-[#EAE4DA] bg-white">
              <button
                type="button"
                onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="px-3 py-1 text-[#292925] hover:bg-[#EAE4DA]/50 disabled:opacity-30 cursor-pointer font-bold text-xs"
              >
                -
              </button>
              <span className="px-3 py-1 font-mono font-medium text-xs text-[#292925]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(Math.min(currentStock, quantity + 1))}
                disabled={quantity >= currentStock}
                className="px-3 py-1 text-[#292925] hover:bg-[#EAE4DA]/50 disabled:opacity-30 cursor-pointer font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="space-y-3 pt-1">
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
                className="w-full p-2.5 border border-[#EAE4DA] outline-none focus:border-[#292925] text-xs bg-[#FAF8F4]"
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
                  className="w-full p-2.5 border border-[#EAE4DA] outline-none focus:border-[#292925] text-xs bg-[#FAF8F4]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#292925] mb-1">Email</label>
                <input
                  type="email"
                  placeholder="opsional"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2.5 border border-[#EAE4DA] outline-none focus:border-[#292925] text-xs bg-[#FAF8F4]"
                />
              </div>
            </div>

            {/* LOYALTY POINTS REDEMPTION */}
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
                    Poin Loyalty: {loyaltyPoints} Pts
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
                placeholder="Alamat lengkap penerima pesanan"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full p-2.5 border border-[#EAE4DA] outline-none focus:border-[#292925] text-xs bg-[#FAF8F4]"
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

            <div>
              <label className="block font-medium text-[#292925] mb-1">
                Catatan Pengiriman (Opsional)
              </label>
              <input
                type="text"
                placeholder="Instruksi kurir atau penyerahan paket..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 border border-[#EAE4DA] outline-none focus:border-[#292925] text-xs bg-[#FAF8F4]"
              />
            </div>
          </div>

          {/* Total Summary & Action Buttons */}
          <div className="pt-3 border-t border-[#EAE4DA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-[#292925]/60 block">
                Total Tagihan {actualDiscount > 0 && `(Hemat -Rp ${actualDiscount.toLocaleString("id-ID")})`}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-lg font-bold text-[#292925]">
                  Rp {finalPrice.toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-[#87947B] font-mono">
                  +{pointsEarned} Pts
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAddToCart}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-[#292925] text-[#292925] hover:bg-[#EAE4DA]/40 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+ Kantong</span>
              </button>

              <button
                type="submit"
                disabled={orderSubmitting || currentStock === 0}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-[#292925] hover:bg-[#87947B] text-[#FAF8F4] text-xs font-medium uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {orderSubmitting ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <span>Bayar Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
