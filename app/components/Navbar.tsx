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
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white text-[10px] sm:text-xs py-1.5 sm:py-2 px-3 text-center font-medium tracking-wide flex items-center justify-center gap-1 sm:gap-2">
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 animate-pulse" />
        <span className="truncate sm:overflow-visible">
          Promo Repurchase: Kumpulkan Poin Loyalty &amp; Gratis Ongkir Se-Indonesia
        </span>
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 animate-pulse" />
      </div>

      {/* Main Sticky Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/60 shadow-xs transition-all duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-13 sm:h-18 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Brand Logo */}
          <Link
            href="/"
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

          {/* Desktop Nav Links (Hidden on tablet & mobile < lg) */}
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
              onClick={onOpenCart}
              className="relative p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border border-rose-200/90 text-stone-800 hover:text-rose-600 hover:border-rose-400 shadow-xs sm:shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group"
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

            {/* Desktop CTA Button */}
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
              className="lg:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all duration-200 cursor-pointer flex items-center justify-center"
              aria-label={isMobileMenuOpen ? "Tutup Menu" : "Buka Menu"}
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

        {/* Mobile & Tablet Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop: Clicking outside automatically closes the menu */}
            <div
              className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity animate-fade-in cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-in drawer container */}
            <div
              className="fixed inset-y-0 right-0 w-full max-w-[280px] sm:max-w-xs bg-white shadow-2xl flex flex-col justify-between z-10 animate-fade-in-up cursor-default border-l border-stone-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-3.5 sm:p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-stone-900 leading-tight">
                      BeautyCare<span className="text-rose-500">.</span>
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-stone-400 font-semibold leading-tight">
                      Menu Navigasi
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
                  aria-label="Tutup Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-1">
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
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-rose-50/80 transition-all duration-200 text-stone-700 hover:text-rose-600 group border border-transparent hover:border-rose-100/70"
                    >
                      <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-500 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-stone-900 group-hover:text-rose-600">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-stone-400 truncate">
                          {item.desc}
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {/* Mobile Cart Quick Trigger */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenCart();
                  }}
                  className="w-full mt-2 flex items-center justify-between p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 hover:bg-rose-100/70 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-3.5 h-3.5 text-rose-600" />
                    <span className="font-bold text-xs">Keranjang Belanja</span>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white">
                    {totalCartItems} barang
                  </span>
                </button>
              </div>

              {/* Bottom Quick Actions */}
              <div className="p-3 sm:p-4 border-t border-stone-100 bg-stone-50/60 space-y-2">
                <a
                  href="https://wa.me/62881038322937?text=Halo%20BeautyCare,%20saya%20ingin%20konsultasi%20produk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-lg sm:rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp CS Resmi</span>
                </a>

                <Link
                  href="/#katalog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2 px-3 rounded-lg sm:rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Mulai Belanja</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
