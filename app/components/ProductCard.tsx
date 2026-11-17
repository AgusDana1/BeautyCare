"use client";

import Link from "next/link";
import { Star, ShoppingBag, ArrowRight } from "lucide-react";
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
    ? Math.min(...product.variants.map((v: { price: number }) => v.price))
    : product.price;

  const reviewCount = product.reviews ? product.reviews.length : 12;
  const avgRating =
    product.reviews && product.reviews.length > 0
      ? (
          product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : "4.9";

  return (
    <article className="group flex flex-col justify-between bg-[#FAF8F4] border border-[#EAE4DA] hover:border-[#87947B]/60 transition-all duration-300">
      {/* Product Image Frame */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square sm:aspect-[4/4.5] overflow-hidden bg-[#F5F1EB] block cursor-pointer"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#57564F]/40 font-serif text-xl sm:text-2xl">
            BeautyCare
          </div>
        )}

        {/* Minimal Category & Stock Labels */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1 z-10 pointer-events-none">
          <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase text-[#57564F] bg-[#FAF8F4]/90 px-2 py-0.5 border border-[#EAE4DA] backdrop-blur-xs">
            {product.category.name}
          </span>
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 pointer-events-none">
            <span className="text-[9px] font-medium tracking-wider uppercase text-[#C99A91] bg-[#FAF8F4]/90 px-2 py-0.5 border border-[#EAE4DA]">
              Tersisa {product.stock}
            </span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 pointer-events-none">
            <span className="text-[9px] font-medium tracking-wider uppercase text-[#57564F] bg-[#FAF8F4]/90 px-2 py-0.5 border border-[#EAE4DA]">
              Habis
            </span>
          </div>
        )}
      </Link>

      {/* Product Metadata & Actions */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between space-y-3 sm:space-y-4">
        <div className="space-y-1.5 sm:space-y-2">
          {/* Review Star Snippet */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#57564F]">
            <Star className="w-3 h-3 fill-[#87947B] text-[#87947B] shrink-0" />
            <span className="font-semibold text-[#292925]">{avgRating}</span>
            <span className="text-[#87947B]">({reviewCount} ulasan)</span>
          </div>

          {/* Product Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-base sm:text-lg text-[#292925] group-hover:text-[#87947B] transition-colors leading-snug line-clamp-1 font-medium">
              {product.name}
            </h3>
          </Link>

          {/* Editorial Excerpt */}
          <p className="hidden sm:block text-xs text-[#57564F] line-clamp-2 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Available Sizes / Variants */}
          <div className="pt-1">
            {hasVariants ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-[#57564F] tracking-wider uppercase font-medium">
                  Ukuran:
                </span>
                {product.variants.map((v: { id: number; size: string }) => (
                  <span
                    key={v.id}
                    className="text-[10px] tracking-wider px-1.5 py-0.5 bg-[#F5F1EB] text-[#292925] border border-[#EAE4DA]"
                  >
                    {v.size}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] tracking-wider uppercase text-[#57564F]/70">
                Ukuran Standar
              </span>
            )}
          </div>
        </div>

        {/* Pricing and Action Triggers */}
        <div className="pt-3 border-t border-[#EAE4DA] flex items-center justify-between gap-2">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-[#57564F] block">
              {hasVariants ? "Mulai" : "Harga"}
            </span>
            <span className="font-serif text-sm sm:text-base text-[#292925] font-medium">
              Rp {minPrice.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Add To Bag */}
            <button
              onClick={() => onAddToCart(product, null, 1)}
              disabled={product.stock === 0}
              className="p-2 border border-[#EAE4DA] hover:border-[#292925] text-[#292925] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Tambah ke Kantong"
              aria-label="Tambah ke Kantong"
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Direct Order */}
            <button
              onClick={() => onOpenOrderModal(product)}
              disabled={product.stock === 0}
              className="px-3 sm:px-3.5 py-1.5 bg-[#292925] hover:bg-[#1A1A18] text-white text-[11px] tracking-wider uppercase font-medium transition cursor-pointer flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Pesan</span>
              <ArrowRight className="w-3 h-3 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
