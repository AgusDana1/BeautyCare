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
  ShoppingBag,
  ArrowRight,
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

      setReviewSuccessMessage("Ulasan & evaluasi produk Anda berhasil dikirim!");
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

  // Gallery images (product image + secondary views)
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
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
    }
    return list;
  }, [product]);

  // Cart Handlers
  const handleAddToCart = (
    prod: Product,
    variant: Variant | null = null,
    qty = 1
  ) => {
    const chosenVariant =
      variant ||
      (prod.hasVariants && prod.variants && prod.variants.length > 0
        ? prod.variants[0]
        : null);
    const itemPrice = chosenVariant ? chosenVariant.price : prod.price;
    const itemSize = chosenVariant ? chosenVariant.size : null;
    const variantId = chosenVariant ? chosenVariant.id : null;

    const existingIndex = cart.findIndex(
      (c) => c.productId === prod.id && c.variantId === variantId
    );

    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      updatedCart = [...cart];
      updatedCart[existingIndex].quantity += qty;
    } else {
      updatedCart = [
        ...cart,
        {
          productId: prod.id,
          productName: prod.name,
          productImage: prod.image,
          variantId,
          selectedSize: itemSize,
          price: itemPrice,
          quantity: qty,
        },
      ];
    }

    saveStoredCart(updatedCart);
    showToast(
      `✓ ${qty}x ${prod.name} ${itemSize ? `(${itemSize})` : ""} ditambahkan ke kantong!`
    );
  };

  const handleUpdateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    const updated = [...cart];
    updated[index].quantity = newQty;
    saveStoredCart(updated);
  };

  const handleRemoveCartItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    saveStoredCart(updated);
  };

  const totalCartPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  // Direct checkout
  const handleDirectBuy = () => {
    setOrderModalProduct(product);
  };

  const handleCartSubmitOrder = async (
    e: React.FormEvent,
    redeemPoints: number = 0
  ) => {
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
          paymentChannel: paymentMethod === "QRIS" ? "QRIS All Payment" : paymentMethod,
          notes: notes || null,
          redeemPoints,
          items: cart.map((c) => ({
            productId: c.productId,
            variantId: c.variantId,
            selectedSize: c.selectedSize,
            quantity: c.quantity,
            price: c.price,
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

  const handleSingleOrderSubmit = async (
    e: React.FormEvent,
    redeemPoints: number = 0
  ) => {
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
          paymentChannel: paymentMethod === "QRIS" ? "QRIS All Payment" : paymentMethod,
          notes: notes || null,
          redeemPoints,
          items: [
            {
              productId: orderModalProduct.id,
              variantId: selectedVariant?.id || null,
              selectedSize: selectedVariant?.size || null,
              quantity: quantity,
              price: currentPrice,
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
    <div className="min-h-screen bg-[#FAF8F4] text-[#292925] font-sans antialiased selection:bg-[#87947B]/20">
      {/* Navbar with reactive bag counter */}
      <Navbar
        totalCartItems={totalCartItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-[80] bg-[#292925] text-[#FAF8F4] px-4 py-3 rounded-sm shadow-editorial border border-[#33332D] flex items-center gap-2 text-xs font-sans animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-[#87947B] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-[#EAE4DA]">
        <nav className="flex items-center gap-2 text-xs text-[#292925]/60 font-sans overflow-x-auto">
          <Link href="/" className="hover:text-[#292925] transition shrink-0">
            Beranda
          </Link>
          <ChevronRight className="w-3 h-3 text-[#292925]/40 shrink-0" />
          <Link
            href="/#katalog"
            className="hover:text-[#292925] transition shrink-0"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="w-3 h-3 text-[#292925]/40 shrink-0" />
          <span className="text-[#292925] font-medium truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Main Product Showcase Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 pb-24 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* LEFT: Editorial Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square bg-[#EAE4DA] border border-[#EAE4DA] overflow-hidden rounded-sm">
              <img
                src={galleryImages[activeImageIndex] || product.image || ""}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider bg-white/95 text-[#292925] border border-[#EAE4DA] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#87947B]" />
                  BPOM Terverifikasi
                </span>
                <span className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider bg-[#292925] text-[#FAF8F4]">
                  {product.category.name}
                </span>
              </div>

              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`absolute top-4 right-4 p-2.5 rounded-full border border-[#EAE4DA] transition cursor-pointer ${
                  isLiked
                    ? "bg-[#FAF8F4] text-[#C99A91]"
                    : "bg-white/80 text-[#292925] hover:bg-white"
                }`}
                aria-label="Simpan ke Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${isLiked ? "fill-[#C99A91] text-[#C99A91]" : ""}`}
                />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 border transition shrink-0 cursor-pointer overflow-hidden ${
                    activeImageIndex === idx
                      ? "border-[#292925] ring-1 ring-[#292925]"
                      : "border-[#EAE4DA] opacity-70 hover:opacity-100"
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
            <div className="p-4 bg-white border border-[#EAE4DA] grid grid-cols-3 gap-2 text-center text-xs text-[#292925]/75 font-sans rounded-sm">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#87947B]" />
                <span className="font-medium text-[#292925]">100% Asli</span>
                <span className="text-[10px] text-[#292925]/50">Terdaftar BPOM</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-[#EAE4DA]">
                <Truck className="w-4 h-4 text-[#87947B]" />
                <span className="font-medium text-[#292925]">Pengiriman Aman</span>
                <span className="text-[10px] text-[#292925]/50">Segel Temperatur</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#87947B]" />
                <span className="font-medium text-[#292925]">Faktur Legal</span>
                <span className="text-[10px] text-[#292925]/50">Invoice Otomatis</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Information, Formulations, Selection */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2 border-b border-[#EAE4DA] pb-6">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#87947B] block">
                {product.category.name}
              </span>

              <h1 className="font-serif text-2xl sm:text-4xl text-[#292925] tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating & Stock Status */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#292925]/70 font-sans pt-1">
                <div className="flex items-center gap-1 text-[#87947B]">
                  <Star className="w-3.5 h-3.5 fill-[#87947B] text-[#87947B]" />
                  <span className="font-semibold text-[#292925]">{avgRating}</span>
                </div>
                <span>•</span>
                <a href="#ulasan" className="underline hover:text-[#292925]">
                  {reviewCount} Evaluasi Pembeli
                </a>
                <span>•</span>
                <span className="text-[#87947B] font-medium">
                  {currentStock > 0 ? `${currentStock} botol siap kirim` : "Habis"}
                </span>
              </div>
            </div>

            {/* Dynamic Price Display */}
            <div className="p-5 bg-white border border-[#EAE4DA] rounded-sm space-y-2">
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#87947B] block font-sans">
                Harga Formulasi
              </span>
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-[#292925]">
                  {formatRupiah(currentPrice)}
                </span>
                <span className="text-xs text-[#292925]/50 line-through">
                  {formatRupiah(currentPrice * 1.2)}
                </span>
              </div>
              <p className="text-[11px] text-[#292925]/60 font-sans">
                Termasuk PPN &amp; perolehan <strong className="text-[#292925]">+{potentialPoints} poin loyalty</strong> (diskon {formatRupiah(potentialDiscount)} pesanan berikutnya).
              </p>
            </div>

            {/* Seller / Atelier Card */}
            <div className="p-4 bg-[#EAE4DA]/30 border border-[#EAE4DA] rounded-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#292925] text-[#FAF8F4] flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-[#87947B]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-xs sm:text-sm text-[#292925]">
                      {product.sellerName || "BeautyCare Atelier & Formulary"}
                    </h4>
                    <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-[#87947B]/20 text-[#87947B]">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#292925]/60 mt-0.5 font-sans">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#87947B]" />
                      {product.sellerCity || "Denpasar, Bali"}
                    </span>
                    <span>•</span>
                    <span>Respon ± 5 mnt</span>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/62881038322937?text=Halo%20BeautyCare,%20saya%20ingin%20bertanya%20tentang%20formulasi%20${encodeURIComponent(
                  product.name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 border border-[#292925] text-[#292925] hover:bg-[#292925] hover:text-[#FAF8F4] text-xs font-medium transition cursor-pointer shrink-0"
              >
                Konsultasi
              </a>
            </div>

            {/* VARIANT SELECTOR: ML SIZES */}
            {product.hasVariants && product.variants.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-medium text-[#292925]">
                    Pilih Kemasan (ml):
                  </span>
                  <span className="text-[#87947B] font-mono">
                    {selectedVariant?.size || "Pilih satu"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`p-2 sm:p-3 border text-left transition-all cursor-pointer rounded-sm ${
                          isSelected
                            ? "bg-white border-[#292925] ring-1 ring-[#292925]"
                            : "bg-[#FAF8F4] border-[#EAE4DA] hover:border-[#87947B]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] sm:text-xs font-bold text-[#292925]">
                            {v.size}
                          </span>
                          {isSelected && (
                            <CheckCircle className="w-3.5 h-3.5 text-[#87947B]" />
                          )}
                        </div>
                        <span className="text-[11px] sm:text-xs font-serif font-semibold text-[#292925] block mt-1 truncate">
                          {formatRupiah(v.price)}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-[#292925]/50 block font-sans">
                          Stok: {v.stock}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUANTITY & ACTIONS */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-[#292925] font-sans">
                  Jumlah:
                </span>
                <div className="flex items-center border border-[#EAE4DA] bg-white rounded-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-[#292925] hover:bg-[#EAE4DA]/50 disabled:opacity-30 cursor-pointer font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-mono font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="px-3 py-1.5 text-[#292925] hover:bg-[#EAE4DA]/50 disabled:opacity-30 cursor-pointer font-bold text-xs"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#292925]/60 font-sans">
                  Total: <strong className="text-[#292925]">{formatRupiah(currentPrice * quantity)}</strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(product, selectedVariant, quantity)}
                  disabled={currentStock === 0}
                  className="w-full py-3.5 border border-[#292925] text-[#292925] hover:bg-[#EAE4DA]/40 font-medium text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>+ Kantong</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectBuy}
                  disabled={currentStock === 0}
                  className="w-full py-3.5 bg-[#292925] hover:bg-[#87947B] text-[#FAF8F4] font-medium text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Pesan Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TABBED DETAILS */}
            <div className="pt-6 border-t border-[#EAE4DA]">
              <div className="flex border-b border-[#EAE4DA] gap-6 text-xs font-sans">
                <button
                  onClick={() => setActiveTab("desc")}
                  className={`pb-3 transition relative cursor-pointer font-medium tracking-wide ${
                    activeTab === "desc"
                      ? "text-[#292925] border-b-2 border-[#292925]"
                      : "text-[#292925]/50 hover:text-[#292925]"
                  }`}
                >
                  Deskripsi &amp; Manfaat
                </button>
                <button
                  onClick={() => setActiveTab("ingredients")}
                  className={`pb-3 transition relative cursor-pointer font-medium tracking-wide ${
                    activeTab === "ingredients"
                      ? "text-[#292925] border-b-2 border-[#292925]"
                      : "text-[#292925]/50 hover:text-[#292925]"
                  }`}
                >
                  Kandungan &amp; Cara Pakai
                </button>
                <button
                  onClick={() => setActiveTab("safety")}
                  className={`pb-3 transition relative cursor-pointer font-medium tracking-wide ${
                    activeTab === "safety"
                      ? "text-[#292925] border-b-2 border-[#292925]"
                      : "text-[#292925]/50 hover:text-[#292925]"
                  }`}
                >
                  Sertifikasi BPOM
                </button>
              </div>

              <div className="py-5 text-xs text-[#292925]/75 leading-relaxed font-sans">
                {activeTab === "desc" && (
                  <div className="space-y-4">
                    <p>{product.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 bg-white border border-[#EAE4DA] rounded-sm space-y-1">
                        <span className="font-medium text-[#292925] block">
                          Fokus Formulasi:
                        </span>
                        <ul className="list-disc list-inside text-[#292925]/70 space-y-0.5">
                          <li>Menguatkan lipid barrier kulit sensitif</li>
                          <li>Mengunci kelembapan hingga 48 jam</li>
                          <li>Menyeimbangkan mikrobioma alami</li>
                        </ul>
                      </div>
                      <div className="p-3.5 bg-white border border-[#EAE4DA] rounded-sm space-y-1">
                        <span className="font-medium text-[#292925] block">
                          Kesesuaian Tipe Kulit:
                        </span>
                        <p className="text-[#292925]/70">
                          Sangat direkomendasikan untuk kulit kering, dehidrasi, kombinasi, dan aman untuk ibu hamil &amp; menyusui.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "ingredients" && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-white border border-[#EAE4DA] rounded-sm space-y-1.5">
                      <h5 className="font-medium text-[#292925]">
                        Kandungan Aktif &amp; Botani:
                      </h5>
                      <p className="text-[11px] text-[#292925]/70 font-mono leading-relaxed">
                        Aqua (Water), Niacinamide 5%, Ceramide NP, Centella Asiatica Extract, Sodium Hyaluronate Multi-Molecular, Panthenol (Pro-Vit B5), Vegetable Glycerin, Tocopherol.
                      </p>
                    </div>
                    <div className="p-3.5 bg-[#EAE4DA]/30 border border-[#EAE4DA] rounded-sm space-y-1.5">
                      <h5 className="font-medium text-[#292925]">
                        Petunjuk Ritual Pemakaian:
                      </h5>
                      <ol className="list-decimal list-inside text-[11px] text-[#292925]/70 space-y-1">
                        <li>Gunakan setelah membersihkan wajah dan mengaplikasikan toner.</li>
                        <li>Teteskan 2-3 tetes formula secara merata pada wajah dan leher.</li>
                        <li>Tepuk perlahan hingga meresap sempurna sebelum menggunakan pelembap.</li>
                        <li>Dapat digunakan pada pagi dan malam hari.</li>
                      </ol>
                    </div>
                  </div>
                )}

                {activeTab === "safety" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-white border border-[#EAE4DA] rounded-sm space-y-1">
                      <span className="font-semibold text-xs text-[#292925] block">
                        No. Registrasi BPOM RI
                      </span>
                      <span className="font-mono text-xs font-bold text-[#87947B] block">
                        NA18230104829
                      </span>
                      <span className="text-[11px] text-[#292925]/60 block">
                        Teruji klinis aman, bebas steroid, merkuri, dan hidrokuinon.
                      </span>
                    </div>
                    <div className="p-4 bg-white border border-[#EAE4DA] rounded-sm space-y-1">
                      <span className="font-semibold text-xs text-[#292925] block">
                        Sertifikasi Halal MUI
                      </span>
                      <span className="font-mono text-xs font-bold text-[#87947B] block">
                        ID00110000452391022
                      </span>
                      <span className="text-[11px] text-[#292925]/60 block">
                        100% Bebas Paraben sintetis, Cruelty-Free, &amp; Non-Comedogenic.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: BUYER REVIEWS & CLINICAL FEEDBACK */}
        <section id="ulasan" className="mt-16 sm:mt-24 pt-10 border-t border-[#EAE4DA]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#87947B] block">
                Evaluasi Pembeli
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#292925]">
                Catatan Pengalaman Pengguna
              </h2>
              <p className="text-xs text-[#292925]/70 font-sans">
                Penilaian produk hanya dapat diberikan oleh akun yang telah menyelesaikan pembelian formulasi ini.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleOpenWriteReview}
                className="px-4 py-2 bg-[#292925] hover:bg-[#87947B] text-[#FAF8F4] text-xs font-medium uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Star className="w-3.5 h-3.5 fill-[#FAF8F4]" />
                <span>Tulis Penilaian</span>
              </button>

              <div className="flex items-center gap-1 bg-white border border-[#EAE4DA] p-1 rounded-sm">
                <button
                  onClick={() => setReviewFilter("ALL")}
                  className={`px-3 py-1 text-xs transition cursor-pointer ${
                    reviewFilter === "ALL"
                      ? "bg-[#292925] text-[#FAF8F4]"
                      : "text-[#292925]/70 hover:text-[#292925]"
                  }`}
                >
                  Semua ({reviews.length})
                </button>
                <button
                  onClick={() => setReviewFilter("MEDIA")}
                  className={`px-3 py-1 text-xs transition cursor-pointer flex items-center gap-1 ${
                    reviewFilter === "MEDIA"
                      ? "bg-[#292925] text-[#FAF8F4]"
                      : "text-[#292925]/70 hover:text-[#292925]"
                  }`}
                >
                  <VideoIcon className="w-3 h-3" />
                  <span>Media ({mediaReviews.length})</span>
                </button>
                <button
                  onClick={() => setReviewFilter("5_STAR")}
                  className={`px-3 py-1 text-xs transition cursor-pointer ${
                    reviewFilter === "5_STAR"
                      ? "bg-[#292925] text-[#FAF8F4]"
                      : "text-[#292925]/70 hover:text-[#292925]"
                  }`}
                >
                  ★ 5
                </button>
              </div>
            </div>
          </div>

          {/* DOKUMENTASI MEDIA GALLERY (FOTO & VIDEO PEMBELI) */}
          {mediaReviews.length > 0 && (
            <div className="mb-8 p-5 bg-white border border-[#EAE4DA] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base text-[#292925]">
                  Galeri Foto &amp; Tekstur Produk dari Pembeli
                </h3>
                <span className="text-[11px] text-[#292925]/60 font-sans">
                  Klik untuk melihat pratinjau penuh
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
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
                    className="group relative aspect-square border border-[#EAE4DA] overflow-hidden bg-[#292925] cursor-pointer"
                  >
                    {rev.mediaType === "video" ? (
                      <>
                        <video
                          src={rev.mediaUrl || ""}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                          muted
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-[#FAF8F4]/90 text-[#292925] flex items-center justify-center shadow-sm">
                            <Play className="w-3.5 h-3.5 fill-[#292925] ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={rev.mediaUrl || ""}
                        alt={`Reviewer ${rev.reviewerName}`}
                        className="w-full h-full object-cover group-hover:scale-104 transition duration-500"
                      />
                    )}
                    <span className="absolute top-1.5 right-1.5 text-[9px] text-[#FAF8F4] bg-[#292925]/80 px-1 font-mono">
                      ★ {rev.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIST REVIEW DETAIL */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#EAE4DA] text-[#292925]/50 text-xs font-sans rounded-sm">
                Belum ada ulasan untuk filter ini.
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 sm:p-6 bg-white border border-[#EAE4DA] rounded-sm space-y-3 font-sans"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-[#292925]">
                          {rev.reviewerName}
                        </span>
                        <span className="text-[10px] text-[#87947B] font-mono uppercase bg-[#87947B]/15 px-1.5 py-0.2">
                          Verified Buyer
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#292925]/50 font-sans">
                        <span>{rev.userLocation || "Indonesia"}</span>
                        <span>•</span>
                        <span>Varian: {rev.selectedVariant || "Standar"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-[#87947B]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? "fill-[#87947B] text-[#87947B]"
                              : "text-[#EAE4DA]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#292925]/80 leading-relaxed">
                    {rev.comment}
                  </p>

                  {/* Attached Media Thumbnail */}
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
                        className="relative w-20 h-20 border border-[#EAE4DA] overflow-hidden bg-[#292925] cursor-pointer"
                      >
                        {rev.mediaType === "video" ? (
                          <>
                            <video
                              src={rev.mediaUrl}
                              className="w-full h-full object-cover opacity-75"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                          </>
                        ) : (
                          <img
                            src={rev.mediaUrl}
                            alt="Dokumentasi ulasan"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-4 text-[11px] text-[#292925]/50 border-t border-[#EAE4DA]/50">
                    <button className="flex items-center gap-1 hover:text-[#292925] transition cursor-pointer">
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
          <section className="mt-16 sm:mt-24 pt-10 border-t border-[#EAE4DA]">
            <div className="mb-8 space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#87947B] block">
                Formulasi Komplementer
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-[#292925]">
                Produk Terkait untuk Melengkapi Ritual Anda
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={handleAddToCart}
                  onOpenOrderModal={handleDirectBuy}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* STICKY BOTTOM ACTION BAR FOR MOBILE */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-t border-[#EAE4DA] p-3 sm:hidden flex items-center justify-between gap-3 shadow-editorial">
        <div className="min-w-0">
          <span className="text-[10px] text-[#292925]/60 block font-sans">
            Total Formulasi:
          </span>
          <span className="font-serif font-bold text-sm text-[#292925]">
            {formatRupiah(currentPrice * quantity)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddToCart(product, selectedVariant, quantity)}
            className="p-2.5 border border-[#292925] bg-white text-[#292925] active:bg-[#EAE4DA]"
            aria-label="Tambah ke Kantong"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
          <button
            onClick={handleDirectBuy}
            className="px-4 py-2.5 bg-[#292925] text-[#FAF8F4] text-xs font-medium uppercase tracking-wider active:bg-[#87947B]"
          >
            Pesan Sekarang
          </button>
        </div>
      </div>

      {/* POPUP MODAL FOR PHOTO / VIDEO PREVIEW */}
      {activeMediaModal && (
        <div className="fixed inset-0 z-50 bg-[#292925]/90 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#292925] border border-[#44443E] shadow-2xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-[#3A3A34] text-[#FAF8F4]">
              <div className="space-y-0.5">
                <h4 className="font-serif text-sm">
                  Dokumentasi {activeMediaModal.reviewer}
                </h4>
                <span className="text-[10px] text-[#FAF8F4]/60 font-sans">
                  Evaluasi Autentik Pengguna BeautyCare
                </span>
              </div>
              <button
                onClick={() => setActiveMediaModal(null)}
                className="p-1 text-[#FAF8F4]/60 hover:text-[#FAF8F4] transition cursor-pointer"
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

            <div className="p-4 bg-[#21211E] text-[#FAF8F4]/80 text-xs leading-relaxed font-sans">
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

      {/* MODAL: CUSTOMER AUTH */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        onSuccess={() => {
          fetchCustomerSession();
        }}
      />

      {/* MODAL: NOT PURCHASED WARNING */}
      {notPurchasedAlertOpen && (
        <div className="fixed inset-0 z-50 bg-[#292925]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 text-center border border-[#EAE4DA] shadow-xl">
            <div className="w-12 h-12 rounded-full bg-[#EAE4DA] text-[#87947B] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-lg text-[#292925] mb-2">
              Khusus Pembeli Terverifikasi
            </h3>

            <p className="text-xs text-[#292925]/70 leading-relaxed mb-4 font-sans">
              Akun Anda (<span className="font-medium text-[#292925]">{customer?.email}</span>) belum memiliki riwayat pembelian untuk produk <span className="font-medium text-[#292925]">{product.name}</span>.
            </p>

            <div className="p-3 bg-[#FAF8F4] border border-[#EAE4DA] text-left text-[11px] text-[#292925]/75 mb-5 space-y-1 font-sans">
              <p className="font-medium text-[#292925] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#87947B]" />
                Standar Keaslian Ulasan BeautyCare:
              </p>
              <p>
                Untuk menjamin bahwa setiap dokumentasi dan ulasan 100% autentik, evaluasi produk hanya dapat dikirimkan setelah pesanan Anda diproses.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 font-sans">
              <button
                type="button"
                onClick={() => {
                  setNotPurchasedAlertOpen(false);
                  setOrderModalProduct(product);
                }}
                className="w-full py-2.5 px-4 bg-[#292925] hover:bg-[#87947B] text-[#FAF8F4] text-xs font-medium uppercase tracking-wider transition cursor-pointer"
              >
                Pesan Formulasi Ini
              </button>
              <button
                type="button"
                onClick={() => setNotPurchasedAlertOpen(false)}
                className="w-full sm:w-auto py-2.5 px-4 border border-[#EAE4DA] text-[#292925] hover:bg-[#FAF8F4] text-xs font-medium transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TULIS PENILAIAN */}
      {isWriteReviewOpen && (
        <div className="fixed inset-0 z-50 bg-[#292925]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full p-6 max-h-[92vh] overflow-y-auto border border-[#EAE4DA] shadow-xl">
            <div className="flex justify-between items-center pb-4 border-b border-[#EAE4DA]">
              <div>
                <h3 className="font-serif text-lg text-[#292925]">
                  Evaluasi &amp; Ulasan Formulasi
                </h3>
                <p className="text-[11px] text-[#292925]/60 font-sans">
                  Oleh: <span className="font-medium text-[#292925]">{customer?.name}</span> (Verified Buyer)
                </p>
              </div>
              <button
                onClick={() => setIsWriteReviewOpen(false)}
                className="text-[#292925]/50 hover:text-[#292925] p-1 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewErrorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{reviewErrorMessage}</span>
              </div>
            )}

            {reviewSuccessMessage && (
              <div className="mt-4 p-3 bg-[#87947B]/15 border border-[#87947B] text-[#292925] text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#87947B] shrink-0" />
                <span>{reviewSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 mt-4 text-xs font-sans">
              <div className="flex items-center gap-3 p-3 bg-[#FAF8F4] border border-[#EAE4DA]">
                <img
                  src={product.image || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-12 h-12 object-cover border border-[#EAE4DA] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif text-sm text-[#292925] truncate">{product.name}</h4>
                  <p className="text-[11px] text-[#87947B] font-mono">{product.category.name}</p>
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block font-medium text-[#292925] mb-1.5">
                  Rating Formulasi:
                </label>
                <div className="flex items-center gap-1.5 p-3 bg-[#FAF8F4] border border-[#EAE4DA]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? "text-[#87947B] fill-[#87947B]"
                            : "text-[#EAE4DA]"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 font-medium text-xs text-[#292925]">
                    {reviewRating === 5 && "Sangat Memuaskan"}
                    {reviewRating === 4 && "Memuaskan"}
                    {reviewRating === 3 && "Cukup"}
                    {reviewRating === 2 && "Kurang Memuaskan"}
                    {reviewRating === 1 && "Tidak Sesuai Harapan"}
                  </span>
                </div>
              </div>

              {/* Variant selector */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="block font-medium text-[#292925] mb-1">
                    Varian Ukuran yang Anda Beli:
                  </label>
                  <select
                    value={reviewVariant}
                    onChange={(e) => setReviewVariant(e.target.value)}
                    className="w-full p-2.5 border border-[#EAE4DA] bg-white text-xs outline-none focus:border-[#292925]"
                  >
                    {product.variants.map((v) => (
                      <option key={v.id} value={v.size}>
                        {v.size} ({formatRupiah(v.price)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Comment */}
              <div>
                <label className="block font-medium text-[#292925] mb-1">
                  Catatan Evaluasi &amp; Efek Pemakaian:
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ceritakan penyerapan tekstur, aroma alami, dan efek yang dirasakan pada kulit setelah pemakaian teratur..."
                  className="w-full p-3 border border-[#EAE4DA] outline-none focus:border-[#292925] text-xs"
                />
              </div>

              {/* Media documentation */}
              <div className="p-3 bg-[#FAF8F4] border border-[#EAE4DA] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-[#292925] flex items-center gap-1.5 text-xs">
                    <Camera className="w-3.5 h-3.5 text-[#87947B]" />
                    Lampiran Foto / Video (Opsional)
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setReviewMediaType("image")}
                      className={`px-2.5 py-0.5 text-[10px] font-medium transition cursor-pointer ${
                        reviewMediaType === "image"
                          ? "bg-[#292925] text-[#FAF8F4]"
                          : "bg-white text-[#292925] border border-[#EAE4DA]"
                      }`}
                    >
                      Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewMediaType("video")}
                      className={`px-2.5 py-0.5 text-[10px] font-medium transition cursor-pointer ${
                        reviewMediaType === "video"
                          ? "bg-[#292925] text-[#FAF8F4]"
                          : "bg-white text-[#292925] border border-[#EAE4DA]"
                      }`}
                    >
                      Video
                    </button>
                  </div>
                </div>

                <input
                  type="url"
                  value={reviewMediaUrl}
                  onChange={(e) => setReviewMediaUrl(e.target.value)}
                  placeholder="Masukkan URL foto atau video..."
                  className="w-full p-2 border border-[#EAE4DA] bg-white text-xs outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE4DA]">
                <button
                  type="button"
                  onClick={() => setIsWriteReviewOpen(false)}
                  className="px-4 py-2 border border-[#EAE4DA] text-[#292925] hover:bg-[#FAF8F4] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-5 py-2 bg-[#292925] hover:bg-[#87947B] text-[#FAF8F4] font-medium uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {reviewSubmitting ? (
                    <span>Mengirimkan...</span>
                  ) : (
                    <span>Kirim Penilaian</span>
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
