"use client";

import { ShoppingCart, ChevronRight } from "lucide-react";
import { Product, Variant } from "../types/storefront";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, variant: Variant | null, qty?: number) => void;
  onOpenOrderModal: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onOpenOrderModal,
}: ProductCardProps) {
  const hasVariants = product.hasVariants && product.variants.length > 0;
  const minPrice = hasVariants
    ? Math.min(...product.variants.map((v) => v.price))
    : product.price;

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 shadow-2xs hover:shadow-xl hover:shadow-rose-900/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Product Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 font-bold text-lg sm:text-2xl">
            BeautyCare
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
          <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-bold rounded-full bg-white/95 backdrop-blur-xs text-stone-800 shadow-2xs border border-stone-100">
            {product.category.name}
          </span>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <span
            className={`px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-bold rounded-full shadow-2xs ${
              product.stock === 0
                ? "bg-red-500 text-white"
                : product.stock < 10
                ? "bg-amber-500 text-white"
                : "bg-emerald-600/90 text-white"
            }`}
          >
            {product.stock === 0 ? "Habis" : `Tersedia ${product.stock}`}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-2.5 sm:p-5 flex flex-col flex-1 justify-between space-y-2 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <h3 className="font-bold text-stone-900 text-xs sm:text-base group-hover:text-rose-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[10px] sm:text-xs text-stone-500 line-clamp-2 leading-tight sm:leading-relaxed">
            {product.description}
          </p>

          {/* Available Sizes preview badge */}
          <div className="pt-0.5 sm:pt-1">
            {hasVariants ? (
              <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
                <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium">Ukuran:</span>
                {product.variants.map((v) => (
                  <span
                    key={v.id}
                    className="text-[8px] sm:text-[10px] font-bold px-1 sm:px-2 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200/50"
                  >
                    {v.size}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[9px] sm:text-[10px] text-stone-400 italic">
                Standar
              </span>
            )}
          </div>
        </div>

        {/* Price & Actions */}
        <div className="pt-2 sm:pt-3 border-t border-stone-100 flex items-center justify-between gap-1 sm:gap-2">
          <div className="min-w-0">
            <span className="text-[8px] sm:text-[10px] text-stone-400 block font-medium">
              {hasVariants ? "Mulai" : "Harga"}
            </span>
            <span className="font-extrabold text-stone-900 text-xs sm:text-base font-mono truncate block">
              Rp {minPrice.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Quick Add to Cart button */}
            <button
              onClick={() => onAddToCart(product, null, 1)}
              disabled={product.stock === 0}
              className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border border-stone-200 hover:border-rose-300 bg-stone-50 hover:bg-rose-50 text-stone-700 hover:text-rose-600 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Tambah ke Keranjang"
              aria-label="Tambah ke Keranjang"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* "Pesan Sekarang" Button */}
            <button
              onClick={() => onOpenOrderModal(product)}
              disabled={product.stock === 0}
              className="px-2 sm:px-3.5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-xs sm:shadow-md shadow-rose-600/25 hover:scale-105 transition-all duration-200 flex items-center gap-0.5 sm:gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Pesan</span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
