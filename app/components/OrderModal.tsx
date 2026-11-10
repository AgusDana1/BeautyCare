"use client";

import {
  X,
  Droplets,
  ShoppingCart,
  QrCode,
  CreditCard,
  Smartphone,
  ArrowRight,
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
  onSubmitOrder: (e: React.FormEvent) => void;
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
  if (!product) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const totalPrice = currentPrice * quantity;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto animate-fade-in-up">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-4 sm:p-7 max-h-[94vh] overflow-y-auto relative">
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

        <form onSubmit={onSubmitOrder} className="mt-3 sm:mt-5 space-y-3 sm:space-y-5 text-[11px] sm:text-xs">
          {/* Product Preview Card */}
          <div className="flex items-center gap-2.5 sm:gap-4 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-stone-50 border border-stone-200/80">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover border border-stone-200 shrink-0"
              />
            )}
            <div className="min-w-0">
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                {product.name}
              </h4>
              <span className="text-stone-500 block text-[10px] sm:text-[11px] truncate">
                {product.category.name}
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                <span className="font-mono font-bold text-rose-600 text-xs sm:text-sm">
                  Rp {currentPrice.toLocaleString("id-ID")}
                </span>
                <span className="text-[9px] sm:text-[11px] text-stone-400">
                  (Stok: {currentStock})
                </span>
              </div>
            </div>
          </div>

          {/* FILTER PER ML JIKA PRODUK MEMILIKI VARIAN ML */}
          {product.hasVariants && product.variants.length > 0 && (
            <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-800 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs">
                  <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600" />
                  <span>Pilih Ukuran (ml):</span>
                </label>
                <span className="text-[10px] sm:text-[11px] text-rose-700 font-semibold">
                  {selectedVariant?.size} terpilih
                </span>
              </div>

              {/* Interactive ML Variant Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 pt-0.5">
                {product.variants.map((v) => {
                  const isChosen = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onSelectVariant(v)}
                      className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-left border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                        isChosen
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs sm:shadow-md shadow-rose-600/25"
                          : "bg-white text-stone-700 border-stone-200 hover:border-rose-300"
                      }`}
                    >
                      <div className="font-bold text-[11px] sm:text-xs">{v.size}</div>
                      <div
                        className={`font-mono text-[9px] sm:text-[11px] ${
                          isChosen ? "text-rose-100" : "text-stone-500"
                        }`}
                      >
                        Rp {v.price.toLocaleString("id-ID")}
                      </div>
                      <div
                        className={`text-[8px] sm:text-[10px] mt-0.5 ${
                          isChosen ? "text-rose-200" : "text-stone-400"
                        }`}
                      >
                        Stok: {v.stock}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between py-0.5 sm:py-1">
            <span className="font-semibold text-stone-700 text-[11px] sm:text-xs">Jumlah Pesanan:</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition cursor-pointer text-xs"
                aria-label="Kurangi jumlah"
              >
                -
              </button>
              <span className="w-6 sm:w-8 text-center font-bold text-xs sm:text-sm font-mono">{quantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(Math.min(currentStock, quantity + 1))}
                disabled={quantity >= currentStock}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center justify-center transition cursor-pointer disabled:opacity-40 text-xs"
                aria-label="Tambah jumlah"
              >
                +
              </button>
            </div>
          </div>

          {/* Customer Inputs */}
          <div className="space-y-2 sm:space-y-3 pt-0.5">
            <div>
              <label className="block font-semibold text-stone-700 mb-0.5 sm:mb-1 text-[10px] sm:text-xs">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Rina Melati"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 text-[11px] sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-0.5 sm:mb-1 text-[10px] sm:text-xs">
                  No. WhatsApp / HP <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
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
                Total Pembayaran
              </span>
              <span className="text-sm sm:text-lg font-black text-rose-600 font-mono">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
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
