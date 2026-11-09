"use client";

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
  onSubmitOrder: (e: React.FormEvent) => void;
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full sm:max-w-md h-full shadow-2xl flex flex-col justify-between animate-fade-in-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-rose-600" />
            <h3 className="font-extrabold text-base text-stone-900">
              Keranjang Belanja ({totalCartItems})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
            aria-label="Tutup Keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-stone-400 space-y-3">
              <ShoppingCart className="w-12 h-12 mx-auto text-stone-300 stroke-[1.5]" />
              <p className="text-xs">Keranjang belanja Anda masih kosong.</p>
              <button
                onClick={onClose}
                className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Mulai Belanja Produk →
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.productId}-${item.variantId || "base"}`}
                className="p-3 rounded-2xl border border-stone-200/80 bg-stone-50/50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-stone-200 flex items-center justify-center font-bold text-stone-400 text-xs shrink-0">
                      BC
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-stone-900 truncate">
                      {item.productName}
                    </h4>
                    {item.selectedSize && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200/50">
                        {item.selectedSize}
                      </span>
                    )}
                    <div className="text-xs font-mono font-bold text-rose-600 mt-1">
                      Rp {item.price.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => onRemoveItem(idx)}
                    className="text-stone-300 hover:text-red-500 transition p-1 cursor-pointer"
                    title="Hapus"
                    aria-label="Hapus barang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5">
                    <button
                      onClick={() => onUpdateQty(idx, item.quantity - 1)}
                      className="w-5 h-5 rounded hover:bg-stone-100 text-stone-600 flex items-center justify-center font-bold text-xs cursor-pointer"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(idx, item.quantity + 1)}
                      className="w-5 h-5 rounded hover:bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs cursor-pointer"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer & Checkout Form */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-100 bg-white space-y-3.5 max-h-[55vh] overflow-y-auto">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal:</span>
                <span className="font-mono">Rp {totalCartPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Ongkos Kirim:</span>
                <span className="font-bold text-emerald-600">GRATIS</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-1 border-t border-stone-100">
                <span>Total Pembayaran:</span>
                <span className="font-mono text-rose-600 text-base">
                  Rp {totalCartPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {orderError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {orderError}
              </div>
            )}

            {/* Direct Checkout Form inside Cart Drawer */}
            <form onSubmit={onSubmitOrder} className="space-y-3 pt-1 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Lengkap Penerima <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rina Melati"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    No. WA / HP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="opsional"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Alamat Pengiriman <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jalan, No. Rumah, RT/RW, Kota, Kode Pos"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm"
                />
              </div>

              {/* Payment Method Selector in Cart */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Metode Pembayaran <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("QRIS")}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === "QRIS"
                        ? "bg-purple-50 border-purple-500 text-purple-800 font-bold"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <QrCode className="w-4 h-4 mx-auto mb-0.5 text-purple-600" />
                    <span className="text-[10px] block">QRIS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("BANK_TRANSFER")}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === "BANK_TRANSFER"
                        ? "bg-blue-50 border-blue-500 text-blue-800 font-bold"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-0.5 text-blue-600" />
                    <span className="text-[10px] block">Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("E_WALLET")}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === "E_WALLET"
                        ? "bg-rose-50 border-rose-500 text-rose-800 font-bold"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-0.5 text-rose-600" />
                    <span className="text-[10px] block">E-Wallet</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={orderSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-98 transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {orderSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <>
                    <span>Checkout &amp; Bayar ({totalCartItems} Barang)</span>
                    <ArrowRight className="w-4 h-4" />
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
