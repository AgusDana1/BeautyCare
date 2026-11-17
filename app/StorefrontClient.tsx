"use client";

import { useState, useMemo, useEffect, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Search } from "lucide-react";

import {
  Category,
  Product,
  Variant,
  CartItem,
  HeroSlide,
  PaymentMethod,
  Article,
} from "./types/storefront";

import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import ShopByCategory from "./components/ShopByCategory";
import BestsellerShelf from "./components/BestsellerShelf";
import SkinConcernFinder from "./components/SkinConcernFinder";
import BrandStory from "./components/BrandStory";
import RoutineGuide from "./components/RoutineGuide";
import CatalogFilters from "./components/CatalogFilters";
import ProductCard from "./components/ProductCard";
import CustomerReviewsSection from "./components/CustomerReviewsSection";
import LoyaltySection from "./components/LoyaltySection";
import ArticlesSection from "./components/ArticlesSection";
import NewsletterSection from "./components/NewsletterSection";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import OrderModal from "./components/OrderModal";

interface Props {
  initialCategories: Category[];
  initialProducts: Product[];
  initialArticles?: Article[];
}

const CART_STORAGE_KEY = "beautycare_cart";

const subscribeCart = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("beautycare-cart-updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("beautycare-cart-updated", callback);
  };
};

const getCartSnapshot = () => {
  if (typeof window === "undefined") return "[]";
  try {
    return localStorage.getItem(CART_STORAGE_KEY) || "[]";
  } catch {
    return "[]";
  }
};

const getCartServerSnapshot = () => {
  return "[]";
};

