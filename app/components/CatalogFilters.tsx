"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
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
    <div className="space-y-6 sm:space-y-8">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EAE4DA] pb-5">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.2em] text-[#87947B] uppercase block mb-1">
            Koleksi Terkurasi
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#292925] font-normal tracking-tight">
            Semua Formulasi &amp; Perawatan
          </h2>
          <p className="text-xs sm:text-sm text-[#57564F] mt-1 font-light max-w-xl">
            Eksplorasi formula pembersih, serum barrier, hingga nutrisi botani tubuh dengan panduan varian ml.
          </p>
        </div>

        {/* Sort and Count */}
        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0 text-xs text-[#57564F]">
          <span className="font-mono text-xs text-[#87947B]">
            {totalResults} produk
          </span>
          <div className="h-3 w-[1px] bg-[#EAE4DA]" />
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#57564F]" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="py-1.5 px-2 bg-[#F5F1EB] border border-[#EAE4DA] text-[#292925] text-xs focus:outline-none focus:border-[#292925] cursor-pointer"
            >
              <option value="recommended">Urutan: Rekomendasi</option>
              <option value="price-low">Harga: Terendah</option>
              <option value="price-high">Harga: Tertinggi</option>
              <option value="name">Nama: A — Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-4">
        {/* Search & Category Pills Row */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              onClick={() => onSelectCategory("ALL")}
              className={`px-3.5 py-1.5 text-xs tracking-wider uppercase font-medium whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === "ALL"
                  ? "bg-[#292925] text-[#FAF8F4] border-[#292925]"
                  : "bg-transparent text-[#57564F] border-[#EAE4DA] hover:border-[#292925] hover:text-[#292925]"
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`px-3.5 py-1.5 text-xs tracking-wider uppercase font-medium whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? "bg-[#292925] text-[#FAF8F4] border-[#292925]"
                      : "bg-transparent text-[#57564F] border-[#EAE4DA] hover:border-[#292925] hover:text-[#292925]"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Minimal Search Bar */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#57564F]" />
            <input
              type="text"
              placeholder="Cari formula, bahan aktif..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-2 text-xs bg-[#FAF8F4] border border-[#EAE4DA] text-[#292925] placeholder-[#57564F]/50 focus:outline-none focus:border-[#292925] transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-2.5 text-[#57564F] hover:text-[#292925]"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Size Filter Bar */}
        {allSizes.length > 0 && (
          <div className="p-3 bg-[#F5F1EB] border border-[#EAE4DA] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] uppercase tracking-wider text-[#57564F] font-medium mr-1">
              Pilihan Ukuran Botol (ml):
            </span>
            <button
              onClick={() => onSelectSizeFilter("ALL")}
              className={`px-2.5 py-1 text-[11px] tracking-wider uppercase transition border cursor-pointer ${
                selectedSizeFilter === "ALL"
                  ? "bg-[#292925] text-white border-[#292925]"
                  : "bg-[#FAF8F4] text-[#57564F] border-[#EAE4DA] hover:border-[#292925]"
              }`}
            >
              Semua
            </button>
            {allSizes.map((size) => (
              <button
                key={size}
                onClick={() => onSelectSizeFilter(size)}
                className={`px-2.5 py-1 text-[11px] tracking-wider uppercase transition border cursor-pointer ${
                  selectedSizeFilter === size
                    ? "bg-[#87947B] text-white border-[#87947B]"
                    : "bg-[#FAF8F4] text-[#57564F] border-[#EAE4DA] hover:border-[#87947B]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
