"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Droplets,
  Truck,
  MessageCircle,
} from "lucide-react";

interface FaqItem {
  id: number;
  category: "produk" | "pembayaran" | "pengiriman";
  question: string;
  answer: string;
  icon?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  Droplets,
  CreditCard,
  Sparkles,
  Truck,
};

export default function FaqSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [openId, setOpenId] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<"all" | "produk" | "pembayaran" | "pengiriman">("all");

  useEffect(() => {
    let isMounted = true;
    async function fetchFaqs() {
      try {
        setLoadingFaqs(true);
        const res = await fetch("/api/faq");
        if (!res.ok) throw new Error("Gagal mengambil FAQ");
        const data = await res.json();
        if (isMounted) setFaqs(data);
      } catch (err) {
        console.error("Error fetching FAQ via API, fallback to JSON:", err);
        try {
          const fallbackRes = await fetch("/data/faq.json");
          if (fallbackRes.ok && isMounted) {
            const data = await fallbackRes.json();
            setFaqs(data);
          }
        } catch {
          // ignore
        }
      } finally {
        if (isMounted) setLoadingFaqs(false);
      }
    }
    fetchFaqs();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFaqs = faqs.filter((item) => {
    if (activeTab === "all") return true;
    return item.category === activeTab;
  });

  const toggleFaq = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 scroll-mt-24">
      {/* Header */}
      <div className="text-center space-y-3 mb-10 sm:mb-12">
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#87947B]">
          Pertanyaan Umum
        </span>

        <h2 className="font-serif text-2xl sm:text-4xl text-[#292925] tracking-tight">
          Informasi Formulasi &amp; Layanan
        </h2>

        <p className="text-xs sm:text-sm text-[#292925]/70 max-w-lg mx-auto leading-relaxed font-sans">
          Panduan komprehensif mengenai sertifikasi BPOM, varian ukuran ml, metode pembayaran QRIS resmi, dan keamanan pengiriman.
        </p>

        {/* Minimalist Filter Tabs */}
        <div className="flex items-center justify-center gap-2 pt-4 overflow-x-auto scrollbar-none pb-1">
          {[
            { id: "all", label: "Semua Pertanyaan" },
            { id: "produk", label: "Formulasi & Ukuran ml" },
            { id: "pembayaran", label: "Pembayaran & Invoice" },
            { id: "pengiriman", label: "Pengiriman" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#292925] text-[#FAF8F4]"
                    : "bg-[#EAE4DA]/50 text-[#292925]/75 hover:bg-[#EAE4DA]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion List */}
      {loadingFaqs ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="border border-[#EAE4DA] p-5 bg-white animate-pulse flex items-center justify-between"
            >
              <div className="h-4 bg-[#EAE4DA] w-2/3" />
              <div className="w-5 h-5 bg-[#EAE4DA] rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            const Icon = (faq.icon && ICON_MAP[faq.icon]) ? ICON_MAP[faq.icon] : Sparkles;
            return (
              <div
                key={faq.id}
                className={`border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#87947B] shadow-xs"
                    : "bg-[#FAF8F4] border-[#EAE4DA] hover:border-[#87947B]/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? "bg-[#87947B] text-[#FAF8F4]"
                          : "bg-[#EAE4DA]/60 text-[#292925]/70 group-hover:bg-[#EAE4DA]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-medium tracking-wide transition-colors ${
                        isOpen ? "text-[#292925] font-semibold" : "text-[#292925] group-hover:text-[#87947B]"
                      }`}
                    >
                      {faq.question}
                    </span>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-[#EAE4DA] transition-transform duration-300 ${
                      isOpen
                        ? "bg-[#292925] text-[#FAF8F4] rotate-180"
                        : "bg-white text-[#292925]/60 group-hover:text-[#292925]"
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Collapsible Content */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#292925]/75 leading-relaxed border-t border-[#EAE4DA]/60 font-sans">
                      <p className="pt-3">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Understated Consultation Callout */}
      <div className="mt-12 p-6 sm:p-8 bg-[#EAE4DA]/30 border border-[#EAE4DA] flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
        <div className="space-y-1">
          <h4 className="font-serif text-base sm:text-lg text-[#292925]">
            Memerlukan Konsultasi Formulasi Khusus?
          </h4>
          <p className="text-xs text-[#292925]/70 font-sans">
            Tim beauty advisor kami siap membantu menyesuaikan produk dengan kondisi spesifik kulit Anda.
          </p>
        </div>

        <a
          href="https://wa.me/62881038322937?text=Halo%20BeautyCare,%20saya%20ingin%20konsultasi%20seputar%20formulasi%20produk"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-sm bg-[#292925] hover:bg-[#87947B] text-[#FAF8F4] font-medium text-xs tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#87947B] group-hover:text-[#FAF8F4]" />
          <span>Hubungi Konsultan</span>
        </a>
      </div>
    </section>
  );
}
