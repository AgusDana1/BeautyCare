<div align="center">

<!-- 3D Animated Hero Showcase -->
<img src="./assets/readme/hero-3d.svg" alt="BeautyCare 3D Showcase Banner" width="100%" />

<br />

# ✨ BeautyCare — Next-Gen Luxury Skincare &amp; Retention Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.5_Turbopack-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-20232a?style=for-the-badge&logo=react&logoColor=61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38b2ac?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-v7.10-2d3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MariaDB / MySQL](https://img.shields.io/badge/MariaDB-Driver_Adapter-003545?style=for-the-badge&logo=mariadb&logoColor=white)](https://mariadb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-rose?style=for-the-badge)](LICENSE)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)](#)

<p align="center">
  <b>Platform e-commerce dan klinik perawatan kecantikan modern kelas enterprise dengan performa tinggi (Next.js 16 Partial Prerendering), sistem loyalitas retensi pelanggan, otomasi promo tanggal kembar (12.1 • 11.2 • 10.3), dan bukti ulasan pembeli terverifikasi (Verified Buyer Reviews).</b>
</p>

[🌐 Jelajahi Toko](#-panduan-instalasi--menjalankan-project) • [🛠️ Arsitektur 3D](#-arsitektur-sistem-3d--topologi) • [🚀 Cara Menjalankan](#-panduan-instalasi--menjalankan-project) • [📱 Fitur Unggulan](#-fitur-unggulan-aplikasi) • [🛡️ Dashboard Admin](#-dashboard-manajemen-admin)

---

</div>

<br />

## 📑 Daftar Isi

- [🌟 Tentang BeautyCare](#-tentang-beautycare)
- [✨ Fitur Unggulan Aplikasi](#-fitur-unggulan-aplikasi)
  - [🛍️ 1. Katalog &amp; Varian Ukuran Dinamis (ml)](#1-katalog--varian-ukuran-dinamis-ml)
  - [🛒 2. Universal Cart &amp; QRIS Checkout Dinamis](#2-universal-cart--qris-checkout-dinamis)
  - [👑 3. Loyalty Points &amp; Program Retensi Pelanggan](#3-loyalty-points--program-retensi-pelanggan)
  - [⭐ 4. Verified Buyer Reviews &amp; Dokumentasi Media](#4-verified-buyer-reviews--dokumentasi-media)
  - [🎉 5. Otomasi Event Promo Tanggal Kembar (12.1, 11.2, 10.3)](#5-otomasi-event-promo-tanggal-kembar-121-112-103)
  - [🔔 6. Pusat Notifikasi Pelanggan](#6-pusat-notifikasi-pelanggan)
  - [📖 7. CMS Edukasi &amp; Blog Dokter Kulit (Dermatologist)](#7-cms-edukasi--blog-dokter-kulit-dermatologist)
  - [⚙️ 8. Dashboard Manajemen Admin Terpadu &amp; Cetak Invoice](#8-dashboard-manajemen-admin-terpadu--cetak-invoice)
  - [📱 9. Desain Ultra-Responsif Mobile, Tablet &amp; Desktop](#9-desain-ultra-responsif-mobile-tablet--desktop)
- [📐 Arsitektur Sistem 3D &amp; Topologi](#-arsitektur-sistem-3d--topologi)
- [🧰 Tech Stack &amp; Dependensi](#-tech-stack--dependensi)
- [📋 Prasyarat Sistem (Prerequisites)](#-prasyarat-sistem-prerequisites)
- [🚀 Panduan Instalasi &amp; Menjalankan Project](#-panduan-instalasi--menjalankan-project)
  - [Langkah 1: Clone Repository](#langkah-1-clone-repository)
  - [Langkah 2: Masuk ke Direktori Project](#langkah-2-masuk-ke-direktori-project)
  - [Langkah 3: Install Dependensi](#langkah-3-install-dependensi)
  - [Langkah 4: Konfigurasi Environment Variables (`.env`)](#langkah-4-konfigurasi-environment-variables-env)
  - [Langkah 5: Sinkronisasi Skema Database (Prisma DB Push)](#langkah-5-sinkronisasi-skema-database-prisma-db-push)
  - [Langkah 6: Seeding Data Awal (Kategori, Produk, Admin)](#langkah-6-seeding-data-awal-kategori-produk-admin)
  - [Langkah 7: Jalankan Server Development](#langkah-7-jalankan-server-development)
- [🔑 Kredensial Akun Pengujian (Demo Accounts)](#-kredensial-akun-pengujian-demo-accounts)
- [📂 Struktur Direktori Project](#-struktur-direktori-project)
- [🗄️ Model Data &amp; Relasi Database (ERD)](#️-model-data--relasi-database-erd)
- [📜 Script NPM yang Tersedia](#-script-npm-yang-tersedia)
- [🛡️ Keamanan &amp; Standar Rekayasa Perangkat Lunak](#️-keamanan--standar-rekayasa-perangkat-lunak)
- [❓ FAQ &amp; Troubleshooting](#-faq--troubleshooting)
- [📄 Lisensi &amp; Kontribusi](#-lisensi--kontribusi)

---

## 🌟 Tentang BeautyCare

**BeautyCare** adalah solusi e-commerce end-to-end modern yang dibangun khusus untuk industri kosmetik, klinik dermatologi, dan perawatan kecantikan (*beauty &amp; personal care*). Produk kecantikan merupakan barang habis pakai yang memiliki tingkat pembelian berulang (*repurchase*) yang sangat tinggi.

Proyek ini dibangun menggunakan arsitektur termutakhir **Next.js 16 App Router** dengan **Partial Prerendering (PPR)** dan engine **Turbopack**, dirancang untuk memenuhi standar toko online komersial dengan performa tinggi, keamanan sesi berlapis, serta pengalaman pengguna (*UI/UX*) yang mewah, bersih, dan interaktif.

### 🎯 Nilai Utama yang Dihadirkan:
1. **Keaslian Terjamin (Anti-Fraud Social Proof)**: Penilaian produk hanya dapat diberikan oleh akun pelanggan yang telah terbukti menyelesaikan pesanan barang tersebut (*Verified Buyer*), lengkap dengan bukti foto dan video asli.
2. **Mesin Retensi Pelanggan**: Sistem Poin Loyalitas otomatis bertambah saat berbelanja dan langsung dapat ditukarkan menjadi potongan harga pada transaksi berikutnya.
3. **Otomasi Kampanye Musiman**: Konfigurasi instan untuk kampanye tanggal dan bulan khusus (seperti **12.1 Harbolnas, 11.2 Glow Up Day, 10.3 Cantik Alami**), yang langsung menyinkronkan pengumuman bilah atas (*top notification bar*) dan siaran notifikasi ke pusat pesan pelanggan.
4. **Alur Kerja Pemenuhan Pesanan Lengkap**: Dari keranjang belanja, generate QRIS dinamis instan, sinkronisasi stok realtime, hingga pembuatan lembar invoice cetak resmi (*print-ready layout*).

---

## ✨ Fitur Unggulan Aplikasi

| Kategori | Fitur Utama | Deskripsi Singkat |
| :--- | :--- | :--- |
| **Storefront** | 🛍️ Multi-Varian Ukuran (ml) | Pilihan ukuran (30ml, 50ml, 100ml) dengan harga &amp; stok dinamis. |
| **Transaksi** | 💳 Checkout QRIS Instan | Integrasi pembayaran QRIS otomatis lengkap dengan nomor invoice unik. |
| **Retensi** | 👑 Sistem Poin Loyalitas | Dapatkan 1 poin per kelipatan Rp 1.000 belanja + Bonus 50 Poin pendaftaran. |
| **Social Proof** | ⭐ Verified Buyer Reviews | Ulasan &amp; penilaian bintang 1-5 eksklusif pembeli + lampiran media foto/video. |
| **Pemasaran** | 🎉 Event Promo 12.1 / 11.2 / 10.3 | Pengaturan diskon musiman dengan banner pengumuman &amp; broadcast notifikasi. |
| **Pusat Pesan** | 🔔 Interactive Notification Hub | Dropdown lonceng notifikasi realtime untuk update event &amp; pesanan. |
| **Konten** | 📖 CMS Edukasi Kulit | Artikel informatif berbasis SEO karya spesialis dermatologi bersertifikasi. |
| **Manajemen** | ⚙️ Studio Admin &amp; Invoice | Pengelolaan katalog, kontrol stok varian, status pesanan, dan cetak invoice. |
| **Responsivitas**| 📱 Mobile-First UX | Hamburger menu dengan z-index protektif, modal backdrop close, UI ringkas. |

---

### 1. Katalog &amp; Varian Ukuran Dinamis (ml)
- Pelanggan dapat memilih produk kecantikan berdasarkan kategori (Skincare, Body Care, Hair Care, Serum &amp; Treatment, Beauty Tools).
- Dukungan varian ukuran (misal: **30ml**, **50ml**, **100ml**). Saat varian dipilih:
  - Harga dasar produk otomatis disesuaikan secara realtime.
  - Jumlah stok tersisa langsung diperbarui sesuai stok spesifik varian tersebut.
  - Estimasi perolehan poin loyalitas dihitung otomatis berdasarkan harga varian.

### 2. Universal Cart &amp; QRIS Checkout Dinamis
- Ikon keranjang belanja (*Cart Drawer*) selalu tampil di navbar, menampilkan *badge counter* jumlah barang.
- Drawer keranjang interaktif: ubah kuantitas (+/-), hapus item, dan tutup otomatis saat mengklik area luar (*click outside backdrop*).
- Form pemesanan terintegrasi dengan generator QRIS dinamis bertenaga library `@types/qrcode` dan kode invoice acak berstandar akuntansi (`INV-YYYYMMDD-XXXX`).

### 3. Loyalty Points &amp; Program Retensi Pelanggan
- **Bonus Registrasi**: Setiap pelanggan baru yang mendaftar langsung mendapatkan bonus selamat datang **50 Poin Loyalitas**.
- **Perolehan Poin Belanja**: Dapatkan 1 poin untuk setiap pembelanjaan Rp 1.000.
- **Penukaran Diskon**: 1 poin loyalitas dapat ditukarkan menjadi potongan harga senilai Rp 100 pada transaksi belanja berikutnya.
- Pelanggan dapat memantau saldo poin dan riwayat transaksi poin langsung dari header navbar atau menu akun.

### 4. Verified Buyer Reviews &amp; Dokumentasi Media
- **Proteksi Kejujuran Ulasan**: Tombol *"Tulis Penilaian Produk"* di halaman detail produk dilengkapi sistem validasi ganda:
  1. *Wajib Login*: Jika belum login, modal autentikasi otomatis terbuka.
  2. *Wajib Telah Membeli*: Sistem mengecek riwayat pesanan pelanggan. Jika belum pernah memesan produk tersebut, muncul modal peringatan bahwa ulasan hanya dibuka untuk pembeli terverifikasi (*Verified Buyer*).
- **Form Penilaian Interaktif**:
  - Pilihan rating bintang 1 hingga 5 (⭐ 1: Kecewa s/d ⭐ 5: Luar Biasa Memuaskan).
  - Pilihan varian ukuran yang dibeli.
  - Kolom teks ulasan pemakaian.
  - Lampiran dokumentasi media: unggah link Foto tekstur atau Video pemakaian produk lengkap dengan pratinjau langsung (*live preview*).
  - Ulasan yang berhasil dikirim langsung tampil di halaman detail produk dengan badge **✓ Verified Buyer**.

### 5. Otomasi Event Promo Tanggal Kembar (12.1, 11.2, 10.3)
- Melalui Dashboard Admin, pemilik toko dapat mengonfigurasi promo tanggal dan bulan spesial:
  - **Event 12.1 (1 Desember)**: Harbolnas BeautyCare, Diskon 50%, kode `CANTIK121`.
  - **Event 11.2 (2 November)**: Glow Up Day, Diskon 35%, kode `GLOW112`.
  - **Event 10.3 (3 Oktober)**: Cantik Alami, Diskon 25%, kode `ALAMI103`.
- **Live Banner Website**: Event yang berstatus aktif otomatis memunculkan pita pengumuman di bagian paling atas (*top notification bar*) di seluruh halaman website.
- **Siaran Notifikasi Otomatis**: Sekali klik tombol *"Kirim Notifikasi"*, pesan promo disiarkan ke pusat notifikasi seluruh akun pelanggan.

### 6. Pusat Notifikasi Pelanggan
- Ikon lonceng notifikasi pada navbar dengan indikator titik merah (*badge counter*) untuk pesan yang belum dibaca.
- Menu dropdown interaktif yang menampilkan daftar pengumuman promo, status event diskon, dan pesan selamat datang.

### 7. CMS Edukasi &amp; Blog Dokter Kulit (Dermatologist)
- Seksi artikel berbasis CMS dengan rute dinamis `/article/[slug]`.
- Berisi panduan memilih produk, tips merawat kulit (*skin barrier*), dan tren makeup terbaru yang ditulis oleh dokter spesialis kulit (*dr. Sarah Melati, Sp.KK*).
- Dilengkapi estimasi waktu membaca (*read time*), tanggal publikasi, dan tautan rekomendasi produk terkait.

### 8. Dashboard Manajemen Admin Terpadu &amp; Cetak Invoice
- Dapat diakses melalui `/admin` dengan autentikasi aman berbasis sesi cookie HTTP-only.
- Tab ringkasan metrik (Total Pendapatan Terverifikasi, Total Pesanan, Total Produk, dan Peringatan Stok Menipis).
- Manajemen Produk &amp; Varian: Tambah, edit, update stok cepat, hapus produk.
- Manajemen Kategori: Tambah dan kelola kategori kecantikan.
- Manajemen Pesanan: Filter status pesanan (PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED), filter status pembayaran (PENDING, PAID, FAILED), serta tombol cetak lembar invoice resmi.
- Konfigurasi Event 12.1 / 11.2 / 10.3: Pengaturan tanggal, diskon %, banner, dan tombol siaran notifikasi.

### 9. Desain Ultra-Responsif Mobile, Tablet &amp; Desktop
- **Navigasi Mobile**: Hamburger menu dengan layer `z-index` protektif tinggi (`z-[90]`) agar tidak tenggelam di balik konten halaman.
- **Dukungan Touch &amp; Gesture**: Klik area luar (*backdrop*) untuk menutup keranjang dan modal.
- **Tipografi &amp; Spacing Adaptif**: Tampilan pada smartphone disesuaikan lebih ringkas (*compact UI*) agar navigasi terasa mulus, cepat, dan mudah dioperasikan dengan satu tangan.

---

## 📐 Arsitektur Sistem 3D &amp; Topologi

Berikut adalah visualisasi arsitektur 3D bertingkat yang digunakan oleh BeautyCare:

<div align="center">
  <img src="./assets/readme/architecture-3d.svg" alt="3D System Architecture Diagram" width="100%" />
</div>

<br />

### Rincian Lapisan Arsitektur:
1. **Tier 1 — Client Presentation Layer**:
   - Ditenagai oleh **React 19** dan **Tailwind CSS 4**.
   - Komponen UI modular dengan status sinkronisasi keranjang realtime (`useSyncExternalStore`), modal login/register responsif, dropdown notifikasi interaktif, serta drawer keranjang.
2. **Tier 2 — Next.js 16 Full-Stack Runtime**:
   - Berjalan di atas engine **Turbopack** dengan arsitektur **Partial Prerendering (PPR)**.
   - Endpoint API modular (27 rute) yang menangani autentikasi JWT aman, CRUD produk, alur checkout, webhook pembayaran QRIS, kalkulasi poin loyalitas, serta validasi hak ulasan pembeli terverifikasi.
3. **Tier 3 — Persistence &amp; Database Layer**:
   - **Prisma ORM v7** dikombinasikan dengan **PrismaMariaDb Driver Adapter** (`mariadb` connection pool).
   - Menghubungkan aplikasi ke database relasional terkelola di **Aiven Cloud MySQL** dengan enkripsi SSL/TLS wajib.
   - Dilengkapi *Smart Auto-Proxy* pada `lib/prisma.ts` untuk memastikan instance Prisma selalu segar saat proses development tanpa masalah cache usang.
4. **Tier 4 — Safety &amp; Sanitization Boundary**:
   - Sanitasi otomatis objek tipe `Decimal` dari Prisma menjadi `number` dan objek `Date` menjadi format string ISO standar, mencegah konflik serialisasi data pada batas Client Component dan Server Component di Next.js 16.

---

## 🧰 Tech Stack &amp; Dependensi

```
┌────────────────────────────────────────────────────────────────────────┐
│                          BEAUTYCARE TECH STACK                         │
├───────────────────┬────────────────────────────────────────────────────┤
│ Framework         │ Next.js 16.4.5 (Turbopack, Partial Prerendering)   │
│ UI Library        │ React 19.3.0 & React DOM 19.3.0                   │
│ Bahasa Pemrograman│ TypeScript 5.x                                     │
│ Styling           │ Tailwind CSS v4.0 & @tailwindcss/turbopack         │
│ ORM & Database    │ Prisma ORM v7.10.1 & @prisma/adapter-mariadb       │
│ Database Engine   │ MySQL 8.0+ / MariaDB 10.6+ (Aiven Cloud Database) │
│ Driver Pool       │ mariadb client v3.5.5 (Keep-alive connection pool) │
│ Ikon UI           │ Lucide React v1.70.0                               │
│ Autentikasi       │ JSON Web Token (JWT) + bcryptjs (Blowfish hashing) │
│ Barcode & QRIS    │ qrcode v1.5.4 (Dynamic SVG/PNG DataURL Generator)  │
│ Linter & Kode     │ ESLint 9 & eslint-config-next                      │
└───────────────────┴────────────────────────────────────────────────────┘
```

---

## 📋 Prasyarat Sistem (Prerequisites)

Sebelum mengkloning dan menjalankan project ini di komputer lokal Anda, pastikan sistem Anda telah terpasang perangkat lunak berikut:

| Perangkat Lunak | Versi Minimal | Versi Rekomendasi | Tautan Unduhan |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.18.0` | `v20.x LTS` atau `v22.x LTS` | [Unduh Node.js](https://nodejs.org/) |
| **NPM** / **PNPM** | `>= 9.0.0` | Versi terbaru | Disertakan bersama Node.js |
| **Git** | `>= 2.30.0` | Versi terbaru | [Unduh Git](https://git-scm.com/) |
| **Database** | MySQL 8.0+ / MariaDB 10.6+ | Aiven MySQL / PlanetScale / Local | [Aiven Cloud](https://aiven.io/) |

> [!TIP]
> Untuk memastikan instalasi Node.js dan Git Anda sudah siap, jalankan perintah berikut pada terminal:
> ```bash
> node -v
> npm -v
> git --version
> ```

---

## 🚀 Panduan Instalasi &amp; Menjalankan Project

Ikuti 7 langkah praktis berikut untuk menjalankan BeautyCare di komputer lokal Anda dari awal hingga siap digunakan:

### Langkah 1: Clone Repository
Buka terminal Anda dan jalankan perintah clone repository dari GitHub:

```bash
git clone https://github.com/agusdana/beauty_care.git
```

### Langkah 2: Masuk ke Direktori Project
Masuk ke folder hasil kloning:

```bash
cd beauty_care
```

### Langkah 3: Install Dependensi
Pasang seluruh paket pustaka yang dibutuhkan menggunakan npm (atau pnpm/yarn):

```bash
npm install
```

### Langkah 4: Konfigurasi Environment Variables (`.env`)
Buat file bernama `.env` pada direktori utama (*root directory*) project ini:

```bash
touch .env
```

Buka file `.env` dan isikan konfigurasi koneksi database dan rahasia sesi:

```env
# ==============================================================================
# BEAUTYCARE ENVIRONMENT CONFIGURATION
# ==============================================================================

# URL Koneksi Database MySQL / MariaDB (Contoh Aiven Cloud atau MySQL Lokal)
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE?ssl-mode=REQUIRED
DATABASE_URL="mysql://avnadmin:YOUR_PASSWORD@YOUR_AIVEN_HOST:PORT/defaultdb?ssl-mode=REQUIRED"

# Kunci Rahasia Enkripsi Sesi Token JWT (Wajib diubah untuk lingkungan produksi)
SESSION_SECRET="beautycare-super-secret-key-2026-secure-session-agusdana"

# Port & URL Aplikasi Lokal (Opsional)
PORT=3000
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> [!IMPORTANT]
> - Jika Anda menggunakan database MySQL lokal tanpa SSL, Anda cukup menggunakan format:
>   `DATABASE_URL="mysql://root:password@localhost:3306/beauty_care"`
> - Jika menggunakan layanan cloud seperti **Aiven Cloud MySQL**, pastikan parameter `?ssl-mode=REQUIRED` disertakan.

### Langkah 5: Sinkronisasi Skema Database (Prisma DB Push)
Kirimkan struktur skema tabel Prisma ke database Anda tanpa merusak data:

```bash
npx prisma db push
```

Setelah struktur tabel berhasil disinkronkan, generate Prisma Client terbaru:

```bash
npx prisma generate
```

### Langkah 6: Seeding Data Awal (Kategori, Produk, Admin)
Isi database Anda dengan data dummy berkualitas tinggi (akun default admin, 5 kategori kosmetik, varian produk ukuran ml, artikel tips kulit, ulasan bintang pembeli, dan promo 12.1):

```bash
npx tsx prisma/seed.ts
```

### Langkah 7: Jalankan Server Development
Jalankan server Next.js lokal dengan Turbopack:

```bash
npm run dev
```

Buka browser Anda dan kunjungi:
- **Halaman Utama Toko (Storefront)**: [http://localhost:3000](http://localhost:3000)
- **Halaman Login Admin**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Halaman Dashboard Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔑 Kredensial Akun Pengujian (Demo Accounts)

Untuk mempermudah pengujian fitur, gunakan akun bawaan yang telah disiapkan:

### 👑 Akun Administrator (Akses Penuh Kelola Toko &amp; Promo)
- **URL Login Admin**: `http://localhost:3000/admin/login`
- **Username**: `admin`
- **Password**: `admin123`
- **Akses**: Kelola produk, atur varian (ml), ubah stok, proses pesanan, konfigurasi promo (12.1, 11.2, 10.3), siarkan notifikasi massal, dan cetak invoice resmi.

### 👤 Akun Pelanggan (Customer Demo)
- Anda dapat mendaftar langsung secara instan melalui tombol **`Login | Register`** di navbar toko dengan nama, email, nomor HP, dan password pilihan Anda.
- Setiap pendaftaran baru otomatis mendapatkan **Bonus 50 Poin Loyalitas** dan surat notifikasi selamat datang.

---

## 📂 Struktur Direktori Project

```bash
beauty_care/
├── app/                                 # Next.js 16 App Router Directory
│   ├── admin/                           # Halaman & Modul Studio Admin
│   │   ├── login/                       # Halaman Login Admin
│   │   ├── orders/[id]/invoice/         # Cetak Lembar Invoice Resmi (Print-Ready)
│   │   ├── AdminDashboardClient.tsx     # Komponen Dashboard Interaktif 5 Tab
│   │   └── page.tsx                     # Server Page & Sanitasi Data Admin
│   ├── api/                             # API Backend Route Handlers
│   │   ├── articles/                    # Endpoint CMS Artikel Skincare
│   │   ├── auth/                        # Autentikasi Admin (Login/Logout/Me)
│   │   ├── categories/                  # CRUD Kategori Produk
│   │   ├── customer/                    # Autentikasi Pelanggan (Register/Login/Me)
│   │   ├── events/                      # Manajemen Promo 12.1, 11.2, 10.3
│   │   ├── loyalty/                     # Cek Saldo & Penukaran Poin Loyalitas
│   │   ├── notifications/               # Pengambilan & Status Baca Notifikasi
│   │   ├── orders/                      # Alur Checkout & Update Status Pesanan
│   │   ├── products/                    # Katalog Produk, Varian & Update Stok
│   │   │   └── [id]/reviews/            # Endpoint Ulasan Pembeli Terverifikasi
│   │   └── qris/                        # Generator Barcode Pembayaran QRIS
│   ├── article/[slug]/                  # Halaman Detail Artikel & Edukasi Kulit
│   ├── components/                      # Komponen Antarmuka Pengguna Reusable
│   │   ├── ArticlesSection.tsx          # Seksi Blog Dermatologi
│   │   ├── CartDrawer.tsx               # Drawer Keranjang Universal & Checkout
│   │   ├── CustomerAuthModal.tsx        # Modal Pop-up Login & Register Pelanggan
│   │   ├── FaqSection.tsx               # Seksi FAQ Interaktif Accordion
│   │   ├── Footer.tsx                   # Footer Toko & Info Klinik
│   │   ├── Navbar.tsx                   # Navbar Responsif, Banner & Lonceng Notif
│   │   ├── NotificationDropdown.tsx     # Dropdown Notifikasi Pesan Pelanggan
│   │   ├── OrderModal.tsx               # Modal Pesan Cepat Produk Tertentu
│   │   └── ProductCard.tsx              # Kartu Produk dengan Badge & Varian ml
│   ├── order/[invoiceNumber]/           # Halaman Konfirmasi Pesanan & Status QRIS
│   ├── product/[slug]/                  # Halaman Detail Produk & Ulasan Pembeli
│   ├── globals.css                      # Konfigurasi Tailwind CSS v4
│   ├── layout.tsx                       # Root Layout dengan Font Geist
│   └── page.tsx                         # Halaman Utama (Homepage Storefront)
├── assets/                              # Aset Grafis Dokumentasi & Showcase
│   └── readme/                          # Animasi 3D Hero & Diagram Arsitektur
├── lib/                                 # Utilitas Backend & Logika Bisnis
│   ├── auth.ts                          # JWT Token Helper untuk Admin & Customer
│   ├── cart.ts                          # Logika Keranjang & Penyimpanan Lokal
│   └── prisma.ts                        # Singleton Prisma & Smart Auto-Proxy
├── prisma/                              # Skema Database & Relasi Relasional
│   ├── schema.prisma                    # Definisi Model Data Prisma
│   └── seed.ts                          # Script Pengisian Data Awal (Dummy Data)
├── public/                              # Aset Statis Publik (Gambar, SVG, JSON)
├── .env                                 # Konfigurasi Kredensial Lingkungan Lokal
├── package.json                         # Dependensi Project & Script Perintah
└── tsconfig.json                        # Konfigurasi Compiler TypeScript
```

---

## 🗄️ Model Data &amp; Relasi Database (ERD)

Struktur relasi database yang dirancang untuk mendukung operasional e-commerce toko kecantikan:

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ Review : writes
    User ||--o{ Notification : receives
    CustomerLoyalty ||--o{ PointTransaction : has
    Category ||--o{ Product : contains
    Product ||--o{ ProductVariant : offers
    Product ||--o{ OrderItem : includes
    Product ||--o{ Review : collects
    Order ||--o{ OrderItem : details
    PromoEvent ||--o{ Notification : broadcasts

    User {
        int id PK
        string name
        string email UK
        string phone
        string password
        string role
        string avatar
        string address
    }

    Product {
        int id PK
        string name
        string slug UK
        text description
        decimal price
        int stock
        boolean hasVariants
        int categoryId FK
    }

    ProductVariant {
        int id PK
        int productId FK
        string size
        decimal price
        int stock
    }

    Order {
        int id PK
        string invoiceNumber UK
        int userId FK
        string customerName
        string customerPhone
        string paymentStatus
        string orderStatus
        decimal totalAmount
        decimal discountAmount
        int pointsEarned
        int pointsRedeemed
    }

    PromoEvent {
        int id PK
        string title
        string code UK
        int discountPercent
        int eventMonth
        int eventDay
        string bannerText
        boolean isActive
    }

    Review {
        int id PK
        int productId FK
        int userId FK
        int rating
        text comment
        string mediaUrl
        string mediaType
        string selectedVariant
    }
```

---

## 📜 Script NPM yang Tersedia

Jalankan perintah-perintah berikut melalui terminal di folder project:

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server lokal Next.js dengan kompilator **Turbopack** di port 3000. |
| `npm run build` | Mengompilasi dan mengoptimasi aplikasi untuk rilis produksi (**Partial Prerender**). |
| `npm run start` | Menjalankan server aplikasi Next.js dari hasil build produksi. |
| `npm run lint` | Melakukan audit statis kode menggunakan **ESLint 9**. |
| `npx prisma db push` | Menyinkronkan perubahan skema `schema.prisma` langsung ke database MySQL/MariaDB. |
| `npx prisma generate` | Membuat ulang SDK TypeScript `@prisma/client` berdasarkan skema terbaru. |
| `npx prisma studio` | Membuka antarmuka visual GUI Prisma di browser untuk mengelola isi database. |
| `npx tsx prisma/seed.ts` | Mengeksekusi script seeding data awal ke database. |

---

## 🛡️ Keamanan &amp; Standar Rekayasa Perangkat Lunak

Project ini dirancang dengan mematuhi standar keamanan aplikasi web modern:

1. **Autentikasi Token Aman (Stateless JWT)**:
   - Sesi autentikasi disimpan di cookie HTTP-only dengan opsi `SameSite: Lax` dan proteksi `secure: true` saat mode produksi.
   - Sesi admin dan customer dipisahkan secara ketat untuk mencegah eskalasi hak akses (*privilege escalation*).
2. **Blowfish Hashing Password (`bcryptjs`)**:
   - Seluruh kata sandi pengguna dienkripsi menggunakan salt 10 rounds sebelum disimpan ke database.
3. **Proteksi Akses Penilaian (*Verified Buyer Guard*)**:
   - Endpoint pembuatan review (`/api/products/[id]/reviews`) memeriksa kecocokan ID akun pengguna dengan tabel transaksi pesanan sebelum mengizinkan penulisan ulasan.
4. **Driver Adapter Pool &amp; SSL Enkripsi**:
   - Koneksi ke database MySQL menggunakan MariaDB Driver Adapter resmi yang mengelola koneksi pool secara efisien, lengkap dengan verifikasi sertifikat SSL untuk cloud database (Aiven/AWS/GCP).
5. **Serialisasi Data Aman (*Decimal &amp; Date Guard*)**:
   - Objek `Decimal` dari database secara ketat dikonversi menjadi tipe data `number` sebelum dialirkan dari Server Component ke Client Component guna mencegah error fatal Next.js.

---

## ❓ FAQ &amp; Troubleshooting

<details>
<summary><b>1. Mengapa muncul error "Unknown argument phone" saat mendaftar akun baru?</b></summary>
<p>
Hal ini terjadi jika dev server Next.js Anda masih berjalan dengan cache Prisma Client lama di memori. Solusinya:
1. Hentikan server dev dengan menekan <code>Ctrl + C</code> di terminal.
2. Jalankan kembali <code>npm run dev</code>.
Instance Prisma terbaru akan langsung dimuat secara otomatis oleh Smart Auto-Proxy pada <code>lib/prisma.ts</code>.
</p>
</details>

<details>
<summary><b>2. Bagaimana cara mengaktifkan banner promo 12.1 atau 11.2?</b></summary>
<p>
Masuk ke dashboard admin di <code>/admin</code>, pilih tab ke-5 <b>"Event Diskon &amp; Notifikasi (12.1, 11.2, 10.3)"</b>. Anda cukup mengklik salah satu tombol template cepat, lalu klik tombol switch status menjadi <b>"Aktif"</b>. Banner pengumuman akan langsung tayang di bilah atas website seketika.
</p>
</details>

<details>
<summary><b>3. Bagaimana jika koneksi database Aiven Cloud terputus (Connection Timeout)?</b></summary>
<p>
Pastikan string koneksi di file <code>.env</code> Anda memiliki parameter <code>?ssl-mode=REQUIRED</code>. Konfigurasi adapter di <code>lib/prisma.ts</code> telah dioptimasi dengan timeout koneksi 10 detik dan batas pool 10 koneksi simultan untuk menjaga stabilitas koneksi jaringan jarak jauh.
</p>
</details>

---

## 📄 Lisensi &amp; Kontribusi

Didistribusikan di bawah lisensi **MIT License**. Silakan gunakan, pelajari, dan kembangkan project ini untuk keperluan komersial maupun portofolio pribadi Anda.

Dibuat dengan dedikasi dan cinta oleh **[Agus Dana](https://github.com/agusdana)** bersama tim rekayasa perangkat lunak berstandar modern.

<div align="center">
  <sub>✦ Ditenagai oleh Next.js 16, React 19, Tailwind CSS 4, Prisma ORM, dan Google Antigravity ✦</sub>
</div>
