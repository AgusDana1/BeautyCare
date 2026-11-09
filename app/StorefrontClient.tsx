"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  X,
  QrCode,
  CreditCard,
  Smartphone,
  Droplets,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";

interface Variant {
  id: number;
  productId: number;
  size: string;
  sizeValue: number | null;
  price: number;
  stock: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  price: number;
  stock: number;
  hasVariants: boolean;
  categoryId: number;
  category: Category;
  variants: Variant[];
}

interface Props {
  initialCategories: Category[];
  initialProducts: Product[];
}

const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1600&auto=format&fit=crop&q=85",
    badge: "Koleksi Eksklusif 2026 • Kemurnian Alami",
    title: "Kemurnian Perawatan Alami untuk Kulit Sehat Berseri",
    description:
      "Serum & formula dermatologis murni untuk hidrasi maksimal, mencerahkan pori, dan memperkuat skin barrier secara alami.",
    primaryCta: "Jelajahi Produk Pilihan",
    targetCategory: "ALL",
    statBadge: "Teruji Klinis BPOM",
    statSub: "Aman untuk Kulit Sensitif",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1600&auto=format&fit=crop&q=85",
    badge: "Pilihan Ukuran Fleksibel • Filter per ml",
    title: "Pilih Ukuran (ml) Favorit Sesuai Kebutuhan Anda",
    description:
      "Tiap produk dilengkapi varian ukuran 30ml, 50ml, hingga 100ml+ yang dapat dipilih langsung saat Anda mengklik Pesan Sekarang.",
    primaryCta: "Pesan Sesuai Ukuran",
    targetCategory: "serum-treatment",
    statBadge: "Pilihan 30ml - 400ml",
    statSub: "Harga & Stok Otomatis",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&auto=format&fit=crop&q=85",
    badge: "Pembayaran Praktis • Scan Barcode",
    title: "Transaksi Cepat via QRIS, Bank & E-Wallet",
    description:
      "Scan barcode QRIS langsung dari BCA Mobile, Livin, GoPay, OVO, DANA, atau ShopeePay dengan faktur invoice resmi siap cetak.",
    primaryCta: "Lihat Metode Pembayaran",
    targetCategory: "skincare",
    statBadge: "Scan QRIS Instan",
    statSub: "Invoice Resmi Otomatis",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1608248597359-2e650a259c63?w=1600&auto=format&fit=crop&q=85",
    badge: "Perawatan Tubuh & Rambut Mewah",
    title: "Kelembutan Velvet Lotion & Nutrisi Argan Alami",
    description:
      "Manjakan diri dengan aroma mewah tahan lama dan nutrisi pelembap mendalam untuk kelembutan tubuh dan rambut berkilau.",
    primaryCta: "Jelajahi Body & Hair Care",
    targetCategory: "body-care",
    statBadge: "Kelembapan 48 Jam",
    statSub: "Wangi Bunga Sakura Mewah",
  },
];

