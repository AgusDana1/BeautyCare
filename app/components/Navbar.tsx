"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingCart,
  ShoppingBag,
  Menu,
  X,
  Compass,
  Award,
  BookOpen,
  HelpCircle,
  MessageCircle,
} from "lucide-react";

interface NavbarProps {
  totalCartItems: number;
  onOpenCart: () => void;
}

export default function Navbar({ totalCartItems, onOpenCart }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <>
      {/* Top Banner Announcement */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white text-[10px] sm:text-xs py-1.5 sm:py-2 px-3 text-center font-medium tracking-wide flex items-center justify-center gap-1 sm:gap-2 relative z-30">
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 animate-pulse" />
        <span className="truncate sm:overflow-visible">
          Promo Repurchase: Kumpulkan Poin Loyalty &amp; Gratis Ongkir Se-Indonesia
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

            {/* Desktop CTA Button (Visible on sm and above) */}
            <Link
              href="/#katalog"
              className="hidden sm:flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm sm:shadow-md shadow-rose-500/25 items-center gap-1 sm:gap-2 group cursor-pointer shrink-0"
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:rotate-12 transition-transform duration-200" />
              <span>Belanja Sekarang</span>
            </Link>

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

        {/* Mobile & Tablet Dropdown Menu (Attached cleanly beneath the navbar, NEVER buried or overlapping) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-b border-stone-200/90 shadow-2xl animate-fade-in-down max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-3">
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

              {/* Quick Action Buttons */}
              <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href="https://wa.me/62881038322937?text=Halo%20BeautyCare,%20saya%20ingin%20konsultasi%20produk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp CS Resmi</span>
                </a>

                <Link
                  href="/#katalog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Belanja Sekarang</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Global Backdrop for Mobile Menu (Placed outside nav at z-[45] so it covers page content cleanly) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[45] bg-stone-950/50 backdrop-blur-xs transition-opacity animate-fade-in lg:hidden cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
