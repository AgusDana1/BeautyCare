"use client";

import { Star, ShieldCheck, CheckCircle2 } from "lucide-react";

interface ReviewData {
  id: string;
  name: string;
  location: string;
  skinProfile: string;
  productUsed: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

const FEATURED_REVIEWS: ReviewData[] = [
  {
    id: "rev-1",
    name: "Dr. Rania K.",
    location: "Jakarta Selatan",
    skinProfile: "Sensitif • Barrier Compromised",
    productUsed: "Hydrating Barrier Serum 50ml",
    rating: 5,
    date: "14 Februari 2026",
    title: "Tekstur yang sangat menenangkan tanpa rasa lengket.",
    comment:
      "Sebagai praktisi medis yang sering berada di ruangan AC bersuhu rendah, serum ini memberikan hidrasi yang bertahan sepanjang hari. Ceramide dan Hyaluronic acid-nya diformulasikan dengan berat molekul yang tepat, menyerap tanpa memicu milia.",
    verified: true,
  },
  {
    id: "rev-2",
    name: "Nadira S.",
    location: "Surabaya",
    skinProfile: "Kombinasi • Rawan Kemerahan",
    productUsed: "Brightening Amino Cleanser 100ml",
    rating: 5,
    date: "2 Februari 2026",
    title: "Pembersih pertama yang tidak membuat kulit terasa tertarik.",
    comment:
      "Busa aminonya sangat lembut dan aromanya bersih natural tanpa parfum sintetis yang menyengat. Kulit terasa bersih menyeluruh tapi tetap elastis dan lembap saat dikeringkan.",
    verified: true,
  },
  {
    id: "rev-3",
    name: "Clarissa W.",
    location: "Bandung",
    skinProfile: "Kering Dehidrasi • Sensitif",
    productUsed: "Ceramide Moisture Lock Cream 50ml",
    rating: 5,
    date: "28 Januari 2026",
    title: "Hasil nyata dalam mengunci hidrasi setelah 3 minggu.",
    comment:
      "Flaky patches di area sekitar hidung dan pipi saya berangsur pulih. Teksturnya menyerupai butter ringan yang meleleh begitu diaplikasikan ke kulit. Sangat nyaman di bawah riasan harian.",
    verified: true,
  },
];

export default function CustomerReviewsSection() {
  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F4] border-t border-[#EAE4DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#EAE4DA]">
          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#87947B]">
              Verified Feedback
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#292925] tracking-tight">
              Catatan Pengalaman Pengguna
            </h2>
            <p className="text-xs sm:text-sm text-[#292925]/70 font-sans">
              Evaluasi autentik dari pengguna terverifikasi setelah menerapkan formulasi BeautyCare ke dalam ritual perawatan harian mereka.
            </p>
          </div>

          {/* Rating Summary Card */}
          <div className="flex items-center gap-4 bg-white border border-[#EAE4DA] p-4 rounded-sm shrink-0">
            <div className="text-center pr-4 border-r border-[#EAE4DA]">
              <span className="font-serif text-3xl font-bold text-[#292925] block">4.9</span>
              <div className="flex items-center gap-0.5 text-[#87947B] justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#87947B] text-[#87947B]" />
                ))}
              </div>
            </div>
            <div className="text-xs font-sans space-y-0.5">
              <span className="font-medium text-[#292925] block">98% Kepuasan Pengguna</span>
              <span className="text-[11px] text-[#292925]/60 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#87947B]" />
                Berdasarkan 500+ transaksi terverifikasi
              </span>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {FEATURED_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-[#EAE4DA] p-6 sm:p-7 flex flex-col justify-between space-y-5 rounded-sm hover:border-[#87947B]/60 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#87947B]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#87947B] text-[#87947B]" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#292925]/50 font-mono">{rev.date}</span>
                </div>

                <h3 className="font-serif text-base sm:text-lg text-[#292925] leading-snug">
                  &ldquo;{rev.title}&rdquo;
                </h3>

                <p className="text-xs text-[#292925]/75 leading-relaxed font-sans">
                  {rev.comment}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EAE4DA]/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#292925]">{rev.name}</span>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#87947B] font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#292925]/60 font-sans">
                  <span>{rev.skinProfile}</span>
                  <span className="text-[10px] text-[#292925]/50">{rev.location}</span>
                </div>
                <div className="text-[10px] font-mono text-[#87947B] pt-0.5">
                  Produk: {rev.productUsed}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