export default function StorefrontClient({
  initialCategories,
  initialProducts,
}: Props) {
  const router = useRouter();

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("recommended");

  // "Pesan Sekarang" Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Customer Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "BANK_TRANSFER" | "E_WALLET">("QRIS");
  const [notes, setNotes] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  // Slide navigation
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Auto-play slider with pause on hover
  useEffect(() => {
    if (isSliderPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isSliderPaused, nextSlide]);

  // Extract all available sizes across products for the global size filter
  const allSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    initialProducts.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.size) sizeSet.add(v.size);
      });
    });
    return Array.from(sizeSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });
  }, [initialProducts]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // Category Filter
        const matchesCategory =
          selectedCategory === "ALL" ||
          product.category.slug === selectedCategory ||
          product.categoryId.toString() === selectedCategory;

        // Search Filter
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Size (ml) Filter
        const matchesSize =
          selectedSizeFilter === "ALL" ||
          (product.hasVariants &&
            product.variants.some((v) => v.size.toLowerCase() === selectedSizeFilter.toLowerCase()));

        return matchesCategory && matchesSearch && matchesSize;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0; // recommended
      });
  }, [initialProducts, selectedCategory, searchQuery, selectedSizeFilter, sortBy]);

  // Open "Pesan Sekarang" Modal
  const handleOpenOrderModal = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setOrderError("");
    if (product.hasVariants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  };

  // Close Modal
  const handleCloseOrderModal = () => {
    setSelectedProduct(null);
    setSelectedVariant(null);
  };

  // Submit Order
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setOrderSubmitting(true);
    setOrderError("");

    try {
      const activePrice = selectedVariant ? selectedVariant.price : selectedProduct.price;

      const payload = {
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        paymentMethod,
        paymentChannel: paymentMethod === "QRIS" ? "QRIS All Payment" : paymentMethod,
        notes,
        items: [
          {
            productId: selectedProduct.id,
            variantId: selectedVariant ? selectedVariant.id : null,
            selectedSize: selectedVariant ? selectedVariant.size : null,
            quantity,
            price: activePrice,
          },
        ],
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses pesanan");
      }

      router.push(`/order/${data.invoiceNumber}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setOrderError(err.message);
      } else {
        setOrderError("Terjadi kesalahan sistem.");
      }
    } finally {
      setOrderSubmitting(false);
    }
  };

  const currentPrice = selectedVariant ? selectedVariant.price : selectedProduct?.price ?? 0;
  const currentStock = selectedVariant ? selectedVariant.stock : selectedProduct?.stock ?? 0;
  const totalPrice = currentPrice * quantity;

  return (
    <div className="min-h-screen bg-[#faf7f5] text-stone-800 flex flex-col selection:bg-rose-200">
      {/* Top Banner Announcement */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>
          Promo Spesial: Gratis Ongkir Seluruh Indonesia &amp; Diskon Pilihan Varian Ukuran (ml)
        </span>
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
      </div>

      {/* Navbar with Glassmorphism & Hover Animations */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-stone-200/60 shadow-xs transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform duration-300 hover:scale-105"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:rotate-6 transition-all duration-300">
              <Sparkles className="w-5 h-5 animate-pulse-glow" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-stone-900 group-hover:text-rose-600 transition-colors">
                BeautyCare<span className="text-rose-500">.</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-stone-400 font-semibold -mt-1">
                Aesthetic &amp; Skin
              </span>
            </div>
          </Link>

          {/* Nav links with animated underline expand */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-stone-600">
            <a
              href="#katalog"
              className="hover:text-rose-600 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-rose-500 hover:after:w-full after:transition-all after:duration-300"
            >
              Katalog Produk
            </a>
            <a
              href="#keunggulan"
              className="hover:text-rose-600 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-rose-500 hover:after:w-full after:transition-all after:duration-300"
            >
              Keunggulan
            </a>
            <a
              href="#cara-pesan"
              className="hover:text-rose-600 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-rose-500 hover:after:w-full after:transition-all after:duration-300"
            >
              Metode Pembayaran
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100/90 hover:bg-stone-200/90 hover:text-stone-900 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-2xs"
            >
              <span>Portal Admin</span>
            </Link>

            <a
              href="#katalog"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-rose-500/25 flex items-center gap-2 group cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-200" />
              <span>Belanja Sekarang</span>
            </a>
          </div>
        </div>
      </nav>

      {/* DYNAMIC BEAUTY SLIDER / CAROUSEL SECTION */}
      <section
        className="relative overflow-hidden w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12"
        onMouseEnter={() => setIsSliderPaused(true)}
        onMouseLeave={() => setIsSliderPaused(false)}
      >
        <div className="relative rounded-3xl sm:rounded-4xl overflow-hidden shadow-2xl border border-stone-200/70 aspect-[16/9] sm:aspect-[21/9] min-h-[460px] sm:min-h-[520px] bg-stone-900">
          {/* Slides */}
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {/* Background Image with slow subtle zoom */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={`w-full h-full object-cover object-center transition-transform duration-10000 ease-out ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                />

                {/* Aesthetic Dark Gradient Overlay for perfect readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/20" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-14 lg:px-20 max-w-3xl">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-300/40 text-rose-200 text-xs font-semibold w-fit mb-4 animate-fade-in-up">
                    <Sparkles className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
                    <span>{slide.badge}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.2] mb-3 drop-shadow-md animate-fade-in-up">
                    {slide.title}
                  </h1>

                  {/* Description */}
                  <p className="text-xs sm:text-sm lg:text-base text-stone-200 max-w-xl leading-relaxed mb-6 drop-shadow-xs animate-fade-in-up">
                    {slide.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 animate-fade-in-up">
                    <a
                      href="#katalog"
                      onClick={() => {
                        if (slide.targetCategory !== "ALL") {
                          setSelectedCategory(slide.targetCategory);
                        }
                      }}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                    >
                      <span>{slide.primaryCta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>

                    <a
                      href="#cara-pesan"
                      className="px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs sm:text-sm border border-white/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-rose-300" />
                      <span>Cara Bayar QRIS</span>
                    </a>
                  </div>

                  {/* Floating Stat Badge */}
                  <div className="mt-8 flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/60 backdrop-blur-md border border-white/10 text-white text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <div className="flex flex-col">
                        <span className="font-bold text-[11px] leading-tight">
                          {slide.statBadge}
                        </span>
                        <span className="text-[10px] text-stone-300 leading-tight">
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
            onClick={prevSlide}
            aria-label="Slide Sebelumnya"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-900/40 hover:bg-stone-900/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer group"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={nextSlide}
            aria-label="Slide Berikutnya"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-900/40 hover:bg-stone-900/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer group"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-stone-950/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
            {HERO_SLIDES.map((_, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Ke slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "w-7 bg-gradient-to-r from-rose-400 to-pink-500 shadow-xs"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Feature Highlights beneath Carousel */}
        <div id="keunggulan" className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-stone-200/70 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-stone-900">100% Original</div>
              <div className="text-[11px] text-stone-400">Garansi produk BPOM</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-stone-200/70 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-stone-900">Varian ml Fleksibel</div>
              <div className="text-[11px] text-stone-400">Pilih 30ml s/d 400ml</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-stone-200/70 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-stone-900">Scan QRIS Instan</div>
              <div className="text-[11px] text-stone-400">Semua Bank &amp; E-Wallet</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-stone-200/70 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-stone-900">Gratis Pengiriman</div>
              <div className="text-[11px] text-stone-400">Cepat &amp; Aman Terlindungi</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT CATALOG & FILTERS SECTION */}
      <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="space-y-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
                Koleksi Perawatan Terbaik
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
                Katalog Produk BeautyCare
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Gunakan filter kategori, pencarian, dan filter ukuran (ml) di bawah ini.
              </p>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <SlidersHorizontal className="w-4 h-4 text-stone-400" />
              <span className="text-xs font-medium text-stone-600">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-medium"
              >
                <option value="recommended">Paling Direkomendasikan</option>
                <option value="price-low">Harga: Rendah ke Tinggi</option>
                <option value="price-high">Harga: Tinggi ke Rendah</option>
                <option value="name">Nama Produk (A - Z)</option>
              </select>
            </div>
          </div>

          {/* SEARCH & FILTER BAR */}
          <div className="space-y-4">
            {/* 1. Search Bar */}
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Cari produk perawatan kulit, serum, cleanser..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-white border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-2xs transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 2. Category Filter Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Filter Kategori:
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {filteredProducts.length} produk ditemukan
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("ALL")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                    selectedCategory === "ALL"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                      : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  Semua Kategori
                </button>
                {initialCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                        isSelected
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                          : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Filter per ml tiap product */}
            <div className="p-3.5 bg-white/80 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                <Droplets className="w-3.5 h-3.5 text-rose-500" />
                <span>Filter Ukuran (ml):</span>
                <span className="text-[11px] text-stone-400 font-normal">
                  (Khusus produk yang memiliki varian ml)
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSizeFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                    selectedSizeFilter === "ALL"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Semua Ukuran
                </button>
                {allSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSizeFilter(size)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                      selectedSizeFilter === size
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PRODUCT GRID with Hover Animations */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-stone-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">
                Tidak ada produk yang cocok
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau sesuaikan filter kategori dan filter ukuran ml Anda.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSearchQuery("");
                  setSelectedSizeFilter("ALL");
                }}
                className="mt-2 text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const hasVariants = product.hasVariants && product.variants.length > 0;
                const minPrice = hasVariants
                  ? Math.min(...product.variants.map((v) => v.price))
                  : product.price;

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-2xl hover:shadow-rose-900/10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Image & Badges */}
                    <div className="relative aspect-square overflow-hidden bg-stone-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 font-bold text-2xl">
                          BeautyCare
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-white/90 backdrop-blur-xs text-stone-800 shadow-sm border border-stone-100">
                          {product.category.name}
                        </span>
                      </div>

                      {/* Stock Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full shadow-xs ${
                            product.stock === 0
                              ? "bg-red-500 text-white"
                              : product.stock < 10
                              ? "bg-amber-500 text-white"
                              : "bg-emerald-600/90 text-white"
                          }`}
                        >
                          {product.stock === 0 ? "Habis" : `Tersedia ${product.stock}`}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-bold text-stone-900 text-base group-hover:text-rose-600 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Available Sizes preview badge */}
                        <div className="pt-1">
                          {hasVariants ? (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] text-stone-400 font-medium">
                                Ukuran:
                              </span>
                              {product.variants.map((v) => (
                                <span
                                  key={v.id}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/50"
                                >
                                  {v.size}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-stone-400 italic">
                              Ukuran Standar (Single Size)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-stone-400 block font-medium">
                            {hasVariants ? "Mulai dari" : "Harga"}
                          </span>
                          <span className="font-extrabold text-stone-900 text-base font-mono">
                            Rp {minPrice.toLocaleString("id-ID")}
                          </span>
                        </div>

                        {/* "Pesan Sekarang" Button with Hover Animation */}
                        <button
                          onClick={() => handleOpenOrderModal(product)}
                          disabled={product.stock === 0}
                          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-md shadow-rose-600/25 hover:shadow-lg hover:shadow-rose-600/40 hover:scale-105 transition-all duration-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>Pesan Sekarang</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* PAYMENT METHODS & TRUST SECTION */}
      <section id="cara-pesan" className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-stone-200/80">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
              Kemudahan Pembayaran
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              Mendukung Pembayaran QRIS, Bank Transfer &amp; E-Wallet
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto">
              Scan barcode langsung dari HP Anda atau transfer melalui rekening bank terpercaya.
              Invoice resmi akan otomatis dibuat dan siap dicetak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/80 hover:border-purple-200 hover:shadow-md transition-all duration-300 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">QRIS (Barcode Scan)</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Scan barcode QRIS resmi yang bisa dibayar melalui aplikasi apa saja: GoPay, OVO, DANA, BCA Mobile, Livin Mandiri, ShopeePay.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/80 hover:border-blue-200 hover:shadow-md transition-all duration-300 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">Transfer Bank Resmi</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Transfer mudah melalui BCA, Mandiri, BNI, dan BRI dengan verifikasi aman dan konfirmasi nomor faktur otomatis.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/80 hover:border-rose-200 hover:shadow-md transition-all duration-300 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">Dompet Digital (E-Wallet)</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Kirim pembayaran praktis lewat saldo DANA, GoPay, ShopeePay, atau OVO tanpa biaya admin tambahan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white text-sm">BeautyCare Indonesia</span>
          </div>

          <p className="text-center sm:text-left">
            © 2026 BeautyCare. Hak Cipta Dilindungi. Solusi perawatan kulit dan kecantikan terpercaya.
          </p>

          <Link
            href="/admin/login"
            className="hover:text-white transition-colors underline underline-offset-4"
          >
            Masuk sebagai Admin
          </Link>
        </div>
      </footer>

      {/* "PESAN SEKARANG" MODAL WITH FILTER PER ML */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={handleCloseOrderModal}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-4 border-b border-stone-100">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                Formulir Pemesanan Langsung
              </span>
              <h3 className="text-lg font-extrabold text-stone-900 mt-0.5">
                Pesan {selectedProduct.name}
              </h3>
            </div>

            {orderError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {orderError}
              </div>
            )}

            <form onSubmit={handleConfirmOrder} className="mt-5 space-y-5 text-xs">
              {/* Product preview */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                {selectedProduct.image && (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200"
                  />
                )}
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{selectedProduct.name}</h4>
                  <span className="text-stone-500 block">{selectedProduct.category.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono font-bold text-rose-600 text-sm">
                      Rp {currentPrice.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      (Stok: {currentStock} pcs)
                    </span>
                  </div>
                </div>
              </div>

              {/* FILTER PER ML JIKA PRODUK MEMILIKI VARIAN ML */}
              {selectedProduct.hasVariants && selectedProduct.variants.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-stone-800 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-rose-600" />
                      <span>Pilih Ukuran / Varian (ml):</span>
                    </label>
                    <span className="text-[11px] text-rose-700 font-semibold">
                      {selectedVariant?.size} terpilih
                    </span>
                  </div>

                  {/* Interactive ML Variant Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {selectedProduct.variants.map((v) => {
                      const isChosen = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`p-2.5 rounded-xl text-left border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                            isChosen
                              ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/25"
                              : "bg-white text-stone-700 border-stone-200 hover:border-rose-300"
                          }`}
                        >
                          <div className="font-bold text-xs">{v.size}</div>
                          <div
                            className={`font-mono text-[11px] ${
                              isChosen ? "text-rose-100" : "text-stone-500"
                            }`}
                          >
                            Rp {v.price.toLocaleString("id-ID")}
                          </div>
                          <div
                            className={`text-[10px] mt-0.5 ${
                              isChosen ? "text-rose-200" : "text-stone-400"
                            }`}
                          >
                            Stok: {v.stock}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-700">Jumlah Pesanan:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-sm font-mono">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center justify-center transition cursor-pointer disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Customer Inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rina Melati"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      No. WhatsApp / HP <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="rina@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Alamat Pengiriman Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota & Kode Pos"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Pilih Metode Pembayaran <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("QRIS")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                        paymentMethod === "QRIS"
                          ? "bg-purple-50 border-purple-500 text-purple-800 font-bold shadow-xs"
                          : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-purple-600" />
                      <span className="text-[11px]">QRIS (Scan)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("BANK_TRANSFER")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                        paymentMethod === "BANK_TRANSFER"
                          ? "bg-blue-50 border-blue-500 text-blue-800 font-bold shadow-xs"
                          : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span className="text-[11px]">Bank Transfer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("E_WALLET")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                        paymentMethod === "E_WALLET"
                          ? "bg-rose-50 border-rose-500 text-rose-800 font-bold shadow-xs"
                          : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-rose-600" />
                      <span className="text-[11px]">E-Wallet</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Catatan Pesanan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Titipkan di satpam jika tidak ada orang"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-400 block font-medium">
                    Total Pembayaran
                  </span>
                  <span className="text-lg font-black text-rose-600 font-mono">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={orderSubmitting || currentStock === 0}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-lg shadow-rose-600/30 hover:scale-105 transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {orderSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Konfirmasi &amp; Bayar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
