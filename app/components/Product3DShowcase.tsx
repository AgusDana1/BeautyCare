"use client";

import { useState, useRef, useEffect, MouseEvent, TouchEvent } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Zap,
  Star,
  CheckCircle2,
  Eye,
  Gift,
  Flame,
} from "lucide-react";
import { Product, Variant } from "../types/storefront";
import { formatRupiah } from "@/lib/cart";

interface Product3DShowcaseProps {
  products: Product[];
  onAddToCart: (product: Product, variant: Variant | null, qty?: number) => void;
  onOpenOrderModal: (product: Product) => void;
}

export default function Product3DShowcase({
  products,
  onAddToCart,
  onOpenOrderModal,
}: Product3DShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // We highlight the top 6 products for the 3D showcase
  const showcaseProducts = products.slice(0, 6);
  const currentProduct = showcaseProducts[activeIndex] || showcaseProducts[0];

  // Autoplay 3D rotation
  useEffect(() => {
    if (isPaused || showcaseProducts.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % showcaseProducts.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, showcaseProducts.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + showcaseProducts.length) % showcaseProducts.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % showcaseProducts.length);
  };

  // Mouse tilt for active 3D card
  const handleStageMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -12;
    const tiltY = ((x - centerX) / centerX) * 12;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!showcaseProducts || showcaseProducts.length === 0) {
    return null;
  }

  // Active Variant and Price Calculation
  const activeVariantId =
    currentProduct?.hasVariants && currentProduct.variants.length > 0
      ? selectedVariants[currentProduct.id] ?? currentProduct.variants[0].id
      : null;
  const activeVariant =
    currentProduct.variants.find((v) => v.id === activeVariantId) || null;
  const currentPrice = activeVariant ? activeVariant.price : currentProduct.price;
  const potentialPoints = Math.floor(currentPrice / 1000);

  return (
    <div
      className="relative w-full rounded-3xl sm:rounded-4xl bg-gradient-to-br from-stone-900 via-stone-950 to-[#1c0f14] text-white p-4 sm:p-8 lg:p-10 shadow-2xl border border-rose-900/30 overflow-hidden"
      onMouseEnter={() => {
        setIsPaused(true);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsPaused(false);
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Background Lighting Environment */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-600/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Header bar of 3D Showcase */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Showcase Produk 3D Interaktif</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Spotlight Koleksi Terpopuler</span>
            <span className="hidden sm:inline-block text-xs font-normal px-2.5 py-0.5 rounded-full bg-white/10 text-stone-300 border border-white/10">
              Interaktif 3D
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5">
            Geser atau klik produk untuk melihat dalam sudut pandang 3D dan pilih ukuran secara langsung.
          </p>
        </div>

        {/* Carousel Prev/Next Navigation Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handlePrev}
            aria-label="Produk Sebelumnya"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-rose-600 border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-sm group"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <span className="text-[11px] sm:text-xs font-mono font-bold px-2 text-stone-300">
            {activeIndex + 1} / {showcaseProducts.length}
          </span>
          <button
            onClick={handleNext}
            aria-label="Produk Berikutnya"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-rose-600 border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-sm group"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 3D Main Stage Grid: Interactive 3D Showcase on Left/Center, Live Info & Actions on Right */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* LEFT / CENTER: Interactive 3D Coverflow Stage */}
        <div
          className="lg:col-span-7 relative h-[310px] sm:h-[400px] flex items-center justify-center perspective-1200 cursor-grab active:cursor-grabbing"
          onMouseMove={handleStageMouseMove}
        >
          {/* Luminous 3D Rotating Floor Pedestal */}
          <div className="absolute bottom-2 sm:bottom-6 w-52 sm:w-80 h-16 sm:h-20 bg-gradient-to-t from-rose-500/30 to-transparent rounded-[100%] blur-md pointer-events-none animate-orbit-glow" />
          <div className="absolute bottom-4 sm:bottom-8 w-44 sm:w-72 h-8 sm:h-12 border-2 border-rose-500/40 rounded-[100%] pointer-events-none shadow-[0_0_30px_rgba(244,63,94,0.4)]" />

          {/* 3D Product Carousel Items */}
          <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
            {showcaseProducts.map((prod, idx) => {
              const offset = idx - activeIndex;
              const isCenter = offset === 0;
              const isPrev =
                offset === -1 || (activeIndex === 0 && idx === showcaseProducts.length - 1);
              const isNext =
                offset === 1 || (activeIndex === showcaseProducts.length - 1 && idx === 0);

              // Position calculations in 3D space
              let transform = "scale(0) opacity-0 pointer-events-none";
              let zIndex = 0;

              if (isCenter) {
                zIndex = 30;
                transform = isHovered
                  ? `translate3d(0, -10px, 60px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.05)`
                  : "translate3d(0, -5px, 50px) rotateX(0deg) rotateY(0deg) scale(1)";
              } else if (isPrev) {
                zIndex = 10;
                transform = "translate3d(-55%, 15px, -80px) rotateY(32deg) scale(0.82)";
              } else if (isNext) {
                zIndex = 10;
                transform = "translate3d(55%, 15px, -80px) rotateY(-32deg) scale(0.82)";
              }

              const isVisible = isCenter || isPrev || isNext;
              if (!isVisible) return null;

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    if (!isCenter) setActiveIndex(idx);
                  }}
                  style={{
                    transform,
                    zIndex,
                    transition: isCenter && isHovered ? "transform 0.1s ease-out" : "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  className={`absolute w-56 sm:w-72 h-72 sm:h-92 rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-white/15 via-white/10 to-stone-900/80 backdrop-blur-xl border ${
                    isCenter
                      ? "border-rose-400/80 shadow-[0_20px_50px_rgba(225,29,72,0.35)]"
                      : "border-white/10 opacity-60 hover:opacity-90 cursor-pointer shadow-lg"
                  } flex flex-col justify-between overflow-hidden select-none`}
                >
                  {/* Floating Holographic Badge */}
                  <div className="flex items-center justify-between z-20">
                    <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                      {prod.category.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-rose-500 text-white shadow-xs">
                      {isCenter ? "Unggulan" : "Klik Pilih"}
                    </span>
                  </div>

                  {/* 3D Floating Product Image */}
                  <div className="relative my-auto aspect-square w-36 sm:w-48 mx-auto flex items-center justify-center">
                    <div
                      className={`w-full h-full relative rounded-2xl overflow-hidden ${
                        isCenter ? "animate-float-3d" : ""
                      }`}
                    >
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover object-center drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/10 text-stone-300 font-bold text-lg">
                          BeautyCare
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3D Card Footer Info */}
                  <div className="z-20 text-center space-y-1">
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate drop-shadow-xs">
                      {prod.name}
                    </h4>
                    <span className="text-rose-300 font-black font-mono text-xs sm:text-base block">
                      Rp {prod.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Active Product Interactive Control Deck */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/15 shadow-xl space-y-4">
          <div className="space-y-2">
            {/* Category & Badge Snippet */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/25 border border-rose-400/40 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
                {currentProduct.category.name}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>4.9</span>
                <span className="text-stone-400 font-normal">(120+ Terjual)</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>BPOM Resmi</span>
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-2xl font-black text-white leading-snug">
              {currentProduct.name}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed line-clamp-2">
              {currentProduct.description}
            </p>
          </div>

          {/* Interactive Variant Selection Pills */}
          {currentProduct.hasVariants && currentProduct.variants.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-300 font-medium">Pilih Ukuran Botol (ml):</span>
                <span className="text-rose-400 font-bold">
                  {activeVariant ? activeVariant.size : "Pilih Varian"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentProduct.variants.map((v) => {
                  const isSelected = v.id === activeVariantId;
                  return (
                    <button
                      key={v.id}
                      onClick={() =>
                        setSelectedVariants((prev) => ({
                          ...prev,
                          [currentProduct.id]: v.id,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-600/40 scale-105 border border-rose-300"
                          : "bg-white/10 hover:bg-white/20 text-stone-300 border border-white/10"
                      }`}
                    >
                      <span>{v.size}</span>
                      <span className="text-[10px] opacity-80">
                        (Rp {(v.price / 1000).toFixed(0)}k)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Price & Point Rewards Box */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
                Harga Spesial
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">
                {formatRupiah(currentPrice)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-300 flex items-center justify-end gap-1 font-bold">
                <Gift className="w-3 h-3 text-amber-400" />
                <span>+{potentialPoints} Poin Reward</span>
              </span>
              <span className="text-[10px] text-stone-400 block">
                Diskon belanja berikutnya
              </span>
            </div>
          </div>

          {/* Action Buttons: Instant Order & Add to Cart */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onAddToCart(currentProduct, activeVariant, 1)}
              disabled={currentProduct.stock === 0}
              className="py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-102 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4 text-rose-400" />
              <span>+ Keranjang</span>
            </button>

            <button
              onClick={() => onOpenOrderModal(currentProduct)}
              disabled={currentProduct.stock === 0}
              className="py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-200 shadow-lg shadow-rose-600/40 hover:scale-102 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Pesan Sekarang</span>
            </button>
          </div>

          {/* Link to Full Product Detail */}
          <div className="text-center pt-1 border-t border-white/10">
            <Link
              href={`/product/${currentProduct.slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-white font-semibold transition group"
            >
              <span>Pelajari Khasiat &amp; Review Lengkap</span>
              <Eye className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Thumbnail Strip for Fast 3D Switching */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-1">
        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider shrink-0 hidden sm:inline">
          Koleksi 3D:
        </span>
        <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
          {showcaseProducts.map((p, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={p.id}
                onClick={() => setActiveIndex(idx)}
                className={`relative px-2.5 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-2 shrink-0 ${
                  isActive
                    ? "bg-rose-500/30 border-rose-400 text-white scale-105 shadow-md shadow-rose-500/30"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-stone-400 hover:text-stone-200"
                }`}
              >
                <div className="w-6 h-6 rounded-lg overflow-hidden bg-stone-800 shrink-0">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-rose-500/40" />
                  )}
                </div>
                <span className="text-[10px] font-bold truncate max-w-[100px] sm:max-w-[130px]">
                  {p.name}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
