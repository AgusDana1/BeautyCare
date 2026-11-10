"use client";

import { ShieldCheck, Droplets, Sparkles, Truck } from "lucide-react";

export default function FeatureHighlights() {
  return (
    <section id="keunggulan" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-3 sm:pb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {/* Card 1 */}
        <div className="bg-white/80 backdrop-blur-xs p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/70 shadow-2xs hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[11px] sm:text-sm text-stone-900 truncate">100% Original</div>
            <div className="text-[9px] sm:text-[11px] text-stone-400 truncate">Garansi BPOM Resmi</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white/80 backdrop-blur-xs p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/70 shadow-2xs hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Droplets className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[11px] sm:text-sm text-stone-900 truncate">Varian ml Fleksibel</div>
            <div className="text-[9px] sm:text-[11px] text-stone-400 truncate">Pilih 30ml - 400ml</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white/80 backdrop-blur-xs p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/70 shadow-2xs hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[11px] sm:text-sm text-stone-900 truncate">Kualitas Teruji</div>
            <div className="text-[9px] sm:text-[11px] text-stone-400 truncate">Standar Dermatologi</div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white/80 backdrop-blur-xs p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/70 shadow-2xs hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Truck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[11px] sm:text-sm text-stone-900 truncate">Gratis Pengiriman</div>
            <div className="text-[9px] sm:text-[11px] text-stone-400 truncate">Cepat &amp; Terlindungi</div>
          </div>
        </div>
      </div>
    </section>
  );
}
