"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Silakan masukkan alamat email yang valid.");
      return;
    }

    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 600);
  };

  return (
    <section className="py-16 sm:py-24 bg-[#EAE4DA]/40 border-t border-[#EAE4DA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#87947B]">
          Newsletter
        </span>

        <h2 className="font-serif text-2xl sm:text-4xl text-[#292925] tracking-tight">
          Thoughtful Dispatches on Skin Health
        </h2>

        <p className="text-xs sm:text-sm text-[#292925]/70 max-w-xl mx-auto leading-relaxed font-sans">
          Dapatkan riset bahan aktif terkini, panduan ritual musiman, dan akses privat ke peluncuran batch formulasi terbatas BeautyCare langsung di inbox Anda.
        </p>

        {status === "success" ? (
          <div className="p-4 bg-white border border-[#87947B] rounded-sm inline-flex items-center gap-2 text-xs sm:text-sm text-[#292925]">
            <Check className="w-4 h-4 text-[#87947B]" />
            <span>Terima kasih telah berlangganan. Silakan periksa inbox Anda untuk konfirmasi sambutan.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <div className="flex border border-[#292925]/30 bg-white focus-within:border-[#292925] transition-colors rounded-sm overflow-hidden">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Alamat email Anda..."
                className="w-full px-4 py-3 text-xs sm:text-sm text-[#292925] placeholder-[#292925]/40 outline-none bg-transparent font-sans"
                disabled={status === "loading"}
                required
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-5 py-3 bg-[#292925] hover:bg-[#87947B] text-[#FAF8F4] text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <span>{status === "loading" ? "Mendaftarkan..." : "Daftar"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {status === "error" && (
              <p className="text-[11px] text-[#C99A91] text-left">{errorMessage}</p>
            )}
            <p className="text-[11px] text-[#292925]/50 font-sans">
              Kami menghargai privasi Anda. Anda dapat berhenti berlangganan kapan saja.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
