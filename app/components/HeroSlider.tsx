"use client";

import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] bg-[#F5F1EB] border border-[#EAE4DA] flex flex-col items-center justify-center text-center p-8">
          <div className="w-8 h-8 border-2 border-[#87947B] border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs uppercase tracking-widest text-[#57564F]">
            Memuat Katalog Editorial...
          </span>
        </div>
      </section>
    );
  }

  const active = slides[currentSlide] || slides[0];

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
      onMouseEnter={() => onPauseToggle(true)}
      onMouseLeave={() => onPauseToggle(false)}
      onTouchStart={() => onPauseToggle(true)}
      onTouchEnd={() => onPauseToggle(false)}
    >
      <div className="relative border border-[#EAE4DA] bg-[#F5F1EB] overflow-hidden">
        {/* Editorial Split / Layered Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] sm:min-h-[520px] lg:min-h-[580px]">
          {/* Left Column: Editorial Narrative & Action */}
          <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-14 z-10 bg-[#FAF8F4]/90 lg:bg-[#FAF8F4]/80 backdrop-blur-xs">
            <div className="space-y-4 sm:space-y-6">
              {/* Subtle Botanical Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#87947B]" />
                <span className="text-[11px] sm:text-xs tracking-[0.18em] uppercase text-[#87947B] font-semibold">
                  {active.badge}
                </span>
              </div>

              {/* Editorial Headline */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#292925] font-normal leading-[1.18] transition-all">
                {active.title}
              </h1>

              {/* Thoughtful Description */}
              <p className="text-xs sm:text-sm lg:text-[15px] text-[#57564F] leading-relaxed max-w-lg font-light">
                {active.description}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-4">
                <a
                  href="#katalog"
                  onClick={() => {
                    if (active.targetCategory !== "ALL") {
                      onSelectCategory(active.targetCategory);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#292925] text-white text-xs tracking-[0.14em] uppercase font-medium hover:bg-[#1A1A18] transition cursor-pointer"
                >
                  <span>{active.primaryCta}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
                </a>

                <a
                  href="#concerns"
                  className="inline-flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase font-medium text-[#292925] hover:text-[#87947B] transition py-3 underline underline-offset-4 decoration-[#EAE4DA] hover:decoration-[#87947B]"
                >
                  <span>Konsultasi Kebutuhan</span>
                </a>
              </div>
            </div>

            {/* Bottom Meta & Credentials */}
            <div className="pt-6 sm:pt-10 border-t border-[#EAE4DA] mt-6 flex items-center justify-between text-[11px] sm:text-xs text-[#57564F]">
              <div className="flex flex-col">
                <span className="font-medium text-[#292925]">{active.statBadge}</span>
                <span className="text-[10px] text-[#87947B]">{active.statSub}</span>
              </div>

              {/* Slide Counter: e.g. 01 / 04 */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs tracking-wider text-[#292925]">
                  0{currentSlide + 1} / 0{slides.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={onPrev}
                    aria-label="Slide Sebelumnya"
                    className="w-7 h-7 flex items-center justify-center border border-[#EAE4DA] hover:border-[#292925] text-[#292925] transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onNext}
                    aria-label="Slide Berikutnya"
                    className="w-7 h-7 flex items-center justify-center border border-[#EAE4DA] hover:border-[#292925] text-[#292925] transition"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic Editorial Product Imagery */}
          <div className="lg:col-span-6 relative aspect-[4/3] lg:aspect-auto overflow-hidden bg-[#EAE4DA]">
            {slides.map((slide, idx) => {
              const isCurrent = idx === currentSlide;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Subtle tonal film overlay */}
                  <div className="absolute inset-0 bg-[#292925]/5" />
                </div>
              );
            })}

            {/* Quick slide dots overlay on image */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-[#FAF8F4]/80 backdrop-blur-xs px-2.5 py-1 border border-[#EAE4DA]">
              {slides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => onSelectSlide(dotIdx)}
                  aria-label={`Slide ${dotIdx + 1}`}
                  className={`h-1 transition-all ${
                    dotIdx === currentSlide
                      ? "w-6 bg-[#292925]"
                      : "w-2 bg-[#87947B]/40 hover:bg-[#87947B]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
