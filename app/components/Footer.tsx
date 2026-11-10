"use client";

import {
  Sparkles,
  MapPin,
  Phone,
  Clock,
  QrCode,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Category } from "../types/storefront";

interface FooterProps {
  categories: Category[];
  onSelectCategory: (categorySlug: string) => void;
}

export default function Footer({ categories, onSelectCategory }: FooterProps) {
  return (
    <footer className="bg-stone-900 text-stone-400 pt-8 sm:pt-16 pb-6 sm:pb-10 px-3 sm:px-6 lg:px-8 mt-auto border-t border-stone-800">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-12">
        {/* Main Footer Grid: 1 col on mobile, 2 col on tablet, 4 col on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {/* Col 1: Brand & Contact Info */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="font-black text-white text-base sm:text-lg tracking-tight">
                BeautyCare<span className="text-rose-500">.</span>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-400 leading-relaxed">
              Solusi perawatan kecantikan, skincare, dan estetika kulit premium dengan fleksibilitas
              varian ukuran (ml) lengkap untuk kebutuhan perawatan harian Anda.
            </p>
            <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs text-stone-400 pt-0.5 sm:pt-1">
              <div className="flex items-start gap-1.5 sm:gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Jl. Bukit Tunggal Gg Belawa No. 9, Denpasar Barat</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                <span>WhatsApp CS: 0881-0383-22937</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
                <span>Senin - Minggu: 08.00 - 21.00 WIB</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigasi Katalog */}
          <div className="space-y-2.5 sm:space-y-4">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white">
              Kategori Produk
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs">
              <li>
                <a
                  href="#katalog"
                  onClick={() => onSelectCategory("ALL")}
                  className="hover:text-rose-400 transition-colors inline-block"
                >
                  Semua Koleksi Perawatan
                </a>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <a
                    href="#katalog"
                    onClick={() => onSelectCategory(c.slug)}
                    className="hover:text-rose-400 transition-colors inline-block"
                  >
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Integrasi Metode Pembayaran (Payment Channels) */}
          <div className="space-y-2.5 sm:space-y-4">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white">
              Metode Pembayaran
            </h4>
            <p className="text-[11px] sm:text-xs text-stone-400">
              Pemesanan mendukung pembayaran instan &amp; faktur resmi otomatis:
            </p>

            <div className="space-y-2 sm:space-y-2.5">
              {/* QRIS */}
              <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="text-[10px] sm:text-[11px] min-w-0">
                  <span className="font-bold text-stone-200 block truncate">QRIS Standar Nasional</span>
                  <span className="text-stone-400 truncate block text-[9px] sm:text-[10px]">BCA, Gopay, OVO, Dana, ShopeePay</span>
                </div>
              </div>

              {/* Transfer Bank */}
              <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="text-[10px] sm:text-[11px] min-w-0">
                  <span className="font-bold text-stone-200 block truncate">Transfer Bank Resmi</span>
                  <span className="text-stone-400 truncate block text-[9px] sm:text-[10px]">BCA, Mandiri, BNI, BRI</span>
                </div>
              </div>

              {/* E-Wallet */}
              <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="text-[10px] sm:text-[11px] min-w-0">
                  <span className="font-bold text-stone-200 block truncate">Dompet Digital</span>
                  <span className="text-stone-400 truncate block text-[9px] sm:text-[10px]">GoPay, DANA, OVO, ShopeePay</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Jaminan Keamanan & Belanja */}
          <div className="space-y-2.5 sm:space-y-4">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white">
              Jaminan Belanja
            </h4>
            <div className="space-y-2 sm:space-y-3 text-[11px] sm:text-xs">
              <div className="flex items-start gap-2 sm:gap-2.5">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-200 block">100% Asli &amp; BPOM</span>
                  <span className="text-[10px] sm:text-[11px] text-stone-400">Produk terdaftar resmi dan aman.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-2.5">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-200 block">Gratis Pengiriman</span>
                  <span className="text-[10px] sm:text-[11px] text-stone-400">Pengemasan bubble wrap aman.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-2.5">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-200 block">Faktur Resmi Tersedia</span>
                  <span className="text-[10px] sm:text-[11px] text-stone-400">Invoice dapat langsung dicetak.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-5 sm:pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-[10px] sm:text-xs text-stone-500">
          <p className="text-center sm:text-left">
            © 2026 BeautyCare Indonesia. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-[11px] text-center">
            <a href="#faq" className="hover:text-stone-300 transition-colors">FAQ &amp; Bantuan</a>
            <span className="hover:text-stone-300 transition-colors">Kebijakan Privasi</span>
            <span className="hover:text-stone-300 transition-colors">Syarat &amp; Ketentuan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
