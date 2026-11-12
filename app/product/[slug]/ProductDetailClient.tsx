"use client";

import { useState, useMemo, useSyncExternalStore, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Store,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Play,
  X,
  Heart,
  ShoppingCart,
  Zap,
  ThumbsUp,
  Image as ImageIcon,
  Video as VideoIcon,
  Award,
  Camera,
} from "lucide-react";
import {
  Product,
  Variant,
  CartItem,
  PaymentMethod,
  Review,
} from "@/app/types/storefront";
import {
  subscribeCart,
  getCartSnapshot,
  getCartServerSnapshot,
  saveStoredCart,
  formatRupiah,
} from "@/lib/cart";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import CartDrawer from "@/app/components/CartDrawer";
import OrderModal from "@/app/components/OrderModal";
import CustomerAuthModal from "@/app/components/CustomerAuthModal";

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const router = useRouter();

  // Cart Sync
  const cartJson = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot
  );
  const cart: CartItem[] = useMemo(() => {
    try {
      return JSON.parse(cartJson);
    } catch {
      return [];
    }
  }, [cartJson]);

  const totalCartItems = useMemo(
    () => cart.reduce((acc, it) => acc + it.quantity, 0),
    [cart]
  );

  // Variant selection
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"desc" | "ingredients" | "safety">("desc");

  // Customer session state
  const [customer, setCustomer] = useState<{
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    points: number;
    purchasedProductIds: number[];
  } | null>(null);
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [notPurchasedAlertOpen, setNotPurchasedAlertOpen] = useState(false);

  // Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewVariant, setReviewVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0].size : "Ukuran Standar"
  );
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMediaType, setReviewMediaType] = useState<"image" | "video">("image");
  const [reviewMediaUrl, setReviewMediaUrl] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewErrorMessage, setReviewErrorMessage] = useState("");
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState("");

  // Checkout form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [notes, setNotes] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const fetchCustomerSession = async () => {
    try {
      const res = await fetch("/api/customer/me");
      const data = await res.json();
      if (res.ok && data.customer) {
        setCustomer(data.customer);
        if (data.customer.name) setCustomerName(data.customer.name);
        if (data.customer.email) setCustomerEmail(data.customer.email);
        if (data.customer.phone) setCustomerPhone(data.customer.phone);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const res = await fetch("/api/customer/me");
        if (!isMounted) return;
        const data = await res.json();
        if (res.ok && data.customer) {
          setCustomer(data.customer);
          if (data.customer.name) setCustomerName(data.customer.name);
          if (data.customer.email) setCustomerEmail(data.customer.email);
          if (data.customer.phone) setCustomerPhone(data.customer.phone);
        } else {
          setCustomer(null);
        }
      } catch {
        if (isMounted) setCustomer(null);
      }
    };

    void init();

    const handleUpdate = () => {
      fetchCustomerSession();
    };
    window.addEventListener("beautycare-customer-updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("beautycare-customer-updated", handleUpdate);
    };
  }, []);

  const handleOpenWriteReview = () => {
    if (!customer) {
      setIsCustomerAuthOpen(true);
      return;
    }

    const hasPurchased = customer.purchasedProductIds?.includes(product.id);
    if (!hasPurchased) {
      setNotPurchasedAlertOpen(true);
      return;
    }

    setReviewRating(5);
    setReviewComment("");
    setReviewMediaUrl("");
    setReviewErrorMessage("");
    setReviewSuccessMessage("");
    setIsWriteReviewOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewErrorMessage("");
    setReviewSuccessMessage("");

    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          selectedVariant: reviewVariant,
          mediaUrl: reviewMediaUrl,
          mediaType: reviewMediaType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim ulasan.");
      }

      setReviewSuccessMessage("Ulasan & penilaian produk Anda berhasil dikirim!");
      if (data.review) {
        setReviewsList((prev) => [data.review, ...prev]);
      }
      setTimeout(() => {
        setIsWriteReviewOpen(false);
        setReviewSuccessMessage("");
      }, 1500);
    } catch (err: unknown) {
      setReviewErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim ulasan."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Review filters & media modal
  const [reviewFilter, setReviewFilter] = useState<"ALL" | "MEDIA" | "5_STAR" | "4_STAR">("ALL");
  const [activeMediaModal, setActiveMediaModal] = useState<{
    url: string;
    type: "image" | "video";
    reviewer: string;
    comment: string;
  } | null>(null);

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderModalProduct, setOrderModalProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Pricing calculations
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const potentialPoints = Math.floor(currentPrice / 1000);
  const potentialDiscount = potentialPoints * 100;

  // Review stats
  const reviews: Review[] = reviewsList;
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        ).toFixed(1)
      : "5.0";

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (reviewFilter === "MEDIA") return !!r.mediaUrl;
      if (reviewFilter === "5_STAR") return r.rating === 5;
      if (reviewFilter === "4_STAR") return r.rating === 4;
      return true;
    });
  }, [reviews, reviewFilter]);

  const mediaReviews = useMemo(
    () => reviews.filter((r) => !!r.mediaUrl),
    [reviews]
  );

  // Gallery images (product image + review images/previews)
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
    // secondary visual variants
    if (product.category.slug.includes("serum")) {
      list.push(
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80"
      );
      list.push(
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80"
      );
    } else {
      list.push(
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80"
      );
      list.push(
        "https://images.unsplash.com/photo-1643716991736-b83d4bf474b4?w=800&auto=format&fit=crop&q=80"
      );
    }
    return list;
  }, [product]);

  // Cart operations
  const handleAddToCart = (
    prod: Product = product,
    variant: Variant | null = selectedVariant,
    qty: number = quantity
  ) => {
    const itemPrice = variant ? variant.price : prod.price;
    const vId = variant ? variant.id : null;
    const vSize = variant ? variant.size : null;

    const existingIdx = cart.findIndex(
      (it) => it.productId === prod.id && it.variantId === vId
    );

    let nextCart: CartItem[];
    if (existingIdx > -1) {
      nextCart = [...cart];
      nextCart[existingIdx] = {
        ...nextCart[existingIdx],
        quantity: nextCart[existingIdx].quantity + qty,
      };
    } else {
      nextCart = [
        ...cart,
        {
          productId: prod.id,
          productName: prod.name,
          productImage: prod.image,
          variantId: vId,
          selectedSize: vSize,
          price: itemPrice,
          quantity: qty,
        },
      ];
    }
    saveStoredCart(nextCart);
    showToast(`✓ Berhasil menambahkan ${qty}x ${prod.name} (${vSize || "Standard"}) ke keranjang!`);
  };

  const handleOpenOrderModal = (prod: Product) => {
    setOrderModalProduct(prod);
  };

  const handleDirectBuy = () => {
    setOrderModalProduct(product);
  };

  const totalCartPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleUpdateCartQty = (idx: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(idx);
      return;
    }
    const next = [...cart];
    next[idx] = { ...next[idx], quantity: newQty };
    saveStoredCart(next);
  };

  const handleRemoveCartItem = (idx: number) => {
    const next = cart.filter((_, i) => i !== idx);
    saveStoredCart(next);
  };

  const handleCartSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setOrderSubmitting(true);
    setOrderError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail: customerEmail || null,
          customerAddress,
          paymentMethod,
          notes: notes || null,
          items: cart.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat pesanan.");
      }

      saveStoredCart([]);
      setIsCartOpen(false);
      router.push(`/order/${data.invoiceNumber}`);
    } catch (err: unknown) {
      setOrderError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleSingleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderModalProduct) return;
    setOrderSubmitting(true);
    setOrderError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail: customerEmail || null,
          customerAddress,
          paymentMethod,
          notes: notes || null,
          items: [
            {
              productId: orderModalProduct.id,
              variantId: selectedVariant?.id || null,
              quantity: quantity,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat pesanan.");
      }

      setOrderModalProduct(null);
      router.push(`/order/${data.invoiceNumber}`);
    } catch (err: unknown) {
      setOrderError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f5] text-stone-900 font-sans antialiased">
      {/* Navbar with reactive cart counter */}
      <Navbar
        totalCartItems={totalCartItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-[70] bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700/50 flex items-center gap-2.5 text-xs sm:text-sm animate-bounce">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <nav className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-stone-500 font-medium overflow-x-auto">
          <Link href="/" className="hover:text-rose-600 transition shrink-0">
            Beranda
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
          <Link
            href={`/#katalog`}
            className="hover:text-rose-600 transition shrink-0"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
          <span className="text-stone-800 font-semibold truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Main Product Showcase Section */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* LEFT: Image Gallery with Interactive Thumbnails */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-md group">
              <img
                src={galleryImages[activeImageIndex] || product.image || ""}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />

              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full bg-white/95 backdrop-blur-xs text-stone-800 shadow-xs border border-stone-100 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  BPOM Terverifikasi
                </span>
                <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full bg-rose-600 text-white shadow-xs">
                  {product.category.name}
                </span>
              </div>

              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-xs transition shadow-xs cursor-pointer ${
                  isLiked
                    ? "bg-rose-50 text-rose-600"
                    : "bg-white/80 text-stone-600 hover:text-rose-600 hover:bg-white"
                }`}
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isLiked ? "fill-rose-600 text-rose-600" : ""
                  }`}
                />
              </button>
            </div>

            {/* Thumbnail Carousel Strip */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-rose-500 shadow-sm scale-102"
                      : "border-stone-200 hover:border-stone-300 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Guarantees Box */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-stone-200/80 grid grid-cols-3 gap-2 text-center text-[10px] sm:text-xs text-stone-600">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-stone-800">100% Original</span>
                <span className="text-[9px] text-stone-400">Garansi Pabrik</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-stone-100">
                <Truck className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-stone-800">Gratis Ongkir</span>
                <span className="text-[9px] text-stone-400">Seluruh Wilayah</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-stone-800">Garansi 7 Hari</span>
                <span className="text-[9px] text-stone-400">Uang Kembali</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Information, Seller Card, Variant Selection */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Rating & Review Header Snippet */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-stone-600">
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 font-bold text-amber-700">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{avgRating}</span>
                </div>
                <a
                  href="#ulasan"
                  className="text-stone-500 hover:text-rose-600 underline font-medium"
                >
                  {reviewCount} Penilaian Pembeli
                </a>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500">
                  <strong className="text-stone-800">150+</strong> Produk Terjual
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                  Stok: {currentStock > 0 ? `${currentStock} pcs siap kirim` : "Habis"}
                </span>
              </div>
            </div>

            {/* Dynamic Price Display */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50/80 via-pink-50/40 to-stone-50 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] sm:text-xs font-semibold text-rose-700 uppercase tracking-wider block">
                  Harga Spesial BeautyCare
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-rose-600 font-mono tracking-tight">
                    {formatRupiah(currentPrice)}
                  </span>
                  <span className="text-xs sm:text-sm text-stone-400 line-through">
                    {formatRupiah(currentPrice * 1.25)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                    Hemat 20%
                  </span>
                </div>
              </div>

              {/* Loyalty Reward Preview */}
              <div className="bg-white/90 p-2.5 sm:p-3 rounded-xl border border-rose-200/70 shadow-2xs text-[11px] sm:text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                <div>
                  <span className="font-bold text-stone-800 block">
                    +{potentialPoints} Poin Loyalty
                  </span>
                  <span className="text-[10px] text-stone-500">
                    Diskon {formatRupiah(potentialDiscount)} belanja berikutnya
                  </span>
                </div>
              </div>
            </div>

            {/* SELLER CARD: "Akun yang Menjual atau Penjual dari Produk Tersebut" */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-rose-300 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                    <Store className="w-6 h-6 text-white" />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" title="Online" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-xs sm:text-sm text-stone-900">
                        {product.sellerName || "BeautyCare Official Store"}
                      </h4>
                      <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 flex items-center gap-0.5">
                        <Award className="w-3 h-3 text-rose-600" />
                        {product.sellerBadge || "Official Store Terverifikasi"}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <strong className="text-stone-800">
                          {product.sellerRating || "4.9 / 5.0"}
                        </strong>{" "}
                        (Rating Toko)
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {product.sellerCity || "Jakarta Selatan"}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        Respon: {product.sellerResponse || "± 5 Menit"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                  <a
                    href={`https://wa.me/6281234567890?text=Halo%20BeautyCare,%20saya%20ingin%20bertanya%20tentang%20produk%20${encodeURIComponent(
                      product.name
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat Penjual</span>
                  </a>
                </div>
              </div>
            </div>

            {/* VARIANT SELECTOR: ML SIZES (30ml, 50ml, 100ml) */}
            {product.hasVariants && product.variants.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-stone-800">
                    Pilih Varian Ukuran (ml):
                  </span>
                  <span className="text-[10px] sm:text-xs text-rose-600 font-semibold">
                    {selectedVariant?.size || "Pilih satu"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-rose-50 border-rose-500 text-rose-900 shadow-sm"
                            : "bg-white border-stone-200 hover:border-stone-300 text-stone-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs sm:text-sm">
                            {v.size}
                          </span>
                          {isSelected && (
                            <CheckCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs font-mono font-bold block mt-0.5 text-stone-900">
                          {formatRupiah(v.price)}
                        </span>
                        <span className="text-[9px] text-stone-400 block">
                          Sisa {v.stock} pcs
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUANTITY & ACTIONS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs sm:text-sm font-bold text-stone-800">
                  Jumlah:
                </span>
                <div className="flex items-center border border-stone-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 font-bold text-xs sm:text-sm font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] sm:text-xs text-stone-400">
                  Subtotal:{" "}
                  <strong className="text-stone-900 font-mono">
                    {formatRupiah(currentPrice * quantity)}
                  </strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleAddToCart(product, selectedVariant, quantity)}
                  disabled={currentStock === 0}
                  className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border-2 border-rose-500 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4 text-rose-600" />
                  <span>+ Keranjang</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectBuy}
                  disabled={currentStock === 0}
                  className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Beli Sekarang</span>
                </button>
              </div>
            </div>

            {/* TABBED DETAILS: Description, Ingredients, Safety */}
            <div className="pt-4 border-t border-stone-200">
              <div className="flex border-b border-stone-200 gap-4 sm:gap-6 text-xs sm:text-sm font-bold">
                <button
                  onClick={() => setActiveTab("desc")}
                  className={`pb-2.5 transition relative cursor-pointer ${
                    activeTab === "desc"
                      ? "text-rose-600 border-b-2 border-rose-600"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Deskripsi &amp; Manfaat
                </button>
                <button
                  onClick={() => setActiveTab("ingredients")}
                  className={`pb-2.5 transition relative cursor-pointer ${
                    activeTab === "ingredients"
                      ? "text-rose-600 border-b-2 border-rose-600"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Kandungan &amp; Cara Pakai
                </button>
                <button
                  onClick={() => setActiveTab("safety")}
                  className={`pb-2.5 transition relative cursor-pointer ${
                    activeTab === "safety"
                      ? "text-rose-600 border-b-2 border-rose-600"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Sertifikasi &amp; Keamanan
                </button>
              </div>

              <div className="py-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
                {activeTab === "desc" && (
                  <div className="space-y-3">
                    <p>{product.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                        <span className="font-bold text-stone-900 block text-xs">
                          ✨ Manfaat Utama:
                        </span>
                        <ul className="list-disc list-inside text-stone-600 text-[11px] sm:text-xs mt-1 space-y-1">
                          <li>Menenangkan kemerahan dan iritasi kulit</li>
                          <li>Mengunci kelembapan hingga 48 jam</li>
                          <li>Mempercepat regenerasi skin barrier alami</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                        <span className="font-bold text-stone-900 block text-xs">
                          🎯 Cocok Untuk Jenis Kulit:
                        </span>
                        <p className="text-[11px] sm:text-xs text-stone-600 mt-1">
                          Kulit kering, sensitif, berjerawat ringan, kombinasi, dan aman untuk ibu hamil &amp; menyusui.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "ingredients" && (
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-bold text-stone-900 text-xs sm:text-sm mb-1">
                        Kandungan Aktif Unggulan:
                      </h5>
                      <p className="text-[11px] sm:text-xs text-stone-600">
                        Water, Niacinamide 5%, Ceramide NP, Centella Asiatica Leaf Extract, Sodium Hyaluronate 4D, Panthenol (Pro-Vitamin B5), Glycerin, Tocopherol, Phenoxyethanol.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                      <h5 className="font-bold text-rose-900 text-xs sm:text-sm mb-1">
                        Petunjuk Pemakaian Harian:
                      </h5>
                      <ol className="list-decimal list-inside text-[11px] sm:text-xs text-rose-800 space-y-1">
                        <li>Bersihkan wajah dengan cleanser lembut BeautyCare.</li>
                        <li>Teteskan 2-3 tetes serum secara merata pada wajah dan leher.</li>
                        <li>Tepuk-tepuk perlahan hingga meresap sempurna sebelum pelembap.</li>
                        <li>Gunakan pagi dan malam hari untuk hasil optimal.</li>
                      </ol>
                    </div>
                  </div>
                )}

                {activeTab === "safety" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900">
                        <span className="font-bold text-xs sm:text-sm block">
                          No. Registrasi BPOM RI
                        </span>
                        <span className="font-mono text-xs font-extrabold block mt-0.5">
                          NA18230104829
                        </span>
                        <span className="text-[10px] text-emerald-700 mt-0.5 block">
                          Resmi terdaftar di Badan Pengawas Obat dan Makanan
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-900">
                        <span className="font-bold text-xs sm:text-sm block">
                          Sertifikasi Halal MUI
                        </span>
                        <span className="font-mono text-xs font-extrabold block mt-0.5">
                          ID00110000452391022
                        </span>
                        <span className="text-[10px] text-purple-700 mt-0.5 block">
                          100% Bebas Paraben, Cruelty-Free, Non-Comedogenic
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: BUYER REVIEWS & DOCUMENTATION (Bintang & Foto / Video Pembeli) */}
        <section id="ulasan" className="mt-12 sm:mt-16 pt-8 border-t border-stone-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold text-rose-600 uppercase tracking-wider block">
                  Ulasan &amp; Bukti Nyata Pembeli
                </span>
                {customer && customer.purchasedProductIds?.includes(product.id) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Buyer
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
                Dokumentasi Pembeli &amp; Penilaian Bintang
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Penilaian produk hanya dapat diberikan oleh customer yang telah membeli produk ini untuk menjaga keaslian ulasan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Tombol Tulis Penilaian */}
              <button
                type="button"
                onClick={handleOpenWriteReview}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span>Tulis Penilaian Produk</span>
              </button>

              {/* Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 bg-stone-100 p-1 rounded-xl">
                <button
                  onClick={() => setReviewFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer ${
                    reviewFilter === "ALL"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Semua ({reviews.length})
                </button>
                <button
                  onClick={() => setReviewFilter("MEDIA")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    reviewFilter === "MEDIA"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <VideoIcon className="w-3 h-3" />
                  <span>Media ({mediaReviews.length})</span>
                </button>
                <button
                  onClick={() => setReviewFilter("5_STAR")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer ${
                    reviewFilter === "5_STAR"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  ⭐ 5
                </button>
              </div>
            </div>
          </div>

          {/* DOKUMENTASI MEDIA GALLERY (FOTO & VIDEO PEMBELI) */}
          {mediaReviews.length > 0 && (
            <div className="mb-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-stone-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                    <VideoIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-stone-900">
                      Galeri Foto &amp; Video Asli Pembeli
                    </h3>
                    <p className="text-[10px] text-stone-500">
                      Klik untuk menonton video pemakaian atau melihat foto tekstur produk dari pembeli
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
                {mediaReviews.map((rev) => (
                  <div
                    key={rev.id}
                    onClick={() =>
                      setActiveMediaModal({
                        url: rev.mediaUrl || "",
                        type: (rev.mediaType as "image" | "video") || "image",
                        reviewer: rev.reviewerName,
                        comment: rev.comment,
                      })
                    }
                    className="group relative aspect-square rounded-xl overflow-hidden bg-stone-900 border border-stone-200 shadow-2xs cursor-pointer hover:scale-103 transition-transform"
                  >
                    {rev.mediaType === "video" ? (
                      <>
                        <video
                          src={rev.mediaUrl || ""}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                          muted
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-stone-900/30 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold flex items-center gap-1">
                          <VideoIcon className="w-2.5 h-2.5" /> Video
                        </span>
                      </>
                    ) : (
                      <>
                        <img
                          src={rev.mediaUrl || ""}
                          alt={`Reviewer ${rev.reviewerName}`}
                          className="w-full h-full object-cover group-hover:scale-108 transition duration-300"
                        />
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold flex items-center gap-1">
                          <ImageIcon className="w-2.5 h-2.5" /> Foto
                        </span>
                      </>
                    )}
                    <span className="absolute top-1.5 right-1.5 text-[9px] text-white font-bold bg-black/60 px-1 rounded">
                      ⭐ {rev.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIST REVIEW DETAIL */}
          <div className="space-y-3 sm:space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400 text-xs">
                Belum ada ulasan untuk filter ini.
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                        {rev.reviewerName.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs sm:text-sm text-stone-900">
                            {rev.reviewerName}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/50">
                            Pembeli Terverifikasi
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                          <span>{rev.userLocation || "Indonesia"}</span>
                          <span>•</span>
                          <span>Varian: {rev.selectedVariant || "Standar"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {rev.comment}
                  </p>

                  {/* Attached Media */}
                  {rev.mediaUrl && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMediaModal({
                            url: rev.mediaUrl || "",
                            type: (rev.mediaType as "image" | "video") || "image",
                            reviewer: rev.reviewerName,
                            comment: rev.comment,
                          })
                        }
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-stone-200 bg-stone-900 group cursor-pointer"
                      >
                        {rev.mediaType === "video" ? (
                          <>
                            <video
                              src={rev.mediaUrl}
                              className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                              <Play className="w-5 h-5 text-white fill-white" />
                            </div>
                          </>
                        ) : (
                          <img
                            src={rev.mediaUrl}
                            alt="Dokumentasi ulasan"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        )}
                      </button>
                    </div>
                  )}

                  <div className="pt-1 flex items-center gap-4 text-[10px] sm:text-xs text-stone-400">
                    <button className="flex items-center gap-1 hover:text-rose-600 transition cursor-pointer">
                      <ThumbsUp className="w-3 h-3" />
                      <span>Membantu ({rev.helpfulCount})</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="mt-14 sm:mt-18 pt-8 border-t border-stone-200">
            <div className="mb-6">
              <span className="text-[10px] sm:text-xs font-bold text-rose-600 uppercase tracking-wider block">
                Rekomendasi Terbaik
              </span>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 mt-0.5">
                Produk Terkait yang Mungkin Anda Sukai
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={handleAddToCart}
                  onOpenOrderModal={handleOpenOrderModal}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* STICKY BOTTOM ACTION BAR FOR MOBILE */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-2.5 sm:hidden shadow-lg flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[9px] text-stone-400 block font-medium">
            Total Harga:
          </span>
          <span className="font-extrabold text-sm text-rose-600 font-mono">
            {formatRupiah(currentPrice * quantity)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleAddToCart(product, selectedVariant, quantity)}
            className="p-2.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 active:scale-95"
            aria-label="Tambah ke Keranjang"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button
            onClick={handleDirectBuy}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-600/30 active:scale-95 flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Beli Sekarang</span>
          </button>
        </div>
      </div>

      {/* POPUP MODAL FOR PHOTO / VIDEO PREVIEW */}
      {activeMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in-up">
          <div className="relative max-w-2xl w-full bg-stone-900 rounded-3xl overflow-hidden border border-stone-700 shadow-2xl flex flex-col">
            <div className="p-3 sm:p-4 flex items-center justify-between border-b border-stone-800 text-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                  {activeMediaModal.reviewer.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    Dokumentasi {activeMediaModal.reviewer}
                  </h4>
                  <span className="text-[10px] text-stone-400">
                    Video &amp; Foto Asli Pembeli BeautyCare
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveMediaModal(null)}
                className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
                aria-label="Tutup Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video sm:aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
              {activeMediaModal.type === "video" ? (
                <video
                  src={activeMediaModal.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={activeMediaModal.url}
                  alt="Review dokumentasi"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="p-3 sm:p-4 bg-stone-950 text-stone-300 text-xs leading-relaxed">
              <p>&ldquo;{activeMediaModal.comment}&rdquo;</p>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER & ORDER MODAL */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        totalCartItems={totalCartItems}
        totalCartPrice={totalCartPrice}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        customerEmail={customerEmail}
        setCustomerEmail={setCustomerEmail}
        customerAddress={customerAddress}
        setCustomerAddress={setCustomerAddress}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        orderSubmitting={orderSubmitting}
        orderError={orderError}
        onSubmitOrder={handleCartSubmitOrder}
      />

      {orderModalProduct && (
        <OrderModal
          product={orderModalProduct}
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant}
          quantity={quantity}
          onUpdateQuantity={setQuantity}
          onClose={() => setOrderModalProduct(null)}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          customerEmail={customerEmail}
          setCustomerEmail={setCustomerEmail}
          customerAddress={customerAddress}
          setCustomerAddress={setCustomerAddress}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          notes={notes}
          setNotes={setNotes}
          orderSubmitting={orderSubmitting}
          orderError={orderError}
          onSubmitOrder={handleSingleOrderSubmit}
          onAddToCart={() => {
            handleAddToCart(orderModalProduct, selectedVariant, quantity);
            setOrderModalProduct(null);
          }}
        />
      )}

      {/* MODAL: CUSTOMER AUTH (LOGIN / REGISTER) */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        onSuccess={() => {
          fetchCustomerSession();
        }}
      />

      {/* MODAL: NOT PURCHASED WARNING */}
      {notPurchasedAlertOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center border border-stone-200 animate-scale-up">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-base sm:text-lg font-black text-stone-900 mb-2">
              Khusus Pembeli Terverifikasi
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Akun Anda (<span className="font-semibold text-stone-900">{customer?.email}</span>) belum memiliki riwayat pesanan produk <span className="font-bold text-stone-900">{product.name}</span>.
            </p>

            <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-left text-[11px] text-amber-900 mb-6 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Standar Keaslian Ulasan BeautyCare:
              </p>
              <p className="text-amber-700">
                Untuk menjamin bahwa setiap penilaian dan dokumentasi foto/video 100% otentik, ulasan hanya dapat dikirim setelah pesanan Anda diproses.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  setNotPurchasedAlertOpen(false);
                  setOrderModalProduct(product);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Pesan Produk Ini Sekarang
              </button>
              <button
                type="button"
                onClick={() => setNotPurchasedAlertOpen(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TULIS PENILAIAN & ULASAN PRODUK */}
      {isWriteReviewOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 max-h-[92vh] overflow-y-auto border border-stone-200 animate-scale-up">
            <div className="flex justify-between items-center pb-3.5 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-100 text-rose-600">
                  <Star className="w-5 h-5 fill-rose-600 text-rose-600" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900">
                    Beri Penilaian &amp; Ulasan Produk
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Sebagai: <span className="font-semibold text-stone-800">{customer?.name}</span> (Verified Buyer)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWriteReviewOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewErrorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{reviewErrorMessage}</span>
              </div>
            )}

            {reviewSuccessMessage && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reviewSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 mt-4 text-xs">
              {/* Product Info Preview */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                <img
                  src={product.image || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-stone-900 truncate">{product.name}</h4>
                  <p className="text-[11px] text-rose-600 font-semibold">{product.category.name}</p>
                </div>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block font-bold text-stone-800 mb-1.5">
                  Berapa Rating Bintang Anda? <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1.5 bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 ${
                          star <= reviewRating
                            ? "text-amber-400 fill-amber-400 drop-shadow-xs"
                            : "text-stone-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 font-bold text-xs text-stone-700">
                    {reviewRating === 5 && "⭐⭐⭐⭐⭐ Luar Biasa Memuaskan!"}
                    {reviewRating === 4 && "⭐⭐⭐⭐ Sangat Bagus"}
                    {reviewRating === 3 && "⭐⭐⭐ Cukup Baik"}
                    {reviewRating === 2 && "⭐⭐ Kurang Memuaskan"}
                    {reviewRating === 1 && "⭐ Kecewa"}
                  </span>
                </div>
              </div>

              {/* Variant Selector (if has variants) */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Varian Ukuran yang Anda Beli:
                  </label>
                  <select
                    value={reviewVariant}
                    onChange={(e) => setReviewVariant(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-medium text-xs"
                  >
                    {product.variants.map((v) => (
                      <option key={v.id} value={v.size}>
                        {v.size} ({formatRupiah(v.price)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Review Comment */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Ulasan &amp; Pengalaman Pemakaian <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ceritakan bagaimana efeknya pada kulit Anda, tekstur produk, aroma, dan kecepatan hasil yang dirasakan..."
                  className="w-full p-3 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 text-xs"
                />
              </div>

              {/* Dokumentasi Foto / Video */}
              <div className="p-3.5 bg-rose-50/40 rounded-2xl border border-rose-100/90 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4 text-rose-600" />
                    Lampirkan Dokumentasi Pembeli (Opsional)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewMediaType("image")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        reviewMediaType === "image"
                          ? "bg-rose-600 text-white"
                          : "bg-white text-stone-600 border border-stone-200"
                      }`}
                    >
                      Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewMediaType("video")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        reviewMediaType === "video"
                          ? "bg-rose-600 text-white"
                          : "bg-white text-stone-600 border border-stone-200"
                      }`}
                    >
                      Video
                    </button>
                  </div>
                </div>

                <div>
                  <input
                    type="url"
                    value={reviewMediaUrl}
                    onChange={(e) => setReviewMediaUrl(e.target.value)}
                    placeholder={
                      reviewMediaType === "video"
                        ? "Masukkan URL video MP4 (contoh: https://assets.mixkit.co/...)"
                        : "Masukkan URL foto (contoh: https://images.unsplash.com/...)"
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs"
                  />
                </div>

                {/* Quick Presets for Demo / Testing */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] text-stone-500">Contoh Cepat:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewMediaType("image");
                      setReviewMediaUrl(
                        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80"
                      );
                    }}
                    className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-600 hover:text-stone-900 text-[10px] font-medium cursor-pointer"
                  >
                    + Foto Tekstur Skincare
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewMediaType("video");
                      setReviewMediaUrl(
                        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                      );
                    }}
                    className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-600 hover:text-stone-900 text-[10px] font-medium cursor-pointer"
                  >
                    + Video Pemakaian
                  </button>
                </div>

                {/* Live Preview */}
                {reviewMediaUrl && (
                  <div className="mt-2 p-2 rounded-xl bg-white border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-500 block mb-1">
                      Pratinjau Dokumentasi:
                    </span>
                    {reviewMediaType === "video" ? (
                      <video
                        src={reviewMediaUrl}
                        controls
                        className="w-full max-h-36 object-contain rounded-lg bg-black"
                      />
                    ) : (
                      <img
                        src={reviewMediaUrl}
                        alt="Preview ulasan"
                        className="w-full max-h-36 object-cover rounded-lg"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsWriteReviewOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {reviewSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Publikasikan Penilaian</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
