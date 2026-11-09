"use client";

import Link from "next/link";
import { Sparkles, ShoppingCart, ShoppingBag } from "lucide-react";

interface NavbarProps {
  totalCartItems: number;
  onOpenCart: () => void;
}

export default function Navbar({ totalCartItems, onOpenCart }: NavbarProps) {
  return (
    <>
      {/* Top Banner Announcement */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white text-[11px] sm:text-xs py-2 px-3 text-center font-medium tracking-wide flex items-center justify-center gap-1.5 sm:gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
        <span className="truncate sm:overflow-visible">
          Promo Spesial: Gratis Ongkir Seluruh Indonesia &amp; Diskon Varian Ukuran (ml)
        </span>
        <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
      </div>

      {/* Main Sticky Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/60 shadow-xs transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 group transition-transform duration-300 hover:scale-105 shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:rotate-6 transition-all duration-300">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse-glow" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 group-hover:text-rose-600 transition-colors">
                BeautyCare<span className="text-rose-500">.</span>
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-stone-400 font-semibold -mt-1">
                Aesthetic &amp; Skin
              </span>
            </div>
          </Link>

          {/* Nav Links (Desktop & Tablet) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold uppercase tracking-wider text-stone-600">
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
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* REQUIREMENT: TAMPILKAN ICON KERANJANG DI NAVBAR BILA USER SUDAH MEMESAN / MEMILIH BARANG LEBIH DARI 1 */}
            {totalCartItems > 1 && (
              <button
                onClick={onOpenCart}
                className="relative p-2 sm:p-2.5 rounded-xl bg-white border border-rose-200/90 text-stone-800 hover:text-rose-600 hover:border-rose-400 shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center animate-fade-in-up group"
                aria-label="Keranjang Belanja"
                title={`Keranjang Belanja (${totalCartItems} barang)`}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 group-hover:rotate-6 transition-transform" />
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-rose-600/30 animate-pulse">
                  {totalCartItems}
                </span>
              </button>
            )}

            <a
              href="#katalog"
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-rose-500/25 flex items-center gap-1.5 sm:gap-2 group cursor-pointer shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-200" />
              <span className="hidden xs:inline sm:inline">Belanja</span>
              <span className="hidden sm:inline">Sekarang</span>
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
