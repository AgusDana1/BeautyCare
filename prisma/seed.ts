import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb from "mariadb";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const u = new URL(databaseUrl);
  const sslParam = u.searchParams.get("ssl-mode") || u.searchParams.get("ssl");
  const useSsl =
    sslParam === "REQUIRED" ||
    sslParam === "true" ||
    u.hostname.includes("aivencloud.com") ||
    databaseUrl.includes("ssl-mode=REQUIRED");

  const pool = mariadb.createPool({
    host: u.hostname,
    port: parseInt(u.port || "3306", 10),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    connectTimeout: 10000,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaMariaDb(pool as any);
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding database...");

  // 1. Create or update default Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: { password: adminPassword },
    create: {
      username: "admin",
      name: "Admin BeautyCare",
      email: "admin@beautycare.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin seeded: admin / admin123");

  // 2. Create Categories
  const categoriesData = [
    { name: "Skincare", slug: "skincare", description: "Perawatan kulit wajah harian berkualitas premium" },
    { name: "Body Care", slug: "body-care", description: "Perawatan kulit tubuh agar tetap lembap dan wangi" },
    { name: "Hair Care", slug: "hair-care", description: "Nutrisi rambut sehat, berkilau dan bebas rontok" },
    { name: "Serum & Treatment", slug: "serum-treatment", description: "Perawatan intensif target masalah kulit" },
    { name: "Beauty Tools", slug: "beauty-tools", description: "Aksesori penunjang rutinitas kecantikan" },
  ];

  const categoriesMap: Record<string, number> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categoriesMap[cat.slug] = created.id;
  }
  console.log("Categories seeded");

  // 3. Products Data
  const existingProducts = await prisma.product.count();
  if (existingProducts === 0) {
    // Product 1: Hydrating Barrier Serum (with variants)
    const p1 = await prisma.product.create({
      data: {
        name: "Hydrating Barrier Serum",
        slug: "hydrating-barrier-serum",
        description:
          "Serum dengan kandungan Hyaluronic Acid dan Ceramide murni untuk memperbaiki skin barrier, melembapkan kulit secara mendalam, serta membuat kulit kenyal berseri.",
        price: 129000,
        stock: 53,
        hasVariants: true,
        categoryId: categoriesMap["serum-treatment"],
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
        variants: {
          create: [
            { size: "30ml", sizeValue: 30, price: 129000, stock: 25 },
            { size: "50ml", sizeValue: 50, price: 189000, stock: 18 },
            { size: "100ml", sizeValue: 100, price: 299000, stock: 10 },
          ],
        },
      },
    });

    // Product 2: Brightening Face Cleanser (with variants)
    const p2 = await prisma.product.create({
      data: {
        name: "Brightening Amino Cleanser",
        slug: "brightening-amino-cleanser",
        description:
          "Pembersih wajah berbusa lembut dengan Amino Acid dan Niacinamide yang membersihkan pori secara tuntas tanpa membuat kulit tertarik atau kering.",
        price: 75000,
        stock: 53,
        hasVariants: true,
        categoryId: categoriesMap["skincare"],
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
        variants: {
          create: [
            { size: "50ml", sizeValue: 50, price: 75000, stock: 30 },
            { size: "100ml", sizeValue: 100, price: 120000, stock: 15 },
            { size: "150ml", sizeValue: 150, price: 160000, stock: 8 },
          ],
        },
      },
    });

    // Product 3: Daily UV Shield Sunscreen SPF 50 (with variants)
    const p3 = await prisma.product.create({
      data: {
        name: "Daily UV Shield Sunscreen SPF 50+",
        slug: "daily-uv-shield-sunscreen",
        description:
          "Tabir surya ringan tekstur watery gel dengan proteksi maksimal terhadap sinar UVA dan UVB, tanpa whitecast dan ramah untuk kulit berjerawat.",
        price: 95000,
        stock: 32,
        hasVariants: true,
        categoryId: categoriesMap["skincare"],
        image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80",
        variants: {
          create: [
            { size: "30ml", sizeValue: 30, price: 95000, stock: 20 },
            { size: "50ml", sizeValue: 50, price: 145000, stock: 12 },
          ],
        },
      },
    });

    // Product 4: Deep Moisture Body Lotion (with variants)
    const p4 = await prisma.product.create({
      data: {
        name: "Deep Moisture Velvet Body Lotion",
        slug: "deep-moisture-body-lotion",
        description:
          "Lotion pelembap tubuh dengan aroma mewah bunga sakura, diperkaya Shea Butter dan Vitamin E untuk kelembapan kulit tahan hingga 48 jam.",
        price: 65000,
        stock: 77,
        hasVariants: true,
        categoryId: categoriesMap["body-care"],
        image: "https://images.unsplash.com/photo-1608248597359-2e650a259c63?w=600&auto=format&fit=crop&q=80",
        variants: {
          create: [
            { size: "100ml", sizeValue: 100, price: 65000, stock: 40 },
            { size: "250ml", sizeValue: 250, price: 135000, stock: 22 },
            { size: "400ml", sizeValue: 400, price: 195000, stock: 15 },
          ],
        },
      },
    });

    // Product 5: Nourishing Hair Serum Oil (with variants)
    const p5 = await prisma.product.create({
      data: {
        name: "Nourishing Argan Hair Serum",
        slug: "nourishing-argan-hair-serum",
        description:
          "Minyak serum perawatan rambut dengan Moroccan Argan Oil murni untuk mengatasi rambut bercabang, kusut, dan rusak akibat styling panas.",
        price: 110000,
        stock: 25,
        hasVariants: true,
        categoryId: categoriesMap["hair-care"],
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
        variants: {
          create: [
            { size: "30ml", sizeValue: 30, price: 110000, stock: 15 },
            { size: "75ml", sizeValue: 75, price: 190000, stock: 10 },
          ],
        },
      },
    });

    // Product 6: Rose Quartz Face Roller (NO VARIANTS - demonstrates no ml filter)
    const p6 = await prisma.product.create({
      data: {
        name: "Rose Quartz Facial Roller",
        slug: "rose-quartz-facial-roller",
        description:
          "Roller wajah dari batu giok mawar asli untuk memperlancar sirkulasi darah, meredakan pembengkakan (puffiness), dan memaksimalkan penyerapan serum.",
        price: 89000,
        stock: 25,
        hasVariants: false,
        categoryId: categoriesMap["beauty-tools"],
        image: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600&auto=format&fit=crop&q=80",
      },
    });

    // Product 7: Gua Sha Facial Sculptor (NO VARIANTS)
    const p7 = await prisma.product.create({
      data: {
        name: "Gua Sha Facial Sculptor",
        slug: "gua-sha-facial-sculptor",
        description:
          "Alat kontur wajah tradisional untuk relaksasi otot wajah, stimulasi drainase limfatik, dan mendefinisikan garis rahang alami.",
        price: 69000,
        stock: 35,
        hasVariants: false,
        categoryId: categoriesMap["beauty-tools"],
        image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80",
      },
    });

    console.log("Sample products seeded successfully!");
  }

  // 4. Seed Reviews with Buyer Documentation (Photos & Videos)
  const existingReviews = await prisma.review.count();
  if (existingReviews === 0) {
    const allProds = await prisma.product.findMany();
    for (const prod of allProds) {
      if (prod.slug === "hydrating-barrier-serum") {
        await prisma.review.createMany({
          data: [
            {
              productId: prod.id,
              reviewerName: "Clarissa Dewi",
              rating: 5,
              userLocation: "Jakarta Selatan",
              selectedVariant: "Varian: 50ml",
              comment:
                "Serum terbaik buat kulit sensitif dan kemerahan! Baru pakai 1 minggu kerasa banget kulit jadi lebih bouncy dan lembap seharian. Teksturnya watery cepat meresap tanpa rasa lengket sama sekali. Worth every penny!",
              mediaUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
              mediaType: "image",
              helpfulCount: 24,
            },
            {
              productId: prod.id,
              reviewerName: "Nadya Putri",
              rating: 5,
              userLocation: "Surabaya",
              selectedVariant: "Varian: 30ml",
              comment:
                "Video unboxing dan tekstur serumnya! Beneran original tersegel rapi dan no BPOM terverifikasi. Sangat membantu menenangkan bruntusan di dahi.",
              mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-applying-moisturizer-to-her-face-41315-large.mp4",
              mediaType: "video",
              helpfulCount: 19,
            },
            {
              productId: prod.id,
              reviewerName: "Amelia Zahra",
              rating: 5,
              userLocation: "Bandung",
              selectedVariant: "Varian: 100ml",
              comment:
                "Repeat order yang kedua kalinya langsung ambil ukuran 100ml karena sekeluarga ikutan pakai. Packaging botol dropper kaca tebal dan elegan!",
              mediaUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
              mediaType: "image",
              helpfulCount: 15,
            },
          ],
        });
      } else if (prod.slug === "brightening-amino-cleanser") {
        await prisma.review.createMany({
          data: [
            {
              productId: prod.id,
              reviewerName: "Rizky Ananda",
              rating: 5,
              userLocation: "Yogyakarta",
              selectedVariant: "Varian: 100ml",
              comment:
                "Busa busanya lembut banget! Nggak bikin muka berasa ketarik kayak sabun cuci muka lain. Wangi alaminya bikin rileks pas pagi hari.",
              mediaUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
              mediaType: "image",
              helpfulCount: 12,
            },
            {
              productId: prod.id,
              reviewerName: "Vania Jessica",
              rating: 5,
              userLocation: "Semarang",
              selectedVariant: "Varian: 50ml",
              comment:
                "Video busa mikro lembutnya. Membersihkan makeup ringan dengan bersih tanpa iritasi mata. Super recommended!",
              mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-soap-bubbles-forming-in-water-43301-large.mp4",
              mediaType: "video",
              helpfulCount: 8,
            },
          ],
        });
      } else {
        await prisma.review.createMany({
          data: [
            {
              productId: prod.id,
              reviewerName: "Dina Mariana",
              rating: 5,
              userLocation: "Tangerang",
              selectedVariant: "Standar",
              comment:
                "Kualitas barang sangat bagus sesuai ekspektasi. Pengiriman kilat dan packing bubble wrap berlapis-lapis aman sampai tujuan.",
              mediaUrl: prod.image || "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80",
              mediaType: "image",
              helpfulCount: 7,
            },
          ],
        });
      }
    }
    console.log("Reviews with buyer photo & video documentation seeded!");
  }

  // 5. Seed Loyalty Program Customers
  const existingLoyalty = await prisma.customerLoyalty.count();
  if (existingLoyalty === 0) {
    const cust1 = await prisma.customerLoyalty.create({
      data: {
        phone: "081234567890",
        name: "Rina Melati",
        email: "rina@example.com",
        points: 350,
        tier: "SILVER",
        totalSpent: 350000,
        history: {
          create: [
            {
              points: 350,
              type: "EARN",
              description: "Poin transaksi belanja Hydrating Barrier Serum",
            },
          ],
        },
      },
    });

    const cust2 = await prisma.customerLoyalty.create({
      data: {
        phone: "089876543210",
        name: "Clarissa Dewi",
        email: "clarissa@example.com",
        points: 1250,
        tier: "GOLD",
        totalSpent: 1250000,
        history: {
          create: [
            {
              points: 1250,
              type: "EARN",
              description: "Poin transaksi belanja Paket Skincare Lengkap",
            },
          ],
        },
      },
    });

    console.log("Loyalty program demo customers seeded:", cust1.phone, cust2.phone);
  }

  // 6. Seed Educational Articles (Blog / CMS)
  const existingArticles = await prisma.article.count();
  if (existingArticles === 0) {
    await prisma.article.createMany({
      data: [
        {
          slug: "5-tanda-skin-barrier-rusak-cara-memperbaikinya",
          title: "5 Tanda Skin Barrier Rusak dan Cara Cepat Memperbaikinya Menurut Dermatolog",
          category: "Tips Skincare",
          authorName: "dr. Sarah Melati, Sp.KK",
          authorRole: "Dermatologist Specialist",
          authorAvatar: "https://images.unsplash.com/photo-1594824813589-3221b0179979?w=300&auto=format&fit=crop&q=80",
          readTimeMinutes: 5,
          coverImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
          excerpt:
            "Kulit terasa perih saat pakai skincare, mudah kemerahan, atau bruntusan tak kunjung hilang? Kenali 5 tanda pelindung kulit Anda melemah dan panduan mengembalikannya dalam 14 hari.",
          content: `
### Apa Itu Skin Barrier?
Skin barrier (stratum korneum) adalah lapisan terluar kulit yang bertindak sebagai benteng pelindung tubuh dari polusi, sinar ultraviolet, dan bakteri jahat, sekaligus mengunci kelembapan alami kulit agar tidak menguap (Transepidermal Water Loss).

### 5 Tanda Skin Barrier Anda Rusak:
1. **Rasa Perih atau Menyengat**: Saat mengaplikasikan produk dasar seperti pelembap atau toner yang biasanya aman.
2. **Kemerahan dan Iritasi Berlebih**: Kulit tampak merona kemerahan yang tidak wajar, terutama di area pipi dan hidung.
3. **Kulit Kering Bersisik Namun Berminyak**: Terjadi ketidakseimbangan kadar air dan minyak (kulit dehidrasi yang memproduksi minyak berlebih sebagai kompensasi).
4. **Bruntusan dan Jerawat Mikro**: Bakteri lebih mudah masuk ke lapisan pori karena pertahanan alami kulit bolong.
5. **Tekstur Kulit Kasar dan Kusam**: Hilangnya elastisitas alami sehingga kulit terlihat lelah.

### Langkah Efektif Memperbaiki Skin Barrier:
- **Puasa Eksfoliasi Sementara**: Hentikan pemakaian toner AHA/BHA, scrub fisik, atau retinol selama 1-2 minggu.
- **Gunakan Pembersih Wajah Lembut Low pH**: Pilih cleanser berbahan dasar asam amino (seperti Brightening Amino Cleanser) agar tidak merusak mantel asam kulit.
- **Terapkan Bahan Restoratif**: Fokus pada kandungan Ceramide, Hyaluronic Acid, Centella Asiatica, dan Niacinamide konsentrasi rendah.
- **Wajib Sunscreen Setiap Pagi**: Lindungi lapisan sel baru yang sedang beregenerasi dari degradasi akibat sinar UV.
          `.trim(),
        },
        {
          slug: "panduan-memilih-ukuran-ml-skincare-pemula",
          title: "Panduan Memilih Ukuran (ml) Skincare: Kapan Beli 30ml vs 100ml?",
          category: "Panduan Produk",
          authorName: "Alya Safira",
          authorRole: "Senior Beauty Advisor",
          authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
          readTimeMinutes: 4,
          coverImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&auto=format&fit=crop&q=80",
          excerpt:
            "Bingung memilih ukuran botol skincare? Simak tips hemat dan cerdas memilih varian 30ml untuk uji kecocokan atau 100ml+ untuk rutinitas harian yang lebih ekonomis.",
          content: `
### Mengapa Varian Ukuran (ml) Sangat Penting?
Salah satu keunggulan berbelanja di BeautyCare adalah fleksibilitas filter varian per ml. Tidak semua orang memiliki kebutuhan volume yang sama saat membeli serum atau pembersih wajah.

### Kapan Sebaiknya Memilih Ukuran 30ml - 50ml?
- **Baru Pertama Kali Mencoba (Patch Testing)**: Jika Anda baru mengenal formulasi aktif tertentu (misalnya serum pencerah atau retinol), ukuran 30ml adalah pilihan paling aman untuk melihat respons kulit Anda.
- **Kebutuhan Traveling / Bepergian**: Ukuran di bawah 100ml sangat ramah kabin pesawat dan praktis dibawa di dalam pouch kecantikan sehari-hari.
- **Produk dengan Masa Kedaluwarsa Pendek**: Vitamin C murni atau formula antioksidan konsentrat sebaiknya dihabiskan dalam tempo 1-2 bulan agar khasiatnya tetap segar.

### Kapan Sebaiknya Memilih Ukuran 100ml - 400ml?
- **Produk Basic Skincare Harian**: Pembersih wajah (Cleanser), Tabir Surya (Sunscreen), dan Body Lotion adalah produk yang dipakai setiap hari 2-3 kali. Membeli ukuran 100ml ke atas jauh lebih hemat hingga 35% dibandingkan membeli botol kecil berkali-kali.
- **Pemakaian Bersama Keluarga**: Produk seperti velvet body lotion atau gentle wash yang ramah untuk semua usia sangat cocok dibeli dalam ukuran 250ml - 400ml dengan tutup pump higienis.
          `.trim(),
        },
        {
          slug: "tren-glass-skin-natural-makeup-2026",
          title: "Tren Clean Look & Glass Skin 2026: Kulit Sehat Alami Tanpa Foundation Tebal",
          category: "Tren Makeup",
          authorName: "Kenzo Pratama",
          authorRole: "Professional Aesthetician",
          authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
          readTimeMinutes: 4,
          coverImage: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1200&auto=format&fit=crop&q=80",
          excerpt:
            "Tahun 2026 menandai pergeseran besar menuju konsep 'Skin-First, Makeup-Second'. Inilah rahasia mendapatkan kilau kulit sehat bercahaya alami sepanjang hari.",
          content: `
### Definisi Tren Glass Skin 2026
Berbeda dengan tampilan dewy berlebih yang terasa lengket, tren kecantikan tahun ini mengedepankan kulit yang terhidrasi mendalam, pori tampak samar, dan kilau terpancar dari kesehatan skin barrier asli.

### 4 Kunci Menuju Clean Aesthetic:
1. **Hydration Layering (Teknik Lapisan Hidrasi)**: Mengaplikasikan essence atau serum hidrasi berlayer tipis saat kulit masih lembap setelah dibersihkan.
2. **Skin Prep dengan Facial Roller Giok**: Memakai Rose Quartz Roller setelah serum untuk melancarkan sirkulasi limfatik dan meratakan penyerapan nutrisi hingga ke pori terdalam.
3. **Sunscreen Hybrid sebagai Primer**: Menggunakan tabir surya watery gel dengan efek glowing alami tanpa whitecast sehingga tidak membutuhkan primer silikon tambahan.
4. **Minimal Tinted Lip & Cheek**: Cukup gunakan sapuan warna natural pada bibir dan pipi untuk menyempurnakan kesegaran wajah harian Anda.
          `.trim(),
        },
      ],
    });
    console.log("Educational articles seeded!");
  }

  await prisma.$disconnect();
  await pool.end();
  console.log("Seed complete.");
}

main().catch(console.error);
