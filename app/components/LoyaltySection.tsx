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

interface LoyaltyData {
  customer: {
    id: number;
    phone: string;
    name: string | null;
    email: string | null;
    points: number;
    tier: "SILVER" | "GOLD" | "PLATINUM";
    totalSpent: number;
    transactions?: Array<{
      id: number;
      type: "EARN" | "REDEEM";
      amount: number;
      description: string;
      createdAt: string;
    }>;
  };
  discountValue: number;
  potentialPoints: number;
}

export default function LoyaltySection() {
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [simulatedSpend, setSimulatedSpend] = useState<number>(250000);

  const handleCheckLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;

    setLoading(true);
    setErrorMessage("");
    setLoyaltyData(null);

    try {
      const res = await fetch(
        `/api/loyalty?phone=${encodeURIComponent(phoneInput.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil data loyalty.");
      }
      setLoyaltyData(data);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Nomor belum terdaftar atau terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  };

  const simulatedPoints = Math.floor(simulatedSpend / 1000);
  const simulatedDiscount = simulatedPoints * 100;

  return (
    <section id="loyalty" className="py-12 sm:py-20 bg-gradient-to-b from-[#faf7f5] via-rose-50/40 to-[#faf7f5]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-rose-200">
            <Gift className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>Retensi Pembeli &amp; Reward Repurchase</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
            BeautyCare Loyalty Club &amp; Sistem Poin
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Produk kecantikan adalah barang habis pakai yang dibeli berulang (repurchase).
            Kumpulkan poin dari setiap pembelanjaan dan tukarkan langsung menjadi potongan harga nyata pada pesanan Anda berikutnya!
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* SILVER GLOW */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-stone-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  Tier 1
                </span>
                <Coins className="w-5 h-5 text-stone-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900">
                  Silver Glow
                </h3>
                <span className="text-[11px] sm:text-xs text-stone-500 font-medium">
                  0 - 500 Poin Belanja
                </span>
              </div>
              <ul className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dapatkan 1 Poin tiap Rp 1.000</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Nilai tukar: 1 Poin = Rp 100 diskon</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Akses promo kilat member</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 text-[11px] text-stone-400">
              Otomatis aktif sejak pembelian pertama
            </div>
          </div>

          {/* GOLD RADIANT */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-amber-100/30 border-2 border-amber-300 shadow-md relative overflow-hidden flex flex-col justify-between hover:shadow-xl transition scale-102">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[9px] font-black uppercase tracking-wider py-1 px-4 rounded-bl-xl shadow-xs">
              Terpopuler
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  Tier 2
                </span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900">
                  Gold Radiant
                </h3>
                <span className="text-[11px] sm:text-xs text-amber-700 font-medium">
                  501 - 1.500 Poin
                </span>
              </div>
              <ul className="space-y-2 text-xs text-stone-700 pt-2 border-t border-amber-200/50">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Bonus 1.25x Poin Reward</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Voucher Gratis Ongkir Bulanan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kado kejutan ulang tahun (Birthday Gift)</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 mt-4 border-t border-amber-200/60 text-[11px] text-amber-800 font-medium">
              Didapatkan setelah repurchase 3-4 kali
            </div>
          </div>

          {/* PLATINUM FLAWLESS */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-stone-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  Tier 3 (VIP)
                </span>
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900">
                  Platinum Flawless
                </h3>
                <span className="text-[11px] sm:text-xs text-purple-700 font-medium">
                  1.501+ Poin
                </span>
              </div>
              <ul className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold">Bonus 1.5x Multiplier Poin</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Konsultasi Kulit Gratis dengan Dokter</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Akses prioritas produk baru (Early Bird)</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 text-[11px] text-stone-400">
              Hak istimewa anggota kecantikan VIP
            </div>
          </div>
        </div>

        {/* INTERACTIVE ROW: LIVE CHECKER & SIMULATOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Live Point Checker */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-md space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-stone-900">
                  Cek Saldo Poin &amp; Potongan Diskon Saya
                </h3>
                <p className="text-xs text-stone-500">
                  Ketik nomor WhatsApp / HP Anda untuk memeriksa saldo poin yang bisa dipakai
                </p>
              </div>
            </div>

            <form onSubmit={handleCheckLoyalty} className="flex gap-2">
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500/20"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 sm:px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
              >
                {loading ? "Memeriksa..." : "Cek Poin"}
              </button>
            </form>

            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-stone-400">
              <span>💡 Coba demo nomor:</span>
              <button
                type="button"
                onClick={() => setPhoneInput("081234567890")}
                className="text-rose-600 underline hover:text-rose-700"
              >
                081234567890 (350 Poin)
              </button>
              <span>atau</span>
              <button
                type="button"
                onClick={() => setPhoneInput("089876543210")}
                className="text-rose-600 underline hover:text-rose-700"
              >
                089876543210 (1250 Poin)
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                {errorMessage}
              </div>
            )}

            {loyaltyData && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-50/80 via-white to-stone-50 border border-rose-200 space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider block">
                      Member BeautyCare
                    </span>
                    <h4 className="font-black text-sm sm:text-base text-stone-900">
                      {loyaltyData.customer.name || "Pelanggan Setia"}
                    </h4>
                    <span className="text-xs text-stone-500">
                      {loyaltyData.customer.phone}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs ${
                      loyaltyData.customer.tier === "PLATINUM"
                        ? "bg-purple-100 text-purple-900 border border-purple-200"
                        : loyaltyData.customer.tier === "GOLD"
                        ? "bg-amber-100 text-amber-900 border border-amber-200"
                        : "bg-stone-100 text-stone-800 border border-stone-200"
                    }`}
                  >
                    Tier: {loyaltyData.customer.tier}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-200/80">
                  <div className="p-3 rounded-xl bg-white border border-rose-100 shadow-2xs">
                    <span className="text-[10px] text-stone-400 block font-medium">
                      Saldo Poin Aktif
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono">
                      {loyaltyData.customer.points} Pts
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-rose-100 shadow-2xs">
                    <span className="text-[10px] text-stone-400 block font-medium">
                      Nilai Potongan Harga
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                      {formatRupiah(loyaltyData.discountValue)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 bg-white/70 p-2.5 rounded-xl border border-stone-200/60">
                  🎉 Poin Anda dapat langsung dipotongkan saat memesan produk kecantikan berikutnya di keranjang belanja!
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Point & Repurchase Value Simulator */}
          <div className="lg:col-span-5 bg-stone-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Simulasi Penghematan Belanja Ulang</span>
            </div>

            <h3 className="text-lg sm:text-xl font-black tracking-tight">
              Hitung Poin &amp; Diskon Anda
            </h3>

            <p className="text-xs text-stone-400 leading-relaxed">
              Setiap kali Anda membeli serum, toner, atau moisturizer baru, tabungan poin Anda akan terus bertambah.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-300">Nilai Belanja:</span>
                <span className="text-rose-400 font-mono font-bold">
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
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>Rp 50rb</span>
                <span>Rp 500rb</span>
                <span>Rp 1 Juta</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-300">Poin Didapat:</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  +{simulatedPoints} Poin
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-stone-700/80 pt-2">
                <span className="text-xs text-stone-300">Diskon Belanja Berikutnya:</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {formatRupiah(simulatedDiscount)}
                </span>
              </div>
            </div>

            <a
              href="#katalog"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition text-center"
            >
              <span>Mulai Kumpulkan Poin Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
