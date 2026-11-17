"use client";

import {
  MapPin,
  Phone,
  Clock,
  QrCode,
  CreditCard,
  ShieldCheck,
  Truck,
  Leaf,
  FileCheck,
} from "lucide-react";
import { Category } from "../types/storefront";

interface FooterProps {
  categories?: Category[];
  onSelectCategory?: (categorySlug: string) => void;
}

export default function Footer({
  categories = [],
  onSelectCategory = () => {},
}: FooterProps) {
  return (
    <footer className="bg-[#21211E] text-[#FAF8F4]/70 pt-16 sm:pt-20 pb-10 px-4 sm:px-6 lg:px-8 border-t border-[#33332D]">
      <div className="max-w-7xl mx-auto space-y-14">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Col 1: Brand Ethos & Atelier Contact */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="font-serif text-xl sm:text-2xl tracking-[0.18em] text-[#FAF8F4] block">
                BEAUTYCARE
              </span>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#87947B]">
                Formulary &amp; Skin Research
              </p>
            </div>
            
            <p className="text-xs text-[#FAF8F4]/70 leading-relaxed font-sans">
              Formulasi perawatan esensial yang dikembangkan untuk memperkuat pelindung alami kulit di iklim tropis melalui sinergi botanical extracts dan active science.
            </p>

            <div className="space-y-2.5 text-xs text-[#FAF8F4]/60 pt-2 font-sans">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#87947B] shrink-0 mt-0.5" />
                <span>Jl. Bukit Tunggal Gg Belawa No. 9, Denpasar Barat, Bali</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#87947B] shrink-0" />
                <span>Atelier Concierge: 0881-0383-22937</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-[#87947B] shrink-0" />
                <span>Senin — Minggu: 08.00 — 21.00 WIB</span>
              </div>
            </div>
          </div>

          {/* Col 2: Category Directory */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FAF8F4]">
              Katalog Formulasi
            </h4>
            <ul className="space-y-2.5 text-xs font-sans">
              <li>
                <a
                  href="#katalog"
                  onClick={() => onSelectCategory("ALL")}
                  className="hover:text-[#FAF8F4] transition-colors"
                >
                  Semua Koleksi Perawatan
                </a>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <a
                    href="#katalog"
                    onClick={() => onSelectCategory(c.slug)}
                    className="hover:text-[#FAF8F4] transition-colors"
                  >
                    {c.name}
                  </a>
                </li>
              ))}
              <li>
                <a href="#concern" className="text-[#87947B] hover:text-[#FAF8F4] transition-colors">
                  Skin Concern Diagnostic →
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Quality & Safety Standards */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FAF8F4]">
              Standar &amp; Jaminan
            </h4>
            <div className="space-y-3 text-xs font-sans">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#87947B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#FAF8F4] block">BPOM RI &amp; Halal MUI</span>
                  <span className="text-[11px] text-[#FAF8F4]/60">Teruji klinis, tanpa steroid, hidrokuinon, atau paraben sintetis.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Leaf className="w-4 h-4 text-[#87947B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#FAF8F4] block">Ethical Sourcing</span>
                  <span className="text-[11px] text-[#FAF8F4]/60">100% Cruelty-free &amp; responsibly harvested botanical actives.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-[#87947B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#FAF8F4] block">Pengiriman Terproteksi</span>
                  <span className="text-[11px] text-[#FAF8F4]/60">Segel temperatur aman dan kemasan bubble wrap bebas biaya.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Payment Channels & Invoicing */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FAF8F4]">
              Pembayaran Resmi
            </h4>
            <p className="text-xs text-[#FAF8F4]/70 font-sans">
              Semua transaksi diverifikasi secara otomatis dengan faktur digital legal.
            </p>

            <div className="space-y-2 pt-1 font-sans">
              <div className="p-3 bg-[#2A2A26] border border-[#3A3A34] rounded-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-[#33332D] text-[#87947B] flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="text-xs min-w-0">
                  <span className="font-medium text-[#FAF8F4] block">QRIS Standar Nasional</span>
                  <span className="text-[10px] text-[#FAF8F4]/50">BCA, Mandiri, GoPay, OVO, ShopeePay</span>
                </div>
              </div>

              <div className="p-3 bg-[#2A2A26] border border-[#3A3A34] rounded-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-[#33332D] text-[#87947B] flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="text-xs min-w-0">
                  <span className="font-medium text-[#FAF8F4] block">Transfer Bank Otomatis</span>
                  <span className="text-[10px] text-[#FAF8F4]/50">BCA, BRI, BNI &amp; Virtual Account</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#33332D] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF8F4]/50 font-sans">
          <p className="text-center sm:text-left">
            © 2026 BeautyCare Indonesia. Seluruh hak cipta dilindungi undang-undang.
          </p>
          <div className="flex items-center gap-6">
            <a href="#faq" className="hover:text-[#FAF8F4] transition-colors">FAQ &amp; Bantuan</a>
            <span className="hover:text-[#FAF8F4] transition-colors cursor-pointer">Kebijakan Privasi</span>
            <span className="hover:text-[#FAF8F4] transition-colors cursor-pointer">Syarat &amp; Ketentuan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
