"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  User,
  LogOut,
  Award,
  Search,
  ShoppingBag,
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
              `Promo Spesial ${topEvent.title}: Diskon ${topEvent.discountPercent}% dengan kode ${topEvent.code}`
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

    init();

    const handleCustomerUpdate = () => fetchCustomer();
    const handleEventsUpdate = () => {
      fetch("/api/events")
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.events && data.events.length > 0) {
            setActiveEventBanner(data.events[0].bannerText || `Promo Spesial ${data.events[0].title}`);
          } else {
            setActiveEventBanner(null);
          }
        })
        .catch(() => {});
    };

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
      {/* Editorial Announcement Bar */}
      <div className="bg-[#EAE4DA] text-[#292925] text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wider border-b border-[#E0D8CB] transition-colors relative z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span>
            {activeEventBanner ||
              "Gratis pengiriman ke seluruh Indonesia untuk pesanan di atas Rp 300.000 — Formula botani teruji klinis BPOM"}
          </span>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-[#EAE4DA] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand Logo - Editorial Luxury Aesthetic */}
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 group shrink-0"
          >
            <span className="font-serif text-xl sm:text-2xl tracking-[0.2em] font-normal text-[#292925] uppercase transition-opacity hover:opacity-80">
              BeautyCare
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[12px] font-medium tracking-[0.12em] uppercase text-[#57564F]">
            <Link
              href="/#katalog"
              className="hover:text-[#292925] transition-colors py-1 relative hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#292925] after:transition-all after:duration-300"
            >
              Koleksi
            </Link>
            <Link
              href="/#concerns"
              className="hover:text-[#292925] transition-colors py-1 relative hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#292925] after:transition-all after:duration-300"
            >
              Kebutuhan Kulit
            </Link>
            <Link
              href="/#philosophy"
              className="hover:text-[#292925] transition-colors py-1 relative hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#292925] after:transition-all after:duration-300"
            >
              Filosofi
            </Link>
            <Link
              href="/#ritual"
              className="hover:text-[#292925] transition-colors py-1 relative hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#292925] after:transition-all after:duration-300"
            >
              Panduan Rutinitas
            </Link>
            <Link
              href="/#loyalty"
              className="hover:text-[#292925] transition-colors py-1 relative hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#292925] after:transition-all after:duration-300"
            >
              Keanggotaan
            </Link>
          </nav>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-3 sm:gap-5 text-[#292925]">
            {/* Search shortcut */}
            <Link
              href="/#katalog"
              className="p-1.5 hover:text-[#87947B] transition-colors"
              title="Cari Produk"
              aria-label="Cari Produk"
            >
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[1.75]" />
            </Link>

            {/* Notification Dropdown for Events & Updates */}
            <NotificationDropdown
              notifications={customer?.notifications || []}
              unreadCount={customer?.unreadNotificationsCount || 0}
              onRefresh={fetchCustomer}
            />

            {/* Customer Auth / Profile */}
            {customer ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="hidden sm:flex items-center gap-2 py-1.5 px-3 rounded-full border border-[#EAE4DA] bg-[#F5F1EB] hover:bg-[#EAE4DA] transition text-xs font-medium text-[#292925] cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-[#87947B] text-white flex items-center justify-center text-[10px] font-semibold">
                    {customer.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="truncate max-w-[100px]">{customer.name.split(" ")[0]}</span>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#FAF8F4] border border-[#EAE4DA] shadow-editorial p-3 z-50 text-[#292925]">
                    <div className="pb-3 border-b border-[#EAE4DA]">
                      <p className="font-serif text-base font-medium truncate">{customer.name}</p>
                      <p className="text-[11px] text-[#57564F] truncate">{customer.email}</p>
                      <div className="mt-2.5 flex items-center justify-between text-xs py-1.5 px-2.5 bg-[#F2F5F0] border border-[#D5DDD0] text-[#4A5543]">
                        <span>Saldo Loyalitas</span>
                        <span className="font-semibold">{customer.loyaltyPoints || 0} Poin</span>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <Link
                        href="/#loyalty"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#57564F] hover:text-[#292925] hover:bg-[#EAE4DA]/50 transition"
                      >
                        <Award className="w-3.5 h-3.5 text-[#87947B]" />
                        <span>Klub Keanggotaan</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-[#EAE4DA]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#C99A91] hover:text-[#B27B71] hover:bg-[#F9F3F1] transition cursor-pointer text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Akun</span>
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
                className="hidden sm:inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium hover:text-[#87947B] transition cursor-pointer py-1"
              >
                <User className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Masuk</span>
              </button>
            )}

            {/* Shopping Bag Icon */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenCart();
              }}
              className="flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase hover:text-[#87947B] transition cursor-pointer p-1"
              aria-label="Kantong Belanja"
              title="Kantong Belanja"
            >
              <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[1.75]" />
              <span className="text-xs">
                {totalCartItems > 0 ? `(${totalCartItems})` : ""}
              </span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-1.5 text-[#292925] hover:text-[#87947B] transition cursor-pointer"
              aria-label={isMobileMenuOpen ? "Tutup Navigasi" : "Buka Navigasi"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[1.75]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[1.75]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Menu with Backdrop Overlay */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay to close menu and avoid clashing */}
            <div
              className="fixed inset-0 top-16 sm:top-20 bg-black/40 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            {/* Slide-down Menu Panel with independent scroll */}
            <div className="absolute top-full left-0 right-0 max-h-[calc(100dvh-4.5rem)] overflow-y-auto bg-[#FAF8F4] border-b border-[#EAE4DA] px-5 py-6 space-y-6 shadow-2xl z-50 lg:hidden animate-fade-in">
              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-3.5 text-xs sm:text-sm font-medium tracking-widest uppercase text-[#292925]">
                <Link
                  href="/#katalog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-[#87947B] transition-colors py-2 border-b border-[#EAE4DA] flex items-center justify-between"
                >
                  <span>Koleksi Produk</span>
                  <span className="text-[#87947B] text-xs">→</span>
                </Link>
                <Link
                  href="/#concerns"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-[#87947B] transition-colors py-2 border-b border-[#EAE4DA] flex items-center justify-between"
                >
                  <span>Kebutuhan Kulit</span>
                  <span className="text-[#87947B] text-xs">→</span>
                </Link>
                <Link
                  href="/#philosophy"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-[#87947B] transition-colors py-2 border-b border-[#EAE4DA] flex items-center justify-between"
                >
                  <span>Filosofi Kami</span>
                  <span className="text-[#87947B] text-xs">→</span>
                </Link>
                <Link
                  href="/#ritual"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-[#87947B] transition-colors py-2 border-b border-[#EAE4DA] flex items-center justify-between"
                >
                  <span>Panduan Rutinitas</span>
                  <span className="text-[#87947B] text-xs">→</span>
                </Link>
                <Link
                  href="/#loyalty"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-[#87947B] transition-colors py-2 border-b border-[#EAE4DA] flex items-center justify-between"
                >
                  <span>Keanggotaan &amp; Reward</span>
                  <span className="text-[#87947B] text-xs">→</span>
                </Link>
                <Link
                  href="/#edukasi"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-[#87947B] transition-colors py-2 border-b border-[#EAE4DA] flex items-center justify-between"
                >
                  <span>The Clinical Journal</span>
                  <span className="text-[#87947B] text-xs">→</span>
                </Link>
              </div>

              {/* Mobile Auth Area */}
              <div className="pt-2">
                {customer ? (
                  <div className="p-4 bg-[#F5F1EB] border border-[#EAE4DA] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-serif text-base font-medium text-[#292925]">{customer.name}</p>
                        <p className="text-xs text-[#57564F]">{customer.email}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-[#87947B] text-white rounded">
                        {customer.loyaltyPoints || 0} Poin
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-xs font-medium text-[#C99A91] hover:underline cursor-pointer"
                    >
                      Keluar Akun
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setAuthMode("login");
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-3 bg-[#292925] text-white text-xs tracking-widest uppercase font-medium text-center hover:bg-[#87947B] transition cursor-pointer"
                  >
                    Masuk atau Daftar Akun
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Customer Auth Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          fetchCustomer();
          window.dispatchEvent(new Event("beautycare-customer-updated"));
        }}
      />
    </>
  );
}
