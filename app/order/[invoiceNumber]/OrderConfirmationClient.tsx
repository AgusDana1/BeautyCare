"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
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
  discountAmount?: number;
  pointsEarned?: number;
  pointsRedeemed?: number;
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
    { name: "GoPay", no: "0881 0383 22937", holder: "BeautyCare Atelier" },
    { name: "OVO", no: "0881 0383 22937", holder: "BeautyCare Atelier" },
    { name: "DANA", no: "0881 0383 22937", holder: "BeautyCare Atelier" },
    { name: "ShopeePay", no: "0881 0383 22937", holder: "BeautyCare Atelier" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#292925] font-sans py-8 sm:py-14 px-4 sm:px-6 lg:px-8 selection:bg-[#87947B]/20">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#292925] hover:text-[#87947B] bg-white px-4 py-2 border border-[#EAE4DA] shadow-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#87947B]" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#87947B]">
            Official Digital Invoice
          </span>
        </div>

        {/* Status Banner */}
        <div className="bg-white p-6 sm:p-10 border border-[#EAE4DA] text-center rounded-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#87947B]/15 text-[#87947B] mx-auto flex items-center justify-center mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#87947B] block font-sans">
            Pesanan Dikonfirmasi
          </span>

          <h1 className="font-serif text-2xl sm:text-4xl text-[#292925] tracking-tight">
            Terima Kasih, {order.customerName}
          </h1>

          <p className="text-xs sm:text-sm text-[#292925]/70 max-w-md mx-auto leading-relaxed font-sans">
            Pesanan formulasi Anda telah tercatat pada sistem BeautyCare. Silakan selesaikan pembayaran untuk otorisasi pengiriman.
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center gap-3 bg-[#FAF8F4] px-4 py-2 border border-[#EAE4DA] text-xs">
              <span className="text-[#292925]/60">Nomor Faktur:</span>
              <span className="font-mono font-bold text-[#292925]">{order.invoiceNumber}</span>
              <button
                onClick={() => copyToClipboard(order.invoiceNumber, "invoice")}
                className="text-[#292925]/50 hover:text-[#292925] transition cursor-pointer p-0.5"
                title="Salin No Faktur"
              >
                {copiedInvoice ? <Check className="w-3.5 h-3.5 text-[#87947B]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* PAYMENT METHOD SECTION */}
        <div className="bg-white p-5 sm:p-8 border border-[#EAE4DA] rounded-sm space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE4DA]">
            <div className="flex items-center gap-3">
              {order.paymentMethod === "QRIS" && (
                <div className="w-9 h-9 rounded-sm bg-[#FAF8F4] text-[#87947B] border border-[#EAE4DA] flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
              )}
              {order.paymentMethod === "BANK_TRANSFER" && (
                <div className="w-9 h-9 rounded-sm bg-[#FAF8F4] text-[#87947B] border border-[#EAE4DA] flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
              )}
              {order.paymentMethod === "E_WALLET" && (
                <div className="w-9 h-9 rounded-sm bg-[#FAF8F4] text-[#87947B] border border-[#EAE4DA] flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
              )}
              <div>
                <h2 className="font-serif text-base sm:text-lg text-[#292925]">
                  Pembayaran via {order.paymentMethod}
                </h2>
                <p className="text-[11px] text-[#292925]/60 font-sans">
                  Total tagihan resmi
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#292925]">
                Rp {order.totalAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* 1. QRIS Payment Method */}
          {order.paymentMethod === "QRIS" && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-white border border-[#292925] shadow-xs max-w-full">
                <div className="text-[10px] font-semibold tracking-[0.2em] text-[#292925] uppercase mb-2 border-b border-[#EAE4DA] pb-1 font-sans">
                  QRIS STANDAR NASIONAL
                </div>
                {initialQrDataUrl ? (
                  <img
                    src={initialQrDataUrl}
                    alt="Scan Barcode QRIS"
                    className="w-56 h-56 sm:w-72 sm:h-72 object-contain mx-auto"
                  />
                ) : (
                  <div className="w-56 h-56 sm:w-72 sm:h-72 bg-[#FAF8F4] flex items-center justify-center text-xs text-[#292925]/50 font-sans">
                    Membuat Barcode QRIS...
                  </div>
                )}
                <div className="text-[10px] text-[#87947B] font-mono mt-2">
                  NMID: ID10202611090123
                </div>
              </div>

              <div className="max-w-md w-full text-xs text-[#292925]/75 bg-[#FAF8F4] p-4 border border-[#EAE4DA] text-left space-y-2 font-sans">
                <div className="flex items-center gap-1.5 font-medium text-[#292925]">
                  <ShieldCheck className="w-4 h-4 text-[#87947B] shrink-0" />
                  <span>Petunjuk Pembayaran QRIS:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[#292925]/70 text-[11px]">
                  <li>Buka aplikasi m-Banking atau E-Wallet (BCA, Mandiri, GoPay, OVO, DANA, ShopeePay).</li>
                  <li>Pilih menu <strong>&quot;Scan QRIS&quot;</strong> dan arahkan kamera ke barcode di atas.</li>
                  <li>Pastikan nama merchant tertera <strong>BEAUTYCARE STORE</strong>.</li>
                  <li>Konfirmasi nominal pembayaran <strong>Rp {order.totalAmount.toLocaleString("id-ID")}</strong>.</li>
                  <li>Selesaikan otorisasi PIN dan simpan bukti transaksi.</li>
                </ol>
              </div>
            </div>
          )}

          {/* 2. Bank Transfer Payment Method */}
          {order.paymentMethod === "BANK_TRANSFER" && (
            <div className="space-y-4">
              <p className="text-xs text-[#292925]/70 font-sans">
                Transfer dana ke salah satu nomor rekening resmi BeautyCare berikut:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {banks.map((bank, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-[#EAE4DA] bg-[#FAF8F4] flex flex-col justify-between rounded-sm"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-xs text-[#292925]">{bank.name}</span>
                        <span className="text-[9px] text-[#87947B] font-mono uppercase">
                          Online 24 Jam
                        </span>
                      </div>
                      <div className="font-mono text-base font-bold text-[#292925] tracking-wider my-1">
                        {bank.no}
                      </div>
                      <span className="text-[11px] text-[#292925]/60 block font-sans">a.n {bank.holder}</span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(bank.no.replace(/\s/g, ""), "bank", bank.name)}
                      className="mt-3 w-full py-1.5 px-3 bg-white hover:bg-[#EAE4DA]/50 text-[#292925] text-xs font-medium border border-[#EAE4DA] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedBank === bank.name ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#87947B]" />
                          <span className="text-[#87947B]">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#292925]/50" />
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
              <p className="text-xs text-[#292925]/70 font-sans">
                Pilih aplikasi e-wallet Anda dan lakukan transfer ke nomor resmi berikut:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ewallets.map((wallet, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-[#EAE4DA] bg-[#FAF8F4] flex flex-col justify-between rounded-sm"
                  >
                    <div>
                      <span className="font-medium text-xs text-[#292925] block">{wallet.name}</span>
                      <div className="font-mono text-base font-bold text-[#292925] tracking-wider my-1">
                        {wallet.no}
                      </div>
                      <span className="text-[11px] text-[#292925]/60 block font-sans">a.n {wallet.holder}</span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(wallet.no.replace(/\s/g, ""), "bank", wallet.name)}
                      className="mt-3 w-full py-1.5 px-3 bg-white hover:bg-[#EAE4DA]/50 text-[#292925] text-xs font-medium border border-[#EAE4DA] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedBank === wallet.name ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#87947B]" />
                          <span className="text-[#87947B]">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#292925]/50" />
                          <span>Salin Nomor</span>
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
        <div className="bg-white p-6 sm:p-8 border border-[#EAE4DA] rounded-sm space-y-4 font-sans">
          <h2 className="font-serif text-base sm:text-lg text-[#292925] pb-3 border-b border-[#EAE4DA]">
            Rincian Formulasi Pesanan
          </h2>

          <div className="divide-y divide-[#EAE4DA]/60">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover border border-[#EAE4DA] shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="font-medium text-xs sm:text-sm text-[#292925] truncate">{item.product.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.selectedSize && (
                        <span className="text-[10px] font-mono bg-[#EAE4DA]/60 text-[#292925] px-1.5 py-0.2">
                          {item.selectedSize}
                        </span>
                      )}
                      <span className="text-[#292925]/50 text-xs font-mono">x{item.quantity}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-serif font-bold text-xs sm:text-sm text-[#292925] shrink-0">
                  Rp {item.subtotal.toLocaleString("id-ID")}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#EAE4DA] space-y-2 text-xs">
            <div className="flex justify-between text-[#292925]/70">
              <span>Subtotal Formulasi:</span>
              <span className="font-mono">
                Rp{" "}
                {(
                  order.items.reduce((sum, item) => sum + item.subtotal, 0) ||
                  order.totalAmount + (order.discountAmount || 0)
                ).toLocaleString("id-ID")}
              </span>
            </div>
            {order.discountAmount && order.discountAmount > 0 ? (
              <div className="flex justify-between text-[#87947B] font-medium">
                <span>Diskon Loyalty Poin:</span>
                <span className="font-mono">- Rp {order.discountAmount.toLocaleString("id-ID")}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-[#292925]/70">
              <span>Pengiriman Ekspedisi:</span>
              <span className="text-[#87947B] font-medium">BEBAS BIAYA</span>
            </div>
            {order.pointsEarned && order.pointsEarned > 0 ? (
              <div className="flex justify-between text-[#87947B] font-medium">
                <span>Poin Loyalty Diperoleh:</span>
                <span>+{order.pointsEarned} Poin</span>
              </div>
            ) : null}
            <div className="flex justify-between items-center pt-3 border-t border-[#EAE4DA] text-sm font-medium text-[#292925]">
              <span className="font-serif text-base">Total Akhir:</span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#292925]">
                Rp {order.totalAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping details */}
        <div className="bg-white p-6 border border-[#EAE4DA] rounded-sm text-xs space-y-1.5 font-sans">
          <h3 className="font-serif text-sm text-[#292925]">Tujuan Pengiriman</h3>
          <p className="font-medium text-[#292925]">{order.customerName} ({order.customerPhone})</p>
          <p className="text-[#292925]/70 whitespace-pre-line leading-relaxed">{order.customerAddress}</p>
        </div>
      </div>
    </div>
  );
}
