import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeautyCare - Solusi Perawatan Kecantikan & Kulit Premium",
  description:
    "Toko produk perawatan kecantikan, skincare, bodycare, dan perawatan kulit terbaik dengan varian ukuran lengkap.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#faf7f5] text-stone-900 font-sans">
        {children}
      </body>
    </html>
  );
}
