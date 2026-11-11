"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, CheckCircle2, Clock, Sparkles } from "lucide-react";

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
  pointsEarned?: number;
  pointsRedeemed?: number;
  discountAmount?: number;
  notes: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  items: OrderItem[];
}

export default function InvoiceClientView({ order }: { order: OrderData }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    // Generate QR verification data url
    fetch(`/api/qris?invoice=${order.invoiceNumber}&amount=${order.totalAmount}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.qrDataUrl) setQrDataUrl(data.qrDataUrl);
      })
      .catch((err) => console.error("Error loading QR:", err));
  }, [order.invoiceNumber, order.totalAmount]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top action bar - Hidden during print */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 bg-white px-4 py-2 rounded-xl shadow-sm border border-stone-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard Admin
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Cetak Invoice Sekarang
        </button>
      </div>

      {/* Invoice Sheet */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-stone-200 p-8 sm:p-12 print:p-0 print:shadow-none print:border-none print:rounded-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-stone-200 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-stone-900">
                BeautyCare<span className="text-rose-600">.</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Klinik & Toko Produk Perawatan Kulit Premium
            </p>
            <p className="text-xs text-stone-500">
              Jl. Bukit Tunggal Gg Belawa No. 9, Denpasar Barat | Telp: (0361) 4848-23
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-rose-50 text-rose-700 border border-rose-200 mb-2">
              FAKTUR PENJUALAN RESMI
            </span>
            <h2 className="text-xl font-mono font-bold text-stone-900">
              {order.invoiceNumber}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Tanggal: {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Customer & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-stone-200">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Informasi Pelanggan (Customer)
            </h3>
            <p className="text-base font-bold text-stone-900">{order.customerName}</p>
            <p className="text-sm text-stone-600 mt-0.5">Telepon/WA: {order.customerPhone}</p>
            {order.customerEmail && (
              <p className="text-sm text-stone-600">Email: {order.customerEmail}</p>
            )}
            <div className="mt-2 text-sm text-stone-600">
              <span className="font-medium text-stone-700">Alamat Pengiriman:</span>
              <p className="whitespace-pre-line mt-0.5">{order.customerAddress}</p>
            </div>
          </div>

          <div className="md:border-l md:border-stone-100 md:pl-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Detail Pembayaran & Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Metode Pembayaran:</span>
                <span className="font-semibold text-stone-800">
                  {order.paymentMethod} {order.paymentChannel ? `(${order.paymentChannel})` : ""}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Status Pembayaran:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    order.paymentStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {order.paymentStatus === "PAID" ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> LUNAS
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" /> MENUNGGU PEMBAYARAN
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Status Pesanan:</span>
                <span className="font-semibold text-stone-800 uppercase text-xs px-2.5 py-0.5 bg-stone-100 rounded-md">
                  {order.orderStatus}
                </span>
              </div>
              {order.notes && (
                <div className="pt-2 text-xs text-stone-500 italic">
                  Catatan: {order.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-8 border-b border-stone-200">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-200 text-xs font-bold uppercase text-stone-500">
                <th className="pb-3 w-12">No</th>
                <th className="pb-3">Item Produk</th>
                <th className="pb-3 text-center">Ukuran / Varian</th>
                <th className="pb-3 text-right">Harga Satuan</th>
                <th className="pb-3 text-center">Jumlah</th>
                <th className="pb-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {order.items.map((item, idx) => (
                <tr key={item.id} className="py-3">
                  <td className="py-3 text-stone-400 font-mono text-xs">{idx + 1}</td>
                  <td className="py-3">
                    <span className="font-medium text-stone-900">{item.product.name}</span>
                  </td>
                  <td className="py-3 text-center">
                    {item.selectedSize ? (
                      <span className="inline-block px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded">
                        {item.selectedSize}
                      </span>
                    ) : (
                      <span className="text-stone-400 text-xs">Standar</span>
                    )}
                  </td>
                  <td className="py-3 text-right font-mono text-stone-600">
                    Rp {item.price.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 text-center font-semibold text-stone-800">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right font-mono font-semibold text-stone-900">
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total calculation & QR code */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-start gap-8">
          <div className="flex items-center gap-4">
            {qrDataUrl && (
              <div className="p-2 border border-stone-200 rounded-xl bg-white shadow-sm text-center">
                <img
                  src={qrDataUrl}
                  alt="QR Verifikasi Invoice"
                  className="w-24 h-24 object-contain mx-auto"
                />
                <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider block mt-1">
                  Scan Verifikasi
                </span>
              </div>
            )}
            <div className="text-xs text-stone-500 space-y-1">
              <p className="font-semibold text-stone-700">Ketentuan Toko BeautyCare:</p>
              <p>1. Simpan invoice ini sebagai bukti sah pembelian & garansi produk.</p>
              <p>2. Komplain produk wajib menyertakan video unboxing utuh.</p>
              <p>3. Untuk bantuan hubungi CS kami di 0812-3456-7890.</p>
            </div>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal Produk:</span>
              <span className="font-mono">
                Rp{" "}
                {(
                  order.items.reduce((sum, item) => sum + item.subtotal, 0) ||
                  order.totalAmount + (order.discountAmount || 0)
                ).toLocaleString("id-ID")}
              </span>
            </div>
            {order.discountAmount && order.discountAmount > 0 ? (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Diskon Loyalty Poin:</span>
                <span className="font-mono">- Rp {order.discountAmount.toLocaleString("id-ID")}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-stone-600">
              <span>Ongkos Kirim:</span>
              <span className="font-mono text-emerald-600 font-semibold">GRATIS</span>
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-stone-900">
              <span className="text-base font-bold">Total Pembayaran:</span>
              <span className="text-xl font-black font-mono text-rose-600">
                Rp {order.totalAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-12 pt-8 border-t border-stone-200 grid grid-cols-2 gap-8 text-center text-xs text-stone-500">
          <div>
            <p className="mb-14">Diterima oleh Customer,</p>
            <p className="font-bold text-stone-800 border-t border-stone-300 pt-1 inline-block min-w-[160px]">
              ( {order.customerName} )
            </p>
          </div>
          <div>
            <p className="mb-14">Hormat Kami, BeautyCare Admin,</p>
            <p className="font-bold text-stone-800 border-t border-stone-300 pt-1 inline-block min-w-[160px]">
              ( Bagian Operasional & Kasir )
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
