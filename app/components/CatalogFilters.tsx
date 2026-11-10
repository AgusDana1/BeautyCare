"use client";

import { Search, SlidersHorizontal, Droplets, X } from "lucide-react";
import { Category } from "../types/storefront";

interface CatalogFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allSizes: string[];
  selectedSizeFilter: string;
  onSelectSizeFilter: (size: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalResults: number;
}

export default function CatalogFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  allSizes,
  selectedSizeFilter,
  onSelectSizeFilter,
  sortBy,
  onSortChange,
  totalResults,
}: CatalogFiltersProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Section Header with Responsive Alignment */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-stone-200 pb-3.5 sm:pb-5">
        <div>
          <span className="text-[9px] sm:text-xs font-bold text-rose-600 uppercase tracking-widest">
            Koleksi Perawatan Terbaik
          </span>
          <h2 className="text-lg sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-0.5 sm:mt-1">
            Katalog Produk BeautyCare
          </h2>
          <p className="text-[11px] sm:text-sm text-stone-500 mt-0.5 sm:mt-1">
            Filter kategori, pencarian, dan varian ukuran (ml).
          </p>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto shrink-0 bg-white sm:bg-transparent p-1 sm:p-0 rounded-lg sm:rounded-xl border sm:border-0 border-stone-200">
          <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400" />
          <span className="text-[10px] sm:text-xs font-medium text-stone-600 whitespace-nowrap">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-[10px] sm:text-xs py-1 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-medium cursor-pointer"
          >
            <option value="recommended">Rekomendasi</option>
            <option value="price-low">Harga: Rendah ke Tinggi</option>
            <option value="price-high">Harga: Tinggi ke Rendah</option>
            <option value="name">Nama (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="space-y-3 sm:space-y-4">
        {/* 1. Search Bar */}
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3.5 top-2.5 sm:top-3.5 w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari serum, cleanser, sunscreen..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 sm:pl-11 pr-8 sm:pr-10 py-2 sm:py-3 text-[11px] sm:text-sm rounded-xl sm:rounded-2xl bg-white border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-2xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2 sm:top-3.5 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Category Filter Pills (Horizontal swipe on Mobile/Tablet with smooth scrolling) */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">
              Filter Kategori:
            </span>
            <span className="text-[10px] sm:text-xs text-stone-400 font-mono">
              {totalResults} produk
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1 pt-0.5 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              onClick={() => onSelectCategory("ALL")}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-rose-600 text-white shadow-xs sm:shadow-md shadow-rose-600/20"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                    isSelected
                      ? "bg-rose-600 text-white shadow-xs sm:shadow-md shadow-rose-600/20"
                      : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Filter per ml tiap product */}
        <div className="p-2.5 sm:p-4 bg-white/80 rounded-xl sm:rounded-2xl border border-stone-200/80 shadow-2xs space-y-1.5 sm:space-y-2">
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-stone-700">
            <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 shrink-0" />
            <span>Filter Ukuran (ml):</span>
            <span className="text-[9px] sm:text-[11px] text-stone-400 font-normal">
              (Produk bervarian ml)
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none pb-0.5 pt-0.5 sm:flex-wrap">
            <button
              onClick={() => onSelectSizeFilter("ALL")}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                selectedSizeFilter === "ALL"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Semua Ukuran
            </button>
            {allSizes.map((size) => (
              <button
                key={size}
                onClick={() => onSelectSizeFilter(size)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                  selectedSizeFilter === size
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
