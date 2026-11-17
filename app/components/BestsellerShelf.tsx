"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { Product, Variant } from "../types/storefront";

interface BestsellerShelfProps {
  products: Product[];
  onAddToCart: (product: Product, variant?: Variant | null) => void;
  onOpenOrderModal: (product: Product) => void;
}

export default function BestsellerShelf({
  products,
  onAddToCart,
  onOpenOrderModal,
}: BestsellerShelfProps) {
  // Select top 3 or 4 products as bestsellers
  const bestsellers = products.slice(0, 4);

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-[#EAE4DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#87947B]">
              Formulasi Favorit
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#292925] tracking-tight">
              Best-Selling Formulations
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#292925]/70 max-w-md font-sans">
            Dipilih berulang kali oleh komunitas kami karena efektivitas klinisnya dalam menutrisi dan menjaga integritas kulit.
          </p>
        </div>

        {/* Bestseller Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {bestsellers.map((product) => {
            const hasVariants = product.hasVariants && product.variants?.length > 0;
            const primaryVariant = hasVariants ? product.variants[0] : null;
            const displayPrice = primaryVariant ? primaryVariant.price : product.price;

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between bg-[#FAF8F4] border border-[#EAE4DA] rounded-sm overflow-hidden hover:border-[#87947B]/60 transition-all duration-300"
              >
                <div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative aspect-square block overflow-hidden bg-[#EAE4DA]"
                  >
                    <img
                      src={product.image || ""}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider bg-white/95 text-[#292925] border border-[#EAE4DA] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#87947B]" />
                        BPOM
                      </span>
                    </div>
                  </Link>

                  <div className="p-4 sm:p-5 space-y-2">
                    <span className="text-[10px] font-mono tracking-wider uppercase text-[#87947B] block">
                      {product.category?.name || "Formulasi"}
                    </span>
                    <Link href={`/product/${product.slug}`} className="block">
                      <h3 className="font-serif text-base sm:text-lg text-[#292925] group-hover:text-[#87947B] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#292925]/65 line-clamp-2 leading-relaxed font-sans">
                      {product.description}
                    </p>

                    {/* Size variant indicators */}
                    {hasVariants && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {product.variants.map((v) => (
                          <span
                            key={v.id}
                            className="px-2 py-0.5 text-[10px] bg-[#EAE4DA]/60 text-[#292925]/80 font-mono"
                          >
                            {v.size}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-5 pt-0 space-y-3">
                  <div className="flex items-baseline justify-between pt-2 border-t border-[#EAE4DA]/60">
                    <span className="text-xs text-[#292925]/60 font-sans">Mulai dari</span>
                    <span className="text-sm sm:text-base font-serif font-bold text-[#292925]">
                      Rp {displayPrice.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onAddToCart(product, primaryVariant)}
                      className="py-2 px-3 border border-[#292925] text-[#292925] hover:bg-[#292925] hover:text-[#FAF8F4] text-xs font-medium tracking-wide transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>+ Kantong</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenOrderModal(product)}
                      className="py-2 px-3 bg-[#292925] hover:bg-[#87947B] text-[#FAF8F4] text-xs font-medium tracking-wide transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Pesan</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
