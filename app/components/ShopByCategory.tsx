"use client";

import { ArrowRight } from "lucide-react";
import { Category } from "../types/storefront";

interface ShopByCategoryProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  "serum-treatment":
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
  "skincare":
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
  "body-care":
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
  "hair-care":
    "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80",
  "beauty-tools":
    "https://images.unsplash.com/photo-1512290900672-1f41b37b4274?w=800&auto=format&fit=crop&q=80",
};

const CATEGORY_TAGLINES: Record<string, string> = {
  "serum-treatment": "Konsentrat aktif bertarget barrier & rona kulit",
  "skincare": "Cleanser, hidrasi harian & pelembap restoratif",
  "body-care": "Nutrisi botanical untuk elastisitas kulit tubuh",
  "hair-care": "Perawatan kulit kepala & penguat akar rambut",
  "beauty-tools": "Instrumen komplementer ritual harian",
};

export default function ShopByCategory({
  categories,
  selectedCategory,
  onSelectCategory,
}: ShopByCategoryProps) {
  const handleClick = (slug: string) => {
    onSelectCategory(slug);
    const element = document.getElementById("katalog");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-14 sm:py-20 bg-[#FAF8F4] border-b border-[#EAE4DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#87947B]">
              Kurasi Formulasi
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#292925] tracking-tight">
              Kategori Perawatan
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#292925]/70 max-w-md font-sans">
            Setiap kategori diformulasikan secara spesifik untuk menjawab kebutuhan biologis kulit tanpa membebani pori-pori.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.slice(0, 4).map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const image =
              CATEGORY_IMAGES[cat.slug] ||
              "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80";
            const tagline =
              CATEGORY_TAGLINES[cat.slug] || "Formulasi seimbang untuk kesehatan kulit";

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleClick(cat.slug)}
                className={`group relative text-left bg-white border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-[#292925] ring-1 ring-[#292925]"
                    : "border-[#EAE4DA] hover:border-[#87947B]"
                }`}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EAE4DA]">
                  <img
                    src={image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#292925]/50 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
                </div>

                <div className="p-4 sm:p-5 bg-white space-y-1.5">
                  <h3 className="font-serif text-base sm:text-lg text-[#292925] group-hover:text-[#87947B] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#292925]/65 line-clamp-1 font-sans">
                    {tagline}
                  </p>
                  <div className="pt-2 flex items-center gap-1 text-[11px] font-medium text-[#292925] group-hover:text-[#87947B] transition-colors">
                    <span>Eksplorasi</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
