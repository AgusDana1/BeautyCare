"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  QrCode,
  CreditCard,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

interface OrderItem {
  id: number;
  selectedSize: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    name: string;
    image: string | null;
  };
}

interface OrderData {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  paymentChannel: string | null;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  notes: string | null;
  createdAt: string | Date;
  items: OrderItem[];
}

export default function OrderConfirmationClient({
  order,
  initialQrDataUrl,
}: {
  order: OrderData;
  initialQrDataUrl: string;
}) {
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: "invoice" | "bank", bankKey = "") => {
    navigator.clipboard.writeText(text);
    if (type === "invoice") {
      setCopiedInvoice(true);
      setTimeout(() => setCopiedInvoice(false), 2000);
    } else {
      setCopiedBank(bankKey);
      setTimeout(() => setCopiedBank(null), 2000);
    }
  };

  const banks = [
    { name: "Bank BCA", no: "8830 1928 34", holder: "PT BeautyCare Indonesia" },
    { name: "Bank Mandiri", no: "137 00 1234 5678", holder: "PT BeautyCare Indonesia" },
    { name: "Bank BNI", no: "0987 654 321", holder: "PT BeautyCare Indonesia" },
    { name: "Bank BRI", no: "0341 01 000123 30 5", holder: "PT BeautyCare Indonesia" },
  ];

  const ewallets = [
    { name: "GoPay", no: "0812 3456 7890", holder: "BeautyCare Official" },
    { name: "OVO", no: "0812 3456 7890", holder: "BeautyCare Official" },
    { name: "DANA", no: "0812 3456 7890", holder: "BeautyCare Official" },
    { name: "ShopeePay", no: "0812 3456 7890", holder: "BeautyCare Official" },
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-rose-600 bg-white px-3.5 py-2 rounded-xl border border-stone-200/80 shadow-2xs transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog</span>
          </Link>

          <Link
            href={`/admin/orders/${order.id}/invoice`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl shadow-md transition-all duration-200 hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh Invoice</span>
          </Link>
        </div>

        {/* Status Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs text-center relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-100/50 rounded-full blur-3xl -z-10" />

          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-sm animate-bounce-short">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/60 inline-block mb-2">
            Pesanan Berhasil Dibuat
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Terima Kasih, {order.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
            Pesanan Anda telah tercatat di sistem BeautyCare. Silakan selesaikan pembayaran untuk mempercepat pengiriman.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 bg-stone-50 px-4 py-2.5 rounded-2xl border border-stone-200 text-xs">
            <span className="text-stone-400">Nomor Faktur:</span>
            <span className="font-mono font-bold text-stone-900">{order.invoiceNumber}</span>
            <button
              onClick={() => copyToClipboard(order.invoiceNumber, "invoice")}
              className="text-stone-400 hover:text-stone-700 transition cursor-pointer"
              title="Salin No Faktur"
            >
              {copiedInvoice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* PAYMENT METHOD SECTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6 animate-fade-in-up">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            {order.paymentMethod === "QRIS" && (
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
            )}
            {order.paymentMethod === "BANK_TRANSFER" && (
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            )}
            {order.paymentMethod === "E_WALLET" && (
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Instruksi Pembayaran via {order.paymentMethod}
              </h2>
              <p className="text-xs text-stone-400">
                Total yang harus dibayar:{" "}
                <span className="font-mono font-bold text-rose-600 text-sm">
                  Rp {order.totalAmount.toLocaleString("id-ID")}
                </span>
              </p>
            </div>
          </div>

          {/* 1. QRIS Payment Method */}
          {order.paymentMethod === "QRIS" && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-block p-4 rounded-3xl bg-white border-2 border-stone-900 shadow-xl relative group">
                <div className="text-[10px] font-black tracking-widest text-stone-900 uppercase mb-2 border-b border-stone-100 pb-1">
                  QRIS STANDAR PEMBAYARAN NASIONAL
                </div>
                {initialQrDataUrl ? (
                  <img
                    src={initialQrDataUrl}
                    alt="Scan Barcode QRIS"
                    className="w-64 h-64 sm:w-72 sm:h-72 object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-64 h-64 bg-stone-100 flex items-center justify-center text-xs text-stone-400">
                    Membuat Barcode QRIS...
                  </div>
                )}
                <div className="text-[11px] font-bold text-rose-600 font-mono mt-2">
                  NMID: ID10202611090123
                </div>
              </div>

              <div className="max-w-md text-xs text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cara Pembayaran Scan QRIS:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-stone-500">
                  <li>Buka aplikasi m-Banking atau E-Wallet (BCA Mobile, Livin Mandiri, GoPay, OVO, DANA, ShopeePay, dll).</li>
                  <li>Pilih menu <strong>&quot;Scan QRIS&quot;</strong> lalu arahkan kamera ke barcode di atas.</li>
                  <li>Pastikan nama penerima adalah <strong>BEAUTYCARE STORE</strong>.</li>
                  <li>Masukkan atau konfirmasi nominal <strong>Rp {order.totalAmount.toLocaleString("id-ID")}</strong>.</li>
                  <li>Selesaikan pembayaran dan simpan bukti transfer.</li>
                </ol>
              </div>
            </div>
          )}

          {/* 2. Bank Transfer Payment Method */}
          {order.paymentMethod === "BANK_TRANSFER" && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">
                Silakan lakukan transfer ke salah satu rekening bank resmi BeautyCare berikut:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {banks.map((bank, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-stone-900">{bank.name}</span>
                        <span className="text-[10px] text-stone-400 uppercase font-semibold">
                          Online 24 Jam
                        </span>
                      </div>
                      <div className="font-mono text-base font-bold text-stone-800 tracking-wider my-1">
                        {bank.no}
                      </div>
                      <span className="text-[11px] text-stone-500 block">a.n {bank.holder}</span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(bank.no.replace(/\s/g, ""), "bank", bank.name)}
                      className="mt-3 w-full py-1.5 px-3 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-all duration-150 hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedBank === bank.name ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-stone-400" />
                          <span>Salin No. Rekening</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. E-Wallet Payment Method */}
          {order.paymentMethod === "E_WALLET" && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">
                Pilih aplikasi e-wallet Anda dan lakukan transfer langsung ke nomor tujuan berikut:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ewallets.map((wallet, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 transition flex flex-col justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">{wallet.name}</span>
                      <div className="font-mono text-base font-bold text-stone-800 tracking-wider my-1">
                        {wallet.no}
                      </div>
                      <span className="text-[11px] text-stone-500 block">a.n {wallet.holder}</span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(wallet.no.replace(/\s/g, ""), "bank", wallet.name)}
                      className="mt-3 w-full py-1.5 px-3 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-all duration-150 hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedBank === wallet.name ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-stone-400" />
                          <span>Salin No. HP</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ORDER ITEMS & SUMMARY */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4 animate-fade-in-up">
          <h2 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
            Rincian Produk Pesanan
          </h2>

          <div className="divide-y divide-stone-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                    />
                  )}
                  <div>
                    <h3 className="text-xs font-bold text-stone-900">{item.product.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.selectedSize && (
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200/50">
                          Ukuran: {item.selectedSize}
                        </span>
                      )}
                      <span className="text-stone-400 text-xs">x {item.quantity} pcs</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-xs text-stone-900">
                  Rp {item.subtotal.toLocaleString("id-ID")}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-100 space-y-2 text-xs">
            <div className="flex justify-between text-stone-500">
              <span>Subtotal:</span>
              <span className="font-mono">Rp {order.totalAmount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>Ongkos Kirim:</span>
              <span className="text-emerald-600 font-bold">GRATIS</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-stone-100 text-sm font-bold text-stone-900">
              <span>Total Pembayaran:</span>
              <span className="font-mono text-lg text-rose-600">
                Rp {order.totalAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping details */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs text-xs space-y-2 animate-fade-in-up">
          <h3 className="font-bold text-stone-900 text-sm">Alamat Pengiriman</h3>
          <p className="font-medium text-stone-800">{order.customerName} ({order.customerPhone})</p>
          <p className="text-stone-500 whitespace-pre-line">{order.customerAddress}</p>
        </div>
      </div>
    </div>
  );
}
