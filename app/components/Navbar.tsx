"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingCart,
  Menu,
  X,
  Compass,
  Award,
  BookOpen,
  HelpCircle,
  MessageCircle,
  User,
  LogOut,
  Tag,
} from "lucide-react";
import CustomerAuthModal from "./CustomerAuthModal";
import NotificationDropdown, { AppNotification } from "./NotificationDropdown";

interface NavbarProps {
  totalCartItems: number;
  onOpenCart: () => void;
}

interface CustomerData {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  purchasedProductIds?: number[];
  unreadNotificationsCount?: number;
  notifications?: AppNotification[];
}

export default function Navbar({ totalCartItems, onOpenCart }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeEventBanner, setActiveEventBanner] = useState<string | null>(null);

  // Fetch current logged-in customer info
  const fetchCustomer = async () => {
    try {
      const res = await fetch("/api/customer/me");
      const data = await res.json();
      if (data.authenticated && data.customer) {
        setCustomer(data.customer);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    }
  };

  // Fetch active promo event banner (e.g. 12.1, 11.2, 10.3)
  const fetchActiveEvent = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success && data.events && data.events.length > 0) {
        const topEvent = data.events[0];
        setActiveEventBanner(topEvent.bannerText || `🔥 Promo Spesial ${topEvent.title}: Diskon ${topEvent.discountPercent}%!`);
      } else {
        setActiveEventBanner(null);
      }
    } catch {
      setActiveEventBanner(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const [resCust, resEvt] = await Promise.all([
          fetch("/api/customer/me"),
          fetch("/api/events"),
        ]);
        if (!isMounted) return;
        const custData = await resCust.json();
        if (custData.authenticated && custData.customer) {
          setCustomer(custData.customer);
        } else {
          setCustomer(null);
        }
        const evtData = await resEvt.json();
        if (evtData.success && evtData.events && evtData.events.length > 0) {
          const topEvent = evtData.events[0];
          setActiveEventBanner(
            topEvent.bannerText ||
              `🔥 Promo Spesial ${topEvent.title}: Diskon ${topEvent.discountPercent}%!`
          );
        } else {
          setActiveEventBanner(null);
        }
      } catch {
        if (isMounted) {
          setCustomer(null);
          setActiveEventBanner(null);
        }
      }
    };

    void init();

    const handleCustomerUpdate = () => fetchCustomer();
    const handleEventsUpdate = () => fetchActiveEvent();

    window.addEventListener("beautycare-customer-updated", handleCustomerUpdate);
    window.addEventListener("beautycare-events-updated", handleEventsUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("beautycare-customer-updated", handleCustomerUpdate);
      window.removeEventListener("beautycare-events-updated", handleEventsUpdate);
    };
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Close on resize to desktop (>= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/customer/logout", { method: "POST" });
      setCustomer(null);
      setIsProfileMenuOpen(false);
      setIsMobileMenuOpen(false);
      window.dispatchEvent(new Event("beautycare-customer-updated"));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Top Banner Announcement (Shows active 12.1/11.2/10.3 event or default repurchase promo) */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white text-[10px] sm:text-xs py-1.5 sm:py-2 px-3 text-center font-medium tracking-wide flex items-center justify-center gap-1 sm:gap-2 relative z-30">
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 animate-pulse" />
        <span className="truncate sm:overflow-visible font-semibold">
          {activeEventBanner || "Promo Repurchase: Kumpulkan Poin Loyalty & Gratis Ongkir Se-Indonesia"}
        </span>
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 animate-pulse" />
      </div>

      {/* Main Sticky Navbar (Highest z-index z-50 to never be buried) */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-all duration-200">
        {/* Main Navbar Header Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-18 flex items-center justify-between gap-2 relative z-50">
          {/* Brand Logo */}
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-1.5 sm:gap-2.5 group transition-transform duration-300 hover:scale-105 shrink-0"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-sm sm:shadow-md shadow-rose-500/20 group-hover:rotate-6 transition-all duration-300">
              <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 animate-pulse-glow" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-stone-900 group-hover:text-rose-600 transition-colors">
                BeautyCare<span className="text-rose-500">.</span>
              </span>
              <span className="text-[8px] sm:text-[10px] tracking-widest uppercase text-stone-400 font-semibold -mt-1">
                Aesthetic &amp; Skin
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Visible only on desktop >= lg) */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-semibold uppercase tracking-wider text-stone-600">
            <Link
              href="/#katalog"
              className="hover:text-rose-600 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-rose-500 hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
            >
              Katalog
            </Link>
            <Link
              href="/#loyalty"
              className="hover:text-rose-600 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-rose-500 hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
            >
              Loyalty Poin
            </Link>
            <Link
              href="/#edukasi"
              className="hover:text-rose-600 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-rose-500 hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
            >
              Edukasi
            </Link>
            <Link
              href="/#faq"
              className="hover:text-rose-600 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-rose-500 hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
            >
              FAQ
            </Link>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Notification Dropdown for Events & Updates */}
            <NotificationDropdown
              notifications={customer?.notifications || []}
              unreadCount={customer?.unreadNotificationsCount || 0}
              onRefresh={fetchCustomer}
            />

            {/* Cart Icon: Always visible, badge shows when totalCartItems > 0 */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenCart();
              }}
              className="relative p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border border-rose-200/90 text-stone-800 hover:text-rose-600 hover:border-rose-400 shadow-xs sm:shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center group"
              aria-label="Keranjang Belanja"
              title={
                totalCartItems > 0
                  ? `Keranjang Belanja (${totalCartItems} barang)`
                  : "Keranjang Belanja"
              }
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 group-hover:rotate-6 transition-transform" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 px-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[8px] sm:text-[10px] font-black rounded-full flex items-center justify-center shadow-xs sm:shadow-md shadow-rose-600/30 animate-pulse">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Customer Auth Button: "Login | Register" (or User Profile if logged in) */}
            {customer ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="hidden sm:flex items-center gap-2 py-1.5 px-3 rounded-lg sm:rounded-xl bg-rose-50 border border-rose-200/90 text-stone-800 hover:bg-rose-100/70 transition cursor-pointer text-xs font-bold"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {customer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[110px]">{customer.name.split(" ")[0]}</span>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 p-2 z-50 animate-fade-in-down">
                    <div className="px-3 py-2.5 border-b border-stone-100">
                      <p className="font-extrabold text-xs text-stone-900 truncate">{customer.name}</p>
                      <p className="text-[10px] text-stone-400 truncate">{customer.email}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-bold bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 text-amber-800">
                        <span>Poin Loyalitas:</span>
                        <span>{customer.loyaltyPoints || 0} Poin</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/#loyalty"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"
                      >
                        <Award className="w-3.5 h-3.5 text-rose-500" />
                        <span>Tukar Poin Diskon</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-stone-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("login");
                  setIsAuthModalOpen(true);
                }}
                className="hidden sm:flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm sm:shadow-md shadow-rose-600/25 items-center gap-1.5 cursor-pointer shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login | Register</span>
              </button>
            )}

            {/* Hamburger Button for Tablet & Mobile (Visible on < lg) */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className={`lg:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 ${
                isMobileMenuOpen
                  ? "bg-rose-50 text-rose-600 border-rose-300 shadow-xs"
                  : "bg-stone-50 text-stone-700 border-stone-200 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
              }`}
              aria-label={isMobileMenuOpen ? "Tutup Menu Navigasi" : "Buka Menu Navigasi"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-stone-800" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Dropdown Menu (Attached cleanly beneath the navbar) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-b border-stone-200/90 shadow-2xl animate-fade-in-down max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-3">
              {/* Customer status header in mobile menu */}
              {customer ? (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">{customer.name}</span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {customer.loyaltyPoints || 0} Poin • Tier {customer.loyaltyTier || "SILVER"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-rose-200"
                  >
                    <LogOut className="w-3 h-3" /> Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAuthMode("login");
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span>Login | Register Akun Customer</span>
                </button>
              )}

              {/* Navigation Links Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                {[
                  {
                    href: "/#katalog",
                    label: "Katalog Produk",
                    desc: "Pilihan formula kulit & varian ml",
                    icon: Compass,
                  },
                  {
                    href: "/#loyalty",
                    label: "Loyalty Poin & Reward",
                    desc: "Kumpulkan poin diskon belanja",
                    icon: Award,
                  },
                  {
                    href: "/#edukasi",
                    label: "Edukasi & Tips Kulit",
                    desc: "Panduan dermatologi & tren 2026",
                    icon: BookOpen,
                  },
                  {
                    href: "/#faq",
                    label: "Tanya Jawab (FAQ)",
                    desc: "BPOM, pembayaran QRIS, & kurir",
                    icon: HelpCircle,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-rose-50/80 transition-all duration-200 text-stone-700 hover:text-rose-600 group border border-stone-100 hover:border-rose-200/70 bg-stone-50/50"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white border border-stone-200/80 text-stone-600 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-rose-600">
                          {item.label}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-stone-400 truncate">
                          {item.desc}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Quick Cart Button */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCart();
                }}
                className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-700 hover:bg-rose-100/70 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-rose-600" />
                  <span className="font-bold text-xs sm:text-sm">Keranjang Belanja Anda</span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-2xs">
                  {totalCartItems} barang
                </span>
              </button>

              {/* WhatsApp Help Action */}
              <div className="pt-1">
                <a
                  href="https://wa.me/62881038322937?text=Halo%20BeautyCare,%20saya%20ingin%20konsultasi%20produk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp CS Resmi</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Global Backdrop for Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[45] bg-stone-950/50 backdrop-blur-xs transition-opacity animate-fade-in lg:hidden cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Customer Auth Modal (Login & Register) */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          fetchCustomer();
        }}
      />
    </>
  );
}
