"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Product } from "../types/storefront";

interface SkinConcernFinderProps {
  products: Product[];
  onSelectCategory?: (categorySlug: string) => void;
  onOpenOrderModal: (product: Product) => void;
}

interface ConcernItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  keyIngredients: string[];
  categorySlug: string;
}

const CONCERNS: ConcernItem[] = [
  {
    id: "barrier",
    title: "Pemulihan Skin Barrier & Sensitivitas",
    subtitle: "Untuk kulit reaktif, perih, atau mudah iritasi",
    description:
      "Fokus pada perlindungan mantel lipid dengan kombinasi Ceramide bio-identik dan humektan ramah kulit tanpa pewangi sintetis.",
    keyIngredients: ["Ceramide NP", "Hyaluronic Acid", "Centella"],
    categorySlug: "serum-treatment",
  },
  {
    id: "dehydration",
    title: "Dehidrasi & Kehilangan Elastisitas",
    subtitle: "Untuk kulit kering, bersisik, atau terasa kencang tertarik",
    description:
      "Hidrasi mendalam berbasis asam amino mikro dan pelembap oklusif ringan untuk mengunci kadar air sepanjang hari di ruangan ber-AC.",
    keyIngredients: ["Amino Acid Micro", "Multi-Weight HA", "Panthenol"],
    categorySlug: "skincare",
  },
  {
    id: "dullness",
    title: "Kulit Kusam & Warna Tidak Merata",
    subtitle: "Untuk noda bekas jerawat dan paparan polusi perkotaan",
    description:
      "Mencerahkan secara bertahap dan menstabilkan produksi melanin dengan perlindungan antioksidan harian dan tabir surya spektrum luas.",
    keyIngredients: ["Niacinamide Murni", "Vitamin C Turunan", "SPF 50+"],
    categorySlug: "skincare",
  },
  {
    id: "body-hair",
    title: "Kelembapan Tubuh & Nutrisi Rambut",
    subtitle: "Untuk kulit tubuh kasar dan rambut kering kusut",
    description:
      "Perawatan botani kaya asam lemak esensial dari minyak argan bertekanan dingin yang mengembalikan kilau alami helai rambut dan kelembutan velvet kulit.",
    keyIngredients: ["Minyak Argan Organik", "Shea Emolien", "Ekstrak Mawar"],
    categorySlug: "body-care",
  },
];

export default function SkinConcernFinder({
  products,
  onSelectCategory,
  onOpenOrderModal,
}: SkinConcernFinderProps) {
  const [activeConcernId, setActiveConcernId] = useState<string>(CONCERNS[0].id);

  const activeConcern = CONCERNS.find((c) => c.id === activeConcernId) || CONCERNS[0];

  // Match products that fit the active concern
  const recommendedProducts = products.filter((p) => {
    if (activeConcern.categorySlug === "serum-treatment") {
      return p.category.slug === "serum-treatment";
    }
    if (activeConcern.categorySlug === "skincare") {
      return p.category.slug === "skincare";
    }
    if (activeConcern.categorySlug === "body-care") {
      return p.category.slug === "body-care" || p.category.slug === "hair-care";
    }
    return true;
  }).slice(0, 3);

  return (
    <section id="concerns" className="w-full bg-[#F5F1EB] border-y border-[#EAE4DA] py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Section Heading */}
        <div className="max-w-2xl">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-[#87947B] uppercase block mb-1.5">
            Konsultasi Mandiri
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-[#292925] font-normal tracking-tight">
            Temukan Formula Sesuai Kebutuhan Kulit
          </h2>
          <p className="text-xs sm:text-sm text-[#57564F] mt-2 font-light leading-relaxed">
            Setiap kondisi kulit memerlukan pendekatan bahan aktif yang tepat. Pilih fokus masalah Anda di bawah ini untuk melihat kurasi solusi dermatologis kami.
          </p>
        </div>

        {/* Concern Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CONCERNS.map((c) => {
            const isSelected = c.id === activeConcernId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveConcernId(c.id)}
                className={`p-4 sm:p-5 text-left border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#FAF8F4] border-[#292925] shadow-editorial"
                    : "bg-[#FAF8F4]/60 border-[#EAE4DA] hover:border-[#87947B] hover:bg-[#FAF8F4]"
                }`}
              >
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-medium text-[#292925] leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs text-[#57564F] mt-1 font-light">
                    {c.subtitle}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EAE4DA] flex items-center justify-between text-[11px]">
                  <span className={isSelected ? "font-semibold text-[#87947B]" : "text-[#57564F]"}>
                    {isSelected ? "Aktif Dipilih" : "Pilih Kategori"}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#87947B]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Concern Details & Curated Recommendations */}
        <div className="bg-[#FAF8F4] border border-[#EAE4DA] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Diagnostic Note */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#87947B] font-semibold block mb-1">
                Pendekatan Formulasi
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-[#292925] font-normal">
                {activeConcern.title}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#57564F] leading-relaxed font-light">
              {activeConcern.description}
            </p>

            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-[#292925] font-semibold block mb-2">
                Bahan Aktif Kunci:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeConcern.keyIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="text-xs py-1 px-2.5 bg-[#F5F1EB] border border-[#EAE4DA] text-[#57564F]"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <a
                href="#katalog"
                onClick={() => onSelectCategory && onSelectCategory(activeConcern.categorySlug)}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-medium text-[#292925] hover:text-[#87947B] underline underline-offset-4 decoration-[#EAE4DA] hover:decoration-[#87947B] transition cursor-pointer"
              >
                <span>Lihat Seluruh Produk Kategori Ini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Curated Product Cards */}
          <div className="lg:col-span-7">
            <span className="text-[11px] uppercase tracking-widest text-[#57564F] font-semibold block mb-3">
              Rekomendasi Terarah:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recommendedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-[#FAF8F4] border border-[#EAE4DA] p-3 flex flex-col justify-between"
                >
                  <div className="aspect-square bg-[#F5F1EB] overflow-hidden mb-3">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif text-[#57564F]/50">
                        BeautyCare
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-sm font-medium text-[#292925] line-clamp-1">
                      {prod.name}
                    </h4>
                    <span className="text-xs text-[#57564F] block">
                      Rp {prod.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenOrderModal(prod)}
                    className="mt-3 w-full py-1.5 text-center text-[11px] tracking-wider uppercase font-medium bg-[#292925] text-white hover:bg-[#1A1A18] transition cursor-pointer"
                  >
                    Pesan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
