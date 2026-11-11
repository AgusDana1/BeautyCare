"use client";

import { useState, useEffect } from "react";
import {
  HelpCircle,
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
    <section id="faq" className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-16 scroll-mt-20">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/70 text-rose-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-2xs">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Pusat Tanya Jawab</span>
        </div>

        <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
          Pertanyaan yang Sering Diajukan
        </h2>

        <p className="text-[11px] sm:text-sm text-stone-500 max-w-xl mx-auto leading-relaxed">
          Temukan jawaban cepat seputar keaslian produk BPOM, filter varian ukuran (ml), metode pembayaran QRIS, invoice resmi, dan pengiriman BeautyCare.
        </p>

        {/* Category Tabs Filter */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-2 sm:pt-4 overflow-x-auto scrollbar-none pb-1">
          {[
            { id: "all", label: "Semua Pertanyaan" },
            { id: "produk", label: "Produk & Varian ml" },
            { id: "pembayaran", label: "Pembayaran & Invoice" },
            { id: "pengiriman", label: "Pengiriman" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-rose-600 text-white shadow-xs sm:shadow-md shadow-rose-600/25 scale-105"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion List with Dynamic Fluid Transitions */}
      {loadingFaqs ? (
        <div className="space-y-2.5 sm:space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl sm:rounded-3xl border border-stone-200/70 p-4 sm:p-5 bg-white/70 animate-pulse flex items-center justify-between"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-xl bg-stone-200" />
                <div className="h-4 bg-stone-200 rounded-md w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            const Icon = (faq.icon && ICON_MAP[faq.icon]) ? ICON_MAP[faq.icon] : Sparkles;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-white border-rose-300 shadow-md sm:shadow-lg shadow-rose-900/5 ring-1 ring-rose-500/20"
                    : "bg-white/90 border-stone-200/80 hover:border-stone-300 shadow-2xs hover:shadow-xs hover:bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-3.5 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <div
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-stone-100 text-stone-500 group-hover:bg-rose-50 group-hover:text-rose-600"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                        isOpen ? "text-rose-600" : "text-stone-900 group-hover:text-rose-600"
                      }`}
                    >
                      {faq.question}
                    </span>
                  </div>

                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "bg-rose-100 text-rose-600 rotate-180"
                        : "bg-stone-100 text-stone-400 group-hover:bg-stone-200"
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </button>

                {/* Collapsible Content */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-3.5 sm:px-5 pb-3.5 sm:pb-5 pt-0 text-[11px] sm:text-xs text-stone-600 leading-relaxed border-t border-stone-100 mt-1">
                      <p className="bg-stone-50/70 p-3 sm:p-3.5 rounded-xl border border-stone-200/50 mt-2">
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

      {/* Contact Support Banner Card */}
      <div className="mt-6 sm:mt-10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50 to-stone-50 border border-rose-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-2xs">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">
              Punya pertanyaan lain yang belum terjawab?
            </h4>
            <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5">
              Tim Customer Service kami siap melayani Anda setiap hari pukul 08.00 - 21.00 WIB.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/62881038322937?text=Halo%20BeautyCare,%20saya%20ingin%20bertanya%20seputar%20produk%20dan%20pemesanan"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] sm:text-xs shadow-md shadow-emerald-600/25 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Chat WhatsApp CS</span>
        </a>
      </div>
    </section>
  );
}
