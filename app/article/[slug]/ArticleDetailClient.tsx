"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Clock,
  UserCheck,
  Share2,
  Sparkles,
  ArrowLeft,
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
    showToast(`✓ Berhasil menambahkan ${prod.name} ke keranjang!`);
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
    if (!selectedProduct) return;
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
              productId: selectedProduct.id,
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

      setSelectedProduct(null);
      router.push(`/order/${data.invoiceNumber}`);
    } catch (err: unknown) {
      setOrderError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f5] text-stone-900 font-sans antialiased">
      <Navbar
        totalCartItems={totalCartItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700/50 flex items-center gap-2.5 text-xs sm:text-sm">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <nav className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-stone-500 font-medium overflow-x-auto">
          <Link href="/" className="hover:text-rose-600 transition shrink-0">
            Beranda
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
          <Link
            href="/#edukasi"
            className="hover:text-rose-600 transition shrink-0"
          >
            Edukasi &amp; Tips
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
          <span className="text-stone-800 font-semibold truncate">
            {article.category}
          </span>
        </nav>
      </div>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              {article.category}
            </span>
            <span className="text-stone-400 text-xs flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readTimeMinutes} menit baca
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Author Badge & Share */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-4 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                {article.authorName.slice(0, 2)}
              </div>
              <div>
                <span className="font-extrabold text-xs sm:text-sm text-stone-900 block flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {article.authorName}
                </span>
                <span className="text-[10px] sm:text-xs text-stone-500">
                  {article.authorRole}
                </span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? "✓ Link Disalin!" : "Bagikan Tips"}</span>
            </button>
          </div>
        </div>

        {/* Featured Cover Image */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-stone-200">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Excerpt Lead */}
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-100 text-stone-700 text-xs sm:text-sm font-medium leading-relaxed italic">
          &ldquo;{article.excerpt}&rdquo;
        </div>

        {/* Article Body */}
        <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-700 leading-relaxed space-y-4">
          {article.content.split("\n\n").map((para, i) => {
            if (para.startsWith("## ")) {
              return (
                <h2
                  key={i}
                  className="text-lg sm:text-xl font-black text-stone-900 pt-4 border-t border-stone-100"
                >
                  {para.replace("## ", "")}
                </h2>
              );
            }
            if (para.startsWith("### ")) {
              return (
                <h3
                  key={i}
                  className="text-base sm:text-lg font-bold text-stone-900 pt-2"
                >
                  {para.replace("### ", "")}
                </h3>
              );
            }
            if (para.startsWith("> ")) {
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-xs italic"
                >
                  {para.replace("> ", "")}
                </div>
              );
            }
            return <p key={i}>{para}</p>;
          })}
        </div>

        {/* Callout Doctor Recommendation */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Saran Khusus dari Dermatologist</span>
          </div>
          <h4 className="text-sm sm:text-base font-extrabold text-stone-900">
            Kunci Keberhasilan: Konsistensi Pemakaian &amp; Formulasi Sesuai Kebutuhan
          </h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            Kulit membutuhkan waktu minimal 21-28 hari untuk proses regenerasi sel baru. Hindari berganti-ganti produk secara drastis dalam jangka pendek dan prioritaskan kandungan pemulih barrier seperti Ceramide, Niacinamide, dan Hyaluronic Acid.
          </p>
        </div>

        {/* Direct Product Recommendations Section */}
        {recommendedProducts.length > 0 && (
          <div className="pt-8 border-t border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider block">
                  Rekomendasi Produk Terkait
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                  Produk Pilihan yang Disebutkan dalam Panduan Ini
                </h3>
              </div>
              <Link
                href="/#katalog"
                className="text-xs font-bold text-rose-600 hover:underline hidden sm:inline"
              >
                Lihat Semua Produk →
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

        {/* Back to Blog / Articles Link */}
        <div className="pt-6 flex justify-between items-center text-xs">
          <Link
            href="/#edukasi"
            className="flex items-center gap-1.5 font-bold text-stone-600 hover:text-rose-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Edukasi</span>
          </Link>
          <Link
            href="/#katalog"
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
          >
            Belanja Produk Skincare →
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
