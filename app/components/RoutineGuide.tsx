import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function RoutineGuide() {
  const steps = [
    {
      num: "01",
      step: "Pembersihan Lembut",
      title: "Bersihkan tanpa mengikis barier asam kulit",
      description:
        "Gunakan Brightening Amino Cleanser pada pagi dan malam hari. Busa mikro asam amino mengangkat partikel debu halus dan residu sebum dengan pH 5.5 yang menjaga mikrobioma alami.",
      tips: "Basuh dengan air suam-suam kuku, tepuk lembut dengan handuk bersih.",
    },
    {
      num: "02",
      step: "Perawatan Terarah",
      title: "Penyerapan konsentrat aktif pada kulit lembap",
      description:
        "Aplikasikan 2–3 tetes Hydrating Barrier Serum saat kulit masih sedikit lembap. Molekul Ceramide dan Hyaluronic Acid berkepadatan ganda meresap hingga lapisan epidermis terdalam.",
      tips: "Berikan jeda 60 detik sebelum melanjutkan ke tahap penguncian.",
    },
    {
      num: "03",
      step: "Penguncian & Proteksi UV",
      title: "Kunci hidrasi dan tangkal sinar UVA/UVB",
      description:
        "Kunci nutrisi dengan velvet moisturizer dan selalu akhiri rutinitas pagi dengan tabir surya SPF 50+ PA++++ untuk mencegah degradasi kolagen akibat sinar ultraviolet.",
      tips: "Ulangi pengaplikasian tabir surya jika beraktivitas luar ruangan intensif.",
    },
  ];

  return (
    <section id="ritual" className="w-full bg-[#FAF8F4] py-16 sm:py-24 border-b border-[#EAE4DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EAE4DA] pb-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-semibold tracking-[0.2em] text-[#87947B] uppercase block mb-1">
              Panduan Edukasi
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#292925] font-normal tracking-tight">
              Ritual Tiga Langkah Menuju Kulit Seimbang
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#57564F] max-w-sm font-light leading-relaxed">
            Perawatan kulit terbaik tidak memerlukan puluhan lapis produk, melainkan konsistensi pada formula berkualitas tinggi.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((st) => (
            <div
              key={st.num}
              className="p-6 sm:p-8 bg-[#F5F1EB] border border-[#EAE4DA] flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <span className="font-mono text-2xl font-light text-[#87947B] block">
                  {st.num}
                </span>
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-[#57564F] block">
                    {st.step}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-[#292925] mt-1 leading-snug">
                    {st.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#57564F] font-light leading-relaxed">
                  {st.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EAE4DA]">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#87947B] block mb-0.5">
                  Anjuran Dokter Kulit:
                </span>
                <p className="text-xs text-[#292925] font-light italic">
                  &ldquo;{st.tips}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Link to Dermatologist Journal */}
        <div className="text-center pt-2">
          <Link
            href="/#edukasi"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-[#292925] hover:text-[#87947B] transition underline underline-offset-4 decoration-[#EAE4DA] hover:decoration-[#87947B]"
          >
            <span>Baca Artikel Klinis &amp; Jurnal Dokter Kulit</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