export default function StorefrontClient({
  initialCategories,
  initialProducts,
  initialArticles = [],
}: Props) {
  const router = useRouter();

  // Carousel State - dynamic fetching from JSON
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoadingSlides, setIsLoadingSlides] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  // Fetch Hero Slides
  useEffect(() => {
    let isMounted = true;
    async function fetchHeroSlides() {
      try {
        setIsLoadingSlides(true);
        const res = await fetch("/api/hero-slides");
        if (!res.ok) {
          throw new Error("Gagal mengambil data hero slides");
        }
        const data: HeroSlide[] = await res.json();
        if (isMounted) {
          setSlides(data);
        }
      } catch (err) {
        console.error("Error fetching hero slides via API, fallback to static JSON:", err);
        try {
          const fallbackRes = await fetch("/data/hero-slides.json");
          if (fallbackRes.ok && isMounted) {
            const fallbackData: HeroSlide[] = await fallbackRes.json();
            setSlides(fallbackData);
          }
        } catch (fallbackErr) {
          console.error("Error fetching fallback JSON:", fallbackErr);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSlides(false);
        }
      }
    }

    fetchHeroSlides();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("recommended");

  // Cart State (Persisted in localStorage via useSyncExternalStore)
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

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // "Pesan Sekarang" Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Customer Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [notes, setNotes] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  // Save cart helper
  const updateCart = (newCart: CartItem[]) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      window.dispatchEvent(new Event("beautycare-cart-updated"));
    } catch (err) {
      console.error("Failed to save cart", err);
    }
  };

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Total quantity across all items in cart
  const totalCartItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Slide navigation
  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-play slider with pause on hover/touch
  useEffect(() => {
    if (isSliderPaused || slides.length === 0) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isSliderPaused, nextSlide, slides.length]);

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
        const matchesCategory =
          selectedCategory === "ALL" ||
          product.category.slug === selectedCategory ||
          product.categoryId.toString() === selectedCategory;

        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());

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
        return 0;
      });
  }, [initialProducts, selectedCategory, searchQuery, selectedSizeFilter, sortBy]);

  // Add Item to Cart
  const handleAddToCart = (product: Product, variant: Variant | null = null, qty = 1) => {
    const chosenVariant =
      variant || (product.hasVariants && product.variants.length > 0 ? product.variants[0] : null);
    const itemPrice = chosenVariant ? chosenVariant.price : product.price;
    const itemSize = chosenVariant ? chosenVariant.size : null;
    const variantId = chosenVariant ? chosenVariant.id : null;

    const existingIndex = cart.findIndex(
      (c) => c.productId === product.id && c.variantId === variantId
    );

    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      updatedCart = [...cart];
      updatedCart[existingIndex].quantity += qty;
    } else {
      updatedCart = [
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          variantId,
          selectedSize: itemSize,
          price: itemPrice,
          quantity: qty,
        },
      ];
    }

    updateCart(updatedCart);
    showToast(
      `✓ ${qty}x ${product.name} ${itemSize ? `(${itemSize})` : ""} ditambahkan ke kantong belanja!`
    );
  };

  // Modify cart item quantity
  const handleUpdateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    const updated = [...cart];
    updated[index].quantity = newQty;
    updateCart(updated);
  };

  // Remove cart item
  const handleRemoveCartItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    updateCart(updated);
  };

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

  // Submit Instant Single-Product Order
  const handleConfirmInstantOrder = async (
    e: React.FormEvent,
    redeemPoints: number = 0
  ) => {
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
        redeemPoints,
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
        throw new Error(data.error || "Failed to process order");
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

  // Submit Multi-Item Cart Order
  const handleConfirmCartOrder = async (
    e: React.FormEvent,
    redeemPoints: number = 0
  ) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setOrderSubmitting(true);
    setOrderError("");

    try {
      const payload = {
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        paymentMethod,
        paymentChannel: paymentMethod === "QRIS" ? "QRIS All Payment" : paymentMethod,
        notes,
        redeemPoints,
        items: cart.map((c) => ({
          productId: c.productId,
          variantId: c.variantId,
          selectedSize: c.selectedSize,
          quantity: c.quantity,
          price: c.price,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process cart order");
      }
      
      // Clear cart
      updateCart([]);
      setIsCartOpen(false);
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

  const totalCartPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#292925] flex flex-col selection:bg-[#87947B]/20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-[80] bg-[#292925] text-[#FAF8F4] text-xs font-medium px-4 py-3 rounded-sm shadow-editorial border border-[#33332D] flex items-center gap-2 animate-fade-in-up font-sans">
          <CheckCircle2 className="w-4 h-4 text-[#87947B] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1 & 2. Announcement Bar & Minimalist Navbar */}
      <Navbar totalCartItems={totalCartItems} onOpenCart={() => setIsCartOpen(true)} />

      {/* 3. Editorial Hero Section */}
      <HeroSlider
        slides={slides}
        isLoading={isLoadingSlides}
        currentSlide={currentSlide}
        onSelectSlide={setCurrentSlide}
        onNext={nextSlide}
        onPrev={prevSlide}
        onPauseToggle={setIsSliderPaused}
        onSelectCategory={setSelectedCategory}
      />

      {/* 4. Shop by Category */}
      <ShopByCategory
        categories={initialCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 5. Best-Selling Products */}
      <BestsellerShelf
        products={initialProducts}
        onAddToCart={handleAddToCart}
        onOpenOrderModal={handleOpenOrderModal}
      />

      {/* 6. Skin Concern Finder */}
      <SkinConcernFinder
        products={initialProducts}
        onSelectCategory={setSelectedCategory}
        onOpenOrderModal={handleOpenOrderModal}
      />

      {/* Catalog & Filter Section */}
      <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full flex-1">
        <div className="space-y-8 sm:space-y-10">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#87947B]">
              Koleksi Lengkap
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#292925] tracking-tight">
              Eksplorasi Seluruh Formulasi
            </h2>
            <p className="text-xs sm:text-sm text-[#292925]/70 max-w-xl font-sans">
              Temukan formula yang tepat berdasarkan kategori, bahan aktif, atau ukuran kemasan yang Anda butuhkan.
            </p>
          </div>

          {/* Filter Toolbar */}
          <CatalogFilters
            categories={initialCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            allSizes={allSizes}
            selectedSizeFilter={selectedSizeFilter}
            onSelectSizeFilter={setSelectedSizeFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalResults={filteredProducts.length}
          />

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-sm p-12 sm:p-20 text-center border border-[#EAE4DA] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EAE4DA]/50 text-[#87947B] mx-auto flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-[#292925]">Tidak ada formulasi yang sesuai</h3>
              <p className="text-xs text-[#292925]/60 max-w-sm mx-auto font-sans">
                Cobalah mengubah kata kunci pencarian atau sesuaikan pilihan filter kategori dan ukuran ml.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSearchQuery("");
                  setSelectedSizeFilter("ALL");
                }}
                className="mt-2 text-xs font-medium text-[#87947B] hover:text-[#292925] underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onOpenOrderModal={handleOpenOrderModal}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. Brand Story ("The Philosophy") */}
      <BrandStory />

      {/* 8. Product Education ("The Daily Ritual" & Clinical Journal) */}
      <RoutineGuide />
      <ArticlesSection articles={initialArticles} />

      {/* 9. Customer Reviews */}
      <CustomerReviewsSection />

      {/* 10. BeautyCare Rewards (Privilege Club) */}
      <LoyaltySection />

      {/* 11. Newsletter */}
      <NewsletterSection />

      {/* FAQ Section */}
      <FaqSection />

      {/* 12. Professional Footer */}
      <Footer categories={initialCategories} onSelectCategory={setSelectedCategory} />

      {/* Cart Drawer */}
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
        onSubmitOrder={handleConfirmCartOrder}
      />

      {/* Order Modal */}
      <OrderModal
        product={selectedProduct}
        selectedVariant={selectedVariant}
        onSelectVariant={setSelectedVariant}
        quantity={quantity}
        onUpdateQuantity={setQuantity}
        onClose={handleCloseOrderModal}
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
        onSubmitOrder={handleConfirmInstantOrder}
        onAddToCart={() => {
          if (selectedProduct) {
            handleAddToCart(selectedProduct, selectedVariant, quantity);
            handleCloseOrderModal();
          }
        }}
      />
    </div>
  );
}
