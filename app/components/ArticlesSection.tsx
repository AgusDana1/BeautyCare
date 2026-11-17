"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, UserCheck } from "lucide-react";
import { Article } from "../types/storefront";

interface ArticlesSectionProps {
  articles: Article[];
}

export default function ArticlesSection({ articles }: ArticlesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", "Tips Skincare", "Panduan Memilih", "Tren Makeup"];

  const filteredArticles = articles.filter((art) => {
    if (selectedCategory === "ALL") return true;
    return art.category === selectedCategory;
  });

  return (
    <section id="edukasi" className="py-12 sm:py-20 lg:py-24 bg-[#FAF8F4] border-t border-[#EAE4DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-14">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#EAE4DA]">
          <div className="space-y-2.5 max-w-2xl">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#87947B]">
              The Clinical Journal
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#292925] tracking-tight leading-tight">
              Edukasi Formulasi &amp; Kesehatan Kulit
            </h2>
            <p className="text-xs sm:text-sm text-[#292925]/70 leading-relaxed font-sans">
              Wawasan dermatologi berbasis bukti ilmiah, panduan layering bahan aktif, dan tips merawat keseimbangan barrier kulit di iklim tropis.
            </p>
          </div>

          {/* Minimalist Filter Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-[#292925] text-[#FAF8F4]"
                    : "bg-[#EAE4DA]/50 text-[#292925]/75 hover:bg-[#EAE4DA]"
                }`}
              >
                {cat === "ALL" ? "Semua Topik" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Editorial Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {filteredArticles.map((art) => (
            <article
              key={art.id}
              className="group flex flex-col justify-between bg-white border border-[#EAE4DA] rounded-sm overflow-hidden shadow-xs hover:border-[#87947B]/50 transition-all duration-300"
            >
              <div>
                <Link
                  href={`/article/${art.slug}`}
                  className="relative aspect-[16/11] overflow-hidden bg-[#EAE4DA] block cursor-pointer"
                >
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase bg-[#FAF8F4]/95 text-[#292925] border border-[#EAE4DA]">
                      {art.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-0.5 text-[10px] tracking-wide bg-[#292925]/85 text-[#FAF8F4] flex items-center gap-1 font-sans">
                      <Clock className="w-3 h-3 text-[#C99A91]" />
                      {art.readTimeMinutes} mnt baca
                    </span>
                  </div>
                </Link>

                <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-[#292925]/60 font-sans">
                    <span className="flex items-center gap-1 font-medium text-[#292925]">
                      <UserCheck className="w-3.5 h-3.5 text-[#87947B]" />
                      {art.authorName}
                    </span>
                    <span>•</span>
                    <span>{art.authorRole}</span>
                  </div>

                  <Link href={`/article/${art.slug}`} className="block">
                    <h3 className="font-serif text-lg sm:text-xl text-[#292925] group-hover:text-[#87947B] transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-[#292925]/70 line-clamp-3 leading-relaxed font-sans">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-[#EAE4DA]/60 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-[#292925]/50 font-sans">
                  BeautyCare Journal
                </span>
                <Link
                  href={`/article/${art.slug}`}
                  className="text-xs font-medium text-[#292925] hover:text-[#87947B] flex items-center gap-1.5 transition-colors group/link"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
