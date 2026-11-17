"use client";

import { useState } from "react";
import {
  Gift,
  Coins,
  Crown,
  CheckCircle2,
  Search,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { formatRupiah } from "@/lib/cart";

interface LoyaltyCustomer {
  id?: number;
  phone?: string;
  name?: string | null;
  email?: string | null;
  points?: number;
  tier?: string;
  totalSpent?: number;
  transactions?: Array<{
    id: number;
    type?: string;
    amount?: number;
    points?: number;
    description: string;
    createdAt: string;
  }>;
}

interface LoyaltyData {
  found?: boolean;
  message?: string;
  id?: number;
  name?: string | null;
  phone?: string;
  points?: number;
  tier?: string;
  discountValue?: number;
  potentialPoints?: number;
  customer?: LoyaltyCustomer | null;
}

export default function LoyaltySection() {
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [simulatedSpend, setSimulatedSpend] = useState<number>(250000);

  const checkLoyaltyForNumber = async (targetPhone: string) => {
    const trimmed = targetPhone.trim();
    if (!trimmed) return;

    setLoading(true);
    setErrorMessage("");
    setLoyaltyData(null);

    try {
      const res = await fetch(
        `/api/loyalty?phone=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil data loyalty.");
      }
      if (data.found === false) {
        setErrorMessage(
          data.message || "Nomor belum terdaftar di program loyalty."
        );
        setLoyaltyData(null);
        return;
      }
      setLoyaltyData(data);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Nomor belum terdaftar atau terjadi kesalahan."
      );
      setLoyaltyData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    await checkLoyaltyForNumber(phoneInput);
  };

  const handleDemoClick = (demoNum: string) => {
    setPhoneInput(demoNum);
    checkLoyaltyForNumber(demoNum);
  };

  const simulatedPoints = Math.floor(simulatedSpend / 1000);
  const simulatedDiscount = simulatedPoints * 100;

  const customerName =
    loyaltyData?.customer?.name || loyaltyData?.name || "Pelanggan Terhormat";
  const customerPhone =
    loyaltyData?.customer?.phone || loyaltyData?.phone || phoneInput;
  const customerTier = (
    loyaltyData?.customer?.tier ||
    loyaltyData?.tier ||
    "SILVER"
  ).toUpperCase();
  const customerPoints =
    loyaltyData?.customer?.points ?? loyaltyData?.points ?? 0;
  const discountValue =
    loyaltyData?.discountValue ?? customerPoints * 100;

  return (
    <section id="loyalty" className="w-full bg-[#FAF8F4] py-16 sm:py-24 border-b border-[#EAE4DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-[#87947B] uppercase block">
            Hak Istimewa &amp; Poin
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#292925] font-normal tracking-tight">
            BeautyCare Membership Club
          </h2>
          <p className="text-xs sm:text-sm text-[#57564F] leading-relaxed font-light">
            Setiap pembelanjaan rutin Anda diapresiasi dengan poin terukur. Kumpulkan saldo poin dan tukarkan langsung sebagai potongan harga resmi pada pesanan berikutnya.
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* SILVER GLOW */}
          <div className="p-6 sm:p-8 bg-[#F5F1EB] border border-[#EAE4DA] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[#87947B]">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[#57564F]">
                  Tingkat 1
                </span>
                <Coins className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#292925]">
                  Silver Glow
                </h3>
                <span className="text-xs text-[#57564F] font-light">
                  0 — 500 Poin Akumulasi
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#57564F] pt-4 border-t border-[#EAE4DA]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#87947B] shrink-0 mt-0.5" />
                  <span>Dapatkan 1 Poin per transaksi Rp 1.000</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#87947B] shrink-0 mt-0.5" />
                  <span>Nilai konversi: 1 Poin = Rp 100 diskon</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#87947B] shrink-0 mt-0.5" />
                  <span>Akses kurasi promo kilat member</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-[#EAE4DA] text-[11px] text-[#57564F]/70 font-light">
              Otomatis aktif sejak pemesanan perdana Anda
            </div>
          </div>

          {/* GOLD RADIANT */}
          <div className="p-6 sm:p-8 bg-[#FAF8F4] border-2 border-[#87947B] flex flex-col justify-between space-y-6 relative shadow-editorial">
            <div className="absolute top-0 right-0 bg-[#87947B] text-white text-[9px] tracking-widest uppercase font-semibold py-1 px-3">
              Paling Populer
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[#87947B]">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[#87947B]">
                  Tingkat 2
                </span>
                <Sparkles className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#292925]">
                  Gold Radiant
                </h3>
                <span className="text-xs text-[#87947B] font-light">
                  501 — 1.500 Poin
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#57564F] pt-4 border-t border-[#EAE4DA]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#87947B] shrink-0 mt-0.5" />
                  <span className="font-medium text-[#292925]">Bonus 1.25x Multiplier Poin</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#87947B] shrink-0 mt-0.5" />
                  <span>Voucher Gratis Ongkir Bulanan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#87947B] shrink-0 mt-0.5" />
                  <span>Kado kejutan di bulan ulang tahun Anda</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-[#EAE4DA] text-[11px] text-[#87947B] font-light">
              Dicapai setelah 3–4 kali pemesanan ulang (repurchase)
            </div>
          </div>

          {/* PLATINUM FLAWLESS */}
          <div className="p-6 sm:p-8 bg-[#F5F1EB] border border-[#EAE4DA] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[#57564F]">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[#57564F]">
                  Tingkat 3 (VIP)
                </span>
                <Crown className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#292925]">
                  Platinum Flawless
                </h3>
                <span className="text-xs text-[#57564F] font-light">
                  1.501+ Poin
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#57564F] pt-4 border-t border-[#EAE4DA]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#87947B] shrink-0 mt-0.5" />
                  <span className="font-medium text-[#292925]">Bonus 1.5x Multiplier Poin</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#87947B] shrink-0 mt-0.5" />
                  <span>Konsultasi Kulit Eksklusif Tim Dermatologi</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#87947B] shrink-0 mt-0.5" />
                  <span>Akses peluncuran produk baru (Early Bird)</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-[#EAE4DA] text-[11px] text-[#57564F]/70 font-light">
              Hak istimewa pelanggan loyalitas utama
            </div>
          </div>
        </div>

        {/* Checker & Simulator Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Live Point Checker */}
          <div className="lg:col-span-7 bg-[#F5F1EB] border border-[#EAE4DA] p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[#87947B] text-[11px] font-semibold uppercase tracking-wider mb-1">
                <Search className="w-3.5 h-3.5" />
                <span>Pemeriksaan Saldo Poin</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#292925]">
                Cek Saldo &amp; Potongan Diskon Anda
              </h3>
              <p className="text-xs text-[#57564F] font-light mt-1">
                Ketik nomor WhatsApp / HP yang terdaftar untuk memeriksa saldo poin aktif Anda.
              </p>
            </div>

            <form onSubmit={handleCheckLoyalty} className="flex gap-2">
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[#FAF8F4] border border-[#EAE4DA] text-xs sm:text-sm text-[#292925] focus:outline-none focus:border-[#292925] font-sans"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#292925] hover:bg-[#1A1A18] text-white text-xs tracking-wider uppercase font-medium transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                {loading ? "Memeriksa..." : "Cek Poin"}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#57564F]">
              <span>Contoh demo:</span>
              <button
                type="button"
                onClick={() => handleDemoClick("081234567890")}
                className="text-[#292925] underline hover:text-[#87947B] cursor-pointer font-medium"
              >
                081234567890 (350 Pts)
              </button>
              <span>atau</span>
              <button
                type="button"
                onClick={() => handleDemoClick("089876543210")}
                className="text-[#292925] underline hover:text-[#87947B] cursor-pointer font-medium"
              >
                089876543210 (1250 Pts)
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-[#FAF8F4] border border-[#C99A91] text-[#292925] text-xs">
                {errorMessage}
              </div>
            )}

            {loyaltyData && (
              <div className="p-5 bg-[#FAF8F4] border border-[#87947B] space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE4DA] pb-3">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase font-semibold text-[#87947B] block">
                      Anggota Terdaftar
                    </span>
                    <h4 className="font-serif text-lg font-medium text-[#292925]">
                      {customerName}
                    </h4>
                    <span className="text-xs text-[#57564F] font-mono">
                      {customerPhone}
                    </span>
                  </div>

                  <span className="px-3 py-1 bg-[#F2F5F0] border border-[#87947B] text-[#4A5543] text-xs font-semibold uppercase tracking-wider">
                    Tier: {customerTier}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#F5F1EB] border border-[#EAE4DA]">
                    <span className="text-[10px] uppercase tracking-wider text-[#57564F] block">
                      Saldo Poin Aktif
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-[#87947B] block mt-0.5">
                      {customerPoints} Pts
                    </span>
                  </div>

                  <div className="p-3 bg-[#F5F1EB] border border-[#EAE4DA]">
                    <span className="text-[10px] uppercase tracking-wider text-[#57564F] block">
                      Nilai Potongan Diskon
                    </span>
                    <span className="font-serif text-xl sm:text-2xl font-medium text-[#292925] block mt-0.5">
                      {formatRupiah(discountValue)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#57564F] font-light">
                  Poin Anda dapat langsung dipotongkan saat memesan formula berikutnya di keranjang belanja.
                </p>
              </div>
            )}
          </div>

          {/* Value Simulator */}
          <div className="lg:col-span-5 bg-[#FAF8F4] border border-[#EAE4DA] p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[#87947B] text-[11px] font-semibold uppercase tracking-wider mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Simulasi Repurchase</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#292925]">
                Kalkulator Tabungan Belanja
              </h3>
              <p className="text-xs text-[#57564F] font-light mt-1">
                Ketahui potensi potongan harga yang akan Anda dapatkan dari rutinitas belanja berikutnya.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#57564F]">Nominal Belanja:</span>
                <span className="font-serif text-sm font-medium text-[#292925]">
                  {formatRupiah(simulatedSpend)}
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="1000000"
                step="25000"
                value={simulatedSpend}
                onChange={(e) => setSimulatedSpend(Number(e.target.value))}
                className="w-full accent-[#87947B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#57564F]/70 font-mono">
                <span>Rp 50rb</span>
                <span>Rp 500rb</span>
                <span>Rp 1 Juta</span>
              </div>
            </div>

            <div className="p-4 bg-[#F5F1EB] border border-[#EAE4DA] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#57564F]">Poin Didapat:</span>
                <span className="font-mono text-sm font-bold text-[#87947B]">
                  +{simulatedPoints} Poin
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#EAE4DA] pt-2">
                <span className="text-xs text-[#57564F]">Diskon Pesanan Selanjutnya:</span>
                <span className="font-serif text-base font-medium text-[#292925]">
                  {formatRupiah(simulatedDiscount)}
                </span>
              </div>
            </div>

            <a
              href="#katalog"
              className="w-full py-3 bg-[#292925] hover:bg-[#1A1A18] text-white text-xs tracking-wider uppercase font-medium flex items-center justify-center gap-2 transition cursor-pointer text-center"
            >
              <span>Mulai Kumpulkan Poin</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
