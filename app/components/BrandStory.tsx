import { ShieldCheck, Leaf, Sparkles, Droplets } from "lucide-react";

export default function BrandStory() {
  return (
    <section id="philosophy" className="w-full bg-[#FAF8F4] py-12 sm:py-20 lg:py-24 border-b border-[#EAE4DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Column: Authentic Photography */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[16/11] sm:aspect-[4/5] bg-[#F5F1EB] border border-[#EAE4DA] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1000&auto=format&fit=crop&q=80"
                alt="Filosofi Bahan Baku BeautyCare"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 hidden sm:block p-4 bg-[#EAE4DA] border border-[#DCD3C5] max-w-[220px]">
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#87947B] block mb-1">
                Standar Formulasi
              </span>
              <p className="text-xs text-[#292925] font-serif leading-snug">
                Dikembangkan melalui uji klinis bersertifikasi BPOM untuk stabilitas iklim tropis.
              </p>
            </div>
          </div>

          {/* Right Column: Editorial Brand Narrative */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold tracking-[0.2em] text-[#87947B] uppercase block">
                Filosofi Kami
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#292925] font-normal tracking-tight leading-[1.15]">
                Integritas botani dipadukan dengan ketelitian dermatologis
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm lg:text-[15px] text-[#57564F] leading-relaxed font-light">
              <p>
                Kami memandang perawatan kulit bukan sebagai janji instan, melainkan sebagai komitmen mindful terhadap kesehatan jangka panjang skin barrier Anda.
              </p>
              <p>
                Setiap tetes serum, pembersih wajah, dan pelembap tubuh BeautyCare diformulasikan tanpa alkohol denat agresif dan tanpa pewangi sintetis berlebih. Kami memilih bahan aktif yang bekerja selaras dengan biologi alami kulit—terutama untuk menghadapi tantangan kelembapan tinggi, polusi perkotaan, dan paparan sinar matahari di Indonesia.
              </p>
            </div>

            {/* Credential Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-[#EAE4DA]">
              <div className="space-y-1">
                <ShieldCheck className="w-4 h-4 text-[#87947B]" />
                <h4 className="text-xs font-semibold text-[#292925] font-serif">BPOM Resmi</h4>
                <p className="text-[11px] text-[#57564F] font-light">Seluruh produk terdaftar &amp; teruji</p>
              </div>

              <div className="space-y-1">
                <Leaf className="w-4 h-4 text-[#87947B]" />
                <h4 className="text-xs font-semibold text-[#292925] font-serif">Ekstrak Botani</h4>
                <p className="text-[11px] text-[#57564F] font-light">Minyak argan &amp; bahan alami terukur</p>
              </div>

              <div className="space-y-1">
                <Droplets className="w-4 h-4 text-[#87947B]" />
                <h4 className="text-xs font-semibold text-[#292925] font-serif">Bebas Iritan</h4>
                <p className="text-[11px] text-[#57564F] font-light">Formula non-komedogenik ramah barier</p>
              </div>

              <div className="space-y-1">
                <Sparkles className="w-4 h-4 text-[#87947B]" />
                <h4 className="text-xs font-semibold text-[#292925] font-serif">Iklim Tropis</h4>
                <p className="text-[11px] text-[#57564F] font-light">Tekstur ringan menyerap tanpa lengket</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
