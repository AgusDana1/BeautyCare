"use client";

import { useState, useRef, MouseEvent } from "react";
import Link from "next/link";
import { ShoppingCart, ChevronRight, Star, Sparkles } from "lucide-react";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const hasVariants = product.hasVariants && product.variants.length > 0;
  const minPrice = hasVariants
    ? Math.min(...product.variants.map((v) => v.price))
    : product.price;

  const reviewCount = product.reviews ? product.reviews.length : 12;
  const avgRating =
    product.reviews && product.reviews.length > 0
      ? (
          product.reviews.reduce((sum, r) => sum + r.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : "4.9";

  // Dynamic 3D tilt tracking mouse
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Tilt degree limit (up to 12 deg)
    const rotateX = ((y - centerY) / centerY) * -11;
    const rotateY = ((x - centerX) / centerX) * 11;

    // Glare position in percent
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 0.35 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative perspective-1000 group transition-all duration-300"
    >
      {/* 3D Ambient Backdrop Glow */}
      <div
        className={`absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-rose-500/20 via-pink-400/20 to-amber-300/20 blur-xl opacity-0 transition-opacity duration-500 pointer-events-none ${
          isHovered ? "opacity-100" : ""
        }`}
        style={{
          transform: isHovered
            ? `translate3d(${rotate.y * -1.5}px, ${rotate.x * 1.5}px, -20px)`
            : "none",
        }}
      />

      {/* Main 3D Tilted Card Body */}
      <div
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(10px) scale3d(1.02, 1.02, 1.02)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)",
          transition: isHovered
            ? "transform 0.1s ease-out, box-shadow 0.2s ease"
            : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease",
        }}
        className="transform-style-3d relative bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-3d-card group-hover:shadow-3d-card-hover group-hover:border-rose-300/70 flex flex-col justify-between overflow-hidden transition-all duration-300"
      >
        {/* Dynamic Specular Light Glare (Reflection that moves with mouse cursor) */}
        <div
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 240, 245, 0.2) 40%, transparent 70%)`,
          }}
        />

        {/* Shimmer Light Sweeping Accent */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="w-[80%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] animate-shimmer-light" />
        </div>

        {/* Top 3D Image Container */}
        <div
          style={{ transform: "translateZ(26px)" }}
          className="transform-style-3d relative aspect-square overflow-hidden bg-gradient-to-b from-stone-100 to-rose-50/40 block"
        >
          <Link
            href={`/product/${product.slug}`}
            className="w-full h-full block cursor-pointer"
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300 font-bold text-lg sm:text-2xl">
                BeautyCare
              </div>
            )}
          </Link>

          {/* Floating Category Badge with 3D Popout */}
          <div
            style={{ transform: "translateZ(38px)" }}
            className="absolute top-2 sm:top-3 left-2 sm:left-3 pointer-events-none z-20"
          >
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-bold rounded-full bg-white/90 backdrop-blur-md text-stone-800 shadow-sm border border-stone-200/60 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-rose-500" />
              <span>{product.category.name}</span>
            </span>
          </div>

          {/* Floating Stock Badge */}
          <div
            style={{ transform: "translateZ(38px)" }}
            className="absolute top-2 sm:top-3 right-2 sm:right-3 pointer-events-none z-20"
          >
            <span
              className={`px-2 py-0.5 text-[8px] sm:text-[10px] font-bold rounded-full shadow-xs backdrop-blur-xs ${
                product.stock === 0
                  ? "bg-red-500/90 text-white"
                  : product.stock < 10
                  ? "bg-amber-500/90 text-white"
                  : "bg-emerald-600/90 text-white"
              }`}
            >
              {product.stock === 0 ? "Habis" : `Stok ${product.stock}`}
            </span>
          </div>

          {/* 3D Glass Corner Pedestal Shade */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/25 via-black/5 to-transparent pointer-events-none" />
        </div>

        {/* Product Details Section with 3D Z-Depth */}
        <div
          style={{ transform: "translateZ(20px)" }}
          className="transform-style-3d p-2.5 sm:p-4.5 flex flex-col flex-1 justify-between space-y-2 sm:space-y-4 bg-white/70"
        >
          <div className="space-y-1 sm:space-y-2">
            {/* Review Star Snippet */}
            <div className="flex items-center gap-1 text-[9px] sm:text-xs text-amber-600 font-bold">
              <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span>{avgRating}</span>
              <span className="text-stone-400 font-normal">({reviewCount})</span>
              {product.sellerBadge && (
                <>
                  <span className="hidden sm:inline text-stone-300">•</span>
                  <span className="hidden sm:inline text-rose-600 font-semibold text-[9px] px-1.5 py-0.2 rounded bg-rose-50 border border-rose-100">
                    Official
                  </span>
                </>
              )}
            </div>

            {/* Product Title */}
            <Link href={`/product/${product.slug}`} className="block">
              <h3 className="font-bold text-stone-900 text-xs sm:text-base group-hover:text-rose-600 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>

            {/* Description: Hidden on smartphone for minimalist UX */}
            <p className="hidden sm:block text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {/* Available Sizes preview badge */}
            <div className="pt-0.5">
              {hasVariants ? (
                <>
                  {/* Smartphone */}
                  <div className="sm:hidden text-[9px] text-stone-400 font-medium">
                    {product.variants.length} Varian Ukuran (ml)
                  </div>
                  {/* Desktop/Tablet */}
                  <div className="hidden sm:flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-stone-400 font-medium">Ukuran:</span>
                    {product.variants.map((v) => (
                      <span
                        key={v.id}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/50 hover:bg-rose-100 transition"
                      >
                        {v.size}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <span className="text-[8px] sm:text-[10px] text-stone-400 italic">
                  Ukuran Standar
                </span>
              )}
            </div>
          </div>

          {/* Price & 3D Interactive Buttons */}
          <div
            style={{ transform: "translateZ(30px)" }}
            className="pt-2 sm:pt-3 border-t border-stone-100/90 flex items-center justify-between gap-1 sm:gap-2"
          >
            <Link href={`/product/${product.slug}`} className="min-w-0">
              <span className="text-[7px] sm:text-[10px] text-stone-400 block font-medium uppercase tracking-wider">
                {hasVariants ? "Mulai" : "Harga"}
              </span>
              <span className="font-black text-stone-900 text-[11px] sm:text-base font-mono truncate block hover:text-rose-600 transition">
                Rp {minPrice.toLocaleString("id-ID")}
              </span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Quick Add to Cart button */}
              <button
                onClick={() => onAddToCart(product, null, 1)}
                disabled={product.stock === 0}
                className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border border-stone-200/80 hover:border-rose-400 bg-stone-50 hover:bg-rose-50 text-stone-700 hover:text-rose-600 shadow-2xs hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                title="Tambah ke Keranjang"
                aria-label="Tambah ke Keranjang"
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:rotate-[-8deg] transition-transform" />
              </button>

              {/* "Pesan Sekarang" Button */}
              <button
                onClick={() => onOpenOrderModal(product)}
                disabled={product.stock === 0}
                className="px-2 py-1.5 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-white bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-700 hover:to-pink-700 active:scale-95 shadow-sm sm:shadow-md shadow-rose-600/30 hover:scale-105 transition-all duration-200 flex items-center gap-0.5 sm:gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Pesan</span>
                <ChevronRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
