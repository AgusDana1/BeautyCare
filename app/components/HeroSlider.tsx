"use client";

import { Sparkles, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { HeroSlide } from "../types/storefront";

interface HeroSliderProps {
  slides: HeroSlide[];
  currentSlide: number;
  isLoading?: boolean;
  onSelectSlide: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onPauseToggle: (paused: boolean) => void;
  onSelectCategory: (categorySlug: string) => void;
}

export default function HeroSlider({
  slides,
  currentSlide,
  isLoading = false,
  onSelectSlide,
  onNext,
  onPrev,
  onPauseToggle,
  onSelectCategory,
}: HeroSliderProps) {
  if (isLoading || !slides || slides.length === 0) {
    return (
      <section className="relative overflow-hidden w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-6 pb-4 sm:pb-10">
        <div className="relative rounded-2xl sm:rounded-4xl overflow-hidden shadow-xl sm:shadow-2xl border border-stone-200/70 aspect-[4/4.2] sm:aspect-[16/9] md:aspect-[21/9] min-h-[340px] sm:min-h-[480px] md:min-h-[520px] bg-stone-900/95 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs sm:text-sm font-semibold text-stone-200">
            Memuat Promo &amp; Rekomendasi Unggulan...
          </span>
          <span className="text-[10px] sm:text-xs text-stone-400 mt-1">
            Mengambil data dari katalog resmi BeautyCare
          </span>
        </div>
      </section>
    );
  }
  return (
    <section
      className="relative overflow-hidden w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-6 pb-4 sm:pb-10"
      onMouseEnter={() => onPauseToggle(true)}
      onMouseLeave={() => onPauseToggle(false)}
      onTouchStart={() => onPauseToggle(true)}
      onTouchEnd={() => onPauseToggle(false)}
    >
      <div className="relative rounded-2xl sm:rounded-4xl overflow-hidden shadow-xl sm:shadow-2xl border border-stone-200/70 aspect-[4/4.2] sm:aspect-[16/9] md:aspect-[21/9] min-h-[340px] sm:min-h-[480px] md:min-h-[520px] bg-stone-900">
        {/* Slides */}
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background Image with subtle zoom */}
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover object-center transition-transform duration-10000 ease-out ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              />

              {/* Aesthetic Dark Gradient Overlay for optimal readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/75 sm:via-stone-950/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/30" />

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-12 md:px-16 lg:px-20 max-w-3xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-300/40 text-rose-200 text-[9px] sm:text-xs font-semibold w-fit mb-2 sm:mb-4 animate-fade-in-up">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-rose-300 animate-pulse" />
                  <span>{slide.badge}</span>
                </div>

                {/* Title */}
                <h1 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.25] mb-1.5 sm:mb-3 drop-shadow-md animate-fade-in-up">
                  {slide.title}
                </h1>

                {/* Description */}
                <p className="text-[11px] sm:text-sm lg:text-base text-stone-200 max-w-xl leading-relaxed mb-3.5 sm:mb-6 drop-shadow-xs line-clamp-2 sm:line-clamp-none animate-fade-in-up">
                  {slide.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 animate-fade-in-up">
                  <a
                    href="#katalog"
                    onClick={() => {
                      if (slide.targetCategory !== "ALL") {
                        onSelectCategory(slide.targetCategory);
                      }
                    }}
                    className="px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-[11px] sm:text-sm shadow-md sm:shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1 sm:gap-2 cursor-pointer"
                  >
                    <span>{slide.primaryCta}</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </a>

                  <a
                    href="#faq"
                    className="px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-[11px] sm:text-sm border border-white/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1 sm:gap-2 cursor-pointer"
                  >
                    <span>FAQ &amp; Bantuan</span>
                  </a>
                </div>

                {/* Floating Stat Badge */}
                <div className="mt-3.5 sm:mt-8 flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-stone-900/60 backdrop-blur-md border border-white/10 text-white text-[10px] sm:text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold text-[9px] sm:text-[11px] leading-tight">
                        {slide.statBadge}
                      </span>
                      <span className="text-[8px] sm:text-[10px] text-stone-300 leading-tight">
                        {slide.statSub}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Left Arrow Button */}
        <button
          onClick={onPrev}
          aria-label="Slide Sebelumnya"
          className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-stone-900/40 hover:bg-stone-900/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer group"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={onNext}
          aria-label="Slide Berikutnya"
          className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-stone-900/40 hover:bg-stone-900/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer group"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Pagination Indicators */}
        <div className="absolute bottom-2.5 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-2 bg-stone-950/40 backdrop-blur-md px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full border border-white/10">
          {slides.map((_, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={idx}
                onClick={() => onSelectSlide(idx)}
                aria-label={`Ke slide ${idx + 1}`}
                className={`h-1 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-4 sm:w-7 bg-gradient-to-r from-rose-400 to-pink-500 shadow-xs"
                    : "w-1 sm:w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
