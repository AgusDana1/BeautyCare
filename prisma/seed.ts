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

  await prisma.$disconnect();
  await pool.end();
  console.log("Seed complete.");
}

main().catch(console.error);
