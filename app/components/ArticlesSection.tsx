"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, UserCheck } from "lucide-react";
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
    <section id="edukasi" className="py-12 sm:py-20 bg-white border-t border-stone-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-rose-200/60">
              <BookOpen className="w-3.5 h-3.5 text-rose-600" />
              <span>Edukasi &amp; Panduan Kecantikan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Tips Kulit Sehat &amp; Tren Skincare 2026
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
              Ditulis dan dikurasi oleh dokter spesialis kulit dan pakar dermatologi untuk memandu Anda memilih formula yang tepat sesuai kebutuhan kulit.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat === "ALL" ? "Semua Artikel" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {filteredArticles.map((art) => (
            <article
              key={art.id}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <Link
                href={`/article/${art.slug}`}
                className="relative aspect-[16/10] overflow-hidden bg-stone-100 block cursor-pointer"
              >
                <img
                  src={art.coverImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full bg-white/95 backdrop-blur-xs text-rose-700 shadow-xs border border-rose-100">
                    {art.category}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {art.readTimeMinutes} mnt baca
                  </span>
                </div>
              </Link>

              <div className="p-4 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-stone-400">
                    <span className="flex items-center gap-1 font-medium text-stone-700">
                      <UserCheck className="w-3 h-3 text-rose-600" />
                      {art.authorName}
                    </span>
                    <span>•</span>
                    <span>{art.authorRole}</span>
                  </div>

                  <Link href={`/article/${art.slug}`} className="block">
                    <h3 className="font-extrabold text-sm sm:text-base text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </h3>
                  </Link>

                  <p className="text-[11px] sm:text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400">
                    BeautyCare Edukasi
                  </span>
                  <Link
                    href={`/article/${art.slug}`}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Baca Artikel</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
