"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Clock,
  UserCheck,
  Share2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Article, Product, CartItem, Variant, PaymentMethod } from "@/app/types/storefront";
import {
  subscribeCart,
  getCartSnapshot,
  getCartServerSnapshot,
  saveStoredCart,
} from "@/lib/cart";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import CartDrawer from "@/app/components/CartDrawer";
import OrderModal from "@/app/components/OrderModal";

interface Props {
  article: Article;
  recommendedProducts: Product[];
}

export default function ArticleDetailClient({
  article,
  recommendedProducts,
}: Props) {
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

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Customer Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [notes, setNotes] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (
    prod: Product,
    variant: Variant | null = null,
    qty: number = 1
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
    showToast(`✓ Berhasil menambahkan ${prod.name} ke kantong!`);
  };

  const handleOpenOrderModal = (prod: Product) => {
    setSelectedProduct(prod);
    setSelectedVariant(prod.variants.length > 0 ? prod.variants[0] : null);
    setQuantity(1);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
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
          paymentChannel: paymentMethod === "QRIS" ? "QRIS All Payment" : paymentMethod,
          notes: notes || null,
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

  const handleSingleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setOrderSubmitting(true);
    setOrderError("");

    try {
      const currentPrice = selectedVariant ? selectedVariant.price : selectedProduct.price;

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
          items: [
            {
              productId: selectedProduct.id,
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

      setSelectedProduct(null);
      router.push(`/order/${data.invoiceNumber}`);
    } catch (err: unknown) {
      setOrderError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#292925] font-sans antialiased selection:bg-[#87947B]/20">
      <Navbar
        totalCartItems={totalCartItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-[#292925] text-[#FAF8F4] px-4 py-3 rounded-sm shadow-editorial border border-[#33332D] flex items-center gap-2 text-xs font-sans animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-[#87947B] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-[#292925]/60 font-sans overflow-x-auto">
          <Link href="/" className="hover:text-[#292925] transition shrink-0">
            Beranda
          </Link>
          <ChevronRight className="w-3 h-3 text-[#292925]/40 shrink-0" />
          <Link
            href="/#edukasi"
            className="hover:text-[#292925] transition shrink-0"
          >
            The Clinical Journal
          </Link>
          <ChevronRight className="w-3 h-3 text-[#292925]/40 shrink-0" />
          <span className="text-[#292925] font-medium truncate">
            {article.category}
          </span>
        </nav>
      </div>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#EAE4DA]/60 text-[#292925] text-[10px] font-medium uppercase tracking-wider font-mono">
              {article.category}
            </span>
            <span className="text-[#292925]/60 text-xs flex items-center gap-1 font-sans">
              <Clock className="w-3.5 h-3.5 text-[#87947B]" />
              {article.readTimeMinutes} menit membaca
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#292925] tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Author Badge & Share */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 pb-5 border-b border-[#EAE4DA]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#292925] text-[#FAF8F4] flex items-center justify-center font-medium text-xs">
                {article.authorName.slice(0, 2)}
              </div>
              <div className="text-xs font-sans">
                <span className="font-medium text-[#292925] block flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#87947B]" />
                  {article.authorName}
                </span>
                <span className="text-[#292925]/60">
                  {article.authorRole}
                </span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 border border-[#EAE4DA] bg-white hover:bg-[#FAF8F4] text-[#292925] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#87947B]" />
              <span>{copiedLink ? "✓ Link Disalin!" : "Bagikan Artikel"}</span>
            </button>
          </div>
        </div>

        {/* Featured Cover Image */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden border border-[#EAE4DA] bg-[#EAE4DA]">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Excerpt Lead */}
        <div className="p-5 sm:p-6 bg-[#EAE4DA]/30 border-l-2 border-[#87947B] text-[#292925]/85 text-xs sm:text-sm font-serif italic leading-relaxed">
          &ldquo;{article.excerpt}&rdquo;
        </div>

        {/* Article Body */}
        <div className="prose prose-stone max-w-none text-xs sm:text-sm text-[#292925]/80 leading-relaxed space-y-4 font-sans">
          {article.content.split("\n\n").map((para, i) => {
            if (para.startsWith("## ")) {
              return (
                <h2
                  key={i}
                  className="font-serif text-xl sm:text-2xl text-[#292925] pt-6 border-t border-[#EAE4DA]"
                >
                  {para.replace("## ", "")}
                </h2>
              );
            }
            if (para.startsWith("### ")) {
              return (
                <h3
                  key={i}
                  className="font-serif text-lg text-[#292925] pt-3"
                >
                  {para.replace("### ", "")}
                </h3>
              );
            }
            if (para.startsWith("> ")) {
              return (
                <div
                  key={i}
                  className="p-4 bg-white border border-[#EAE4DA] text-[#292925]/80 text-xs italic font-serif"
                >
                  {para.replace("> ", "")}
                </div>
              );
            }
            return <p key={i}>{para}</p>;
          })}
        </div>

        {/* Callout Editorial Recommendation */}
        <div className="p-6 bg-white border border-[#EAE4DA] space-y-2 rounded-sm">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#87947B] block font-sans">
            Rekomendasi Klinis
          </span>
          <h4 className="font-serif text-base sm:text-lg text-[#292925]">
            Konsistensi &amp; Respek Terhadap Ritme Biologis Kulit
          </h4>
          <p className="text-xs text-[#292925]/75 leading-relaxed font-sans">
            Kulit membutuhkan durasi minimal 21-28 hari untuk menyelesaikan siklus turnover seluler. Prioritaskan bahan bio-kompatibel seperti Ceramide, Niacinamide terukur, dan Hyaluronic multi-molekul sebelum menambahkan zat eksfoliasi agresif.
          </p>
        </div>

        {/* Direct Product Recommendations Section */}
        {recommendedProducts.length > 0 && (
          <div className="pt-10 border-t border-[#EAE4DA] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#87947B] font-semibold uppercase tracking-[0.2em] block font-sans">
                  Formulasi Terkait
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-[#292925]">
                  Produk yang Disebutkan dalam Pembahasan
                </h3>
              </div>
              <Link
                href="/#katalog"
                className="text-xs font-medium text-[#87947B] hover:text-[#292925] underline hidden sm:inline font-sans"
              >
                Lihat Seluruh Koleksi →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
              {recommendedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={handleAddToCart}
                  onOpenOrderModal={handleOpenOrderModal}
                />
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="pt-8 flex justify-between items-center text-xs font-sans border-t border-[#EAE4DA]">
          <Link
            href="/#edukasi"
            className="flex items-center gap-1.5 font-medium text-[#292925]/70 hover:text-[#292925] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Jurnal Edukasi</span>
          </Link>
          <Link
            href="/#katalog"
            className="px-4 py-2 bg-[#292925] text-[#FAF8F4] hover:bg-[#87947B] uppercase tracking-wider font-medium text-xs transition"
          >
            Eksplorasi Formulasi →
          </Link>
        </div>
      </main>

      {/* Cart Drawer & Order Modal */}
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

      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant}
          quantity={quantity}
          onUpdateQuantity={setQuantity}
          onClose={() => setSelectedProduct(null)}
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
            handleAddToCart(selectedProduct, selectedVariant, quantity);
            setSelectedProduct(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
