"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Layers,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Printer,
  LogOut,
  Sparkles,
  Search,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Variant {
  id: number;
  productId: number;
  size: string;
  sizeValue: number | null;
  price: number;
  stock: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  _count?: { products: number };
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  price: number;
  stock: number;
  hasVariants: boolean;
  categoryId: number;
  category: Category;
  variants: Variant[];
}

interface OrderItem {
  id: number;
  productId: number;
  variantId: number | null;
  selectedSize: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    name: string;
    image: string | null;
  };
}

interface Order {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  paymentChannel: string | null;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  notes: string | null;
  createdAt: string | Date;
  items: OrderItem[];
}

interface AdminSession {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

interface Props {
  admin: AdminSession;
  initialCategories: Category[];
  initialProducts: Product[];
  initialOrders: Order[];
}

export default function AdminDashboardClient({
  admin,
  initialCategories,
  initialProducts,
  initialOrders,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "categories" | "orders">("overview");

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Search & Filter States
  const [productSearch, setProductSearch] = useState("");
  const [productCatFilter, setProductCatFilter] = useState("ALL");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    categoryId: categories[0]?.id || 1,
    image: "",
    price: 100000,
    stock: 20,
    hasVariants: false,
    variants: [
      { size: "30ml", price: 95000, stock: 15 },
      { size: "50ml", price: 145000, stock: 10 },
    ],
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Logout Handler
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  // Quick Stock Update
  const handleUpdateStock = async (productId: number, variantId: number | null, newStock: number) => {
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, stock: Math.max(0, newStock) }),
      });
      if (res.ok) {
        // Refresh products
        const updatedRes = await fetch("/api/products");
        const updated = await updatedRes.json();
        setProducts(updated);
      }
    } catch (err) {
      console.error("Failed to update stock:", err);
    }
  };

  // Update Order Status
  const handleUpdateOrder = async (orderId: number, field: "orderStatus" | "paymentStatus", value: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      }
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  // Product CRUD
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      categoryId: categories[0]?.id || 1,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
      price: 120000,
      stock: 25,
      hasVariants: false,
      variants: [
        { size: "30ml", price: 95000, stock: 15 },
        { size: "50ml", price: 145000, stock: 10 },
      ],
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      image: product.image || "",
      price: product.price,
      stock: product.stock,
      hasVariants: product.hasVariants,
      variants:
        product.variants.length > 0
          ? product.variants.map((v) => ({ size: v.size, price: v.price, stock: v.stock }))
          : [
              { size: "30ml", price: product.price, stock: 10 },
              { size: "50ml", price: Math.round(product.price * 1.5), stock: 10 },
            ],
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      });

      if (res.ok) {
        const prodRes = await fetch("/api/products");
        const allProds = await prodRes.json();
        setProducts(allProds);
        setIsProductModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan produk");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const method = editingCategory ? "PUT" : "POST";
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });

      if (res.ok) {
        const catRes = await fetch("/api/categories");
        const allCats = await catRes.json();
        setCategories(allCats);
        setIsCategoryModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan kategori");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Hapus kategori ini beserta produk di dalamnya?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        // Refresh products
        const prodRes = await fetch("/api/products");
        const allProds = await prodRes.json();
        setProducts(allProds);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = productCatFilter === "ALL" || p.categoryId === parseInt(productCatFilter, 10);
    return matchSearch && matchCat;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.invoiceNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);
    const matchOrderStatus = orderStatusFilter === "ALL" || o.orderStatus === orderStatusFilter;
    const matchPaymentStatus = paymentStatusFilter === "ALL" || o.paymentStatus === paymentStatusFilter;
    return matchSearch && matchOrderStatus && matchPaymentStatus;
  });

  // Calculations for KPI
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === "PENDING").length;
  const lowStockProducts = products.filter((p) => p.stock < 10);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-transform duration-200 hover:scale-105"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </div>
              <span className="font-bold text-stone-900 text-lg tracking-tight">
                BeautyCare<span className="text-rose-600">.</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-semibold bg-rose-50 text-rose-700 rounded-full border border-rose-200/60">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-stone-900">{admin.name}</span>
              <span className="text-[11px] text-stone-400 font-mono">{admin.email}</span>
            </div>
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all duration-200 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lihat Toko</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-stone-100">
          {[
            { id: "overview", label: "Ringkasan & Stok", icon: TrendingUp },
            { id: "products", label: "Kelola Produk & Varian (ml)", icon: Package },
            { id: "categories", label: "Kelola Kategori", icon: Layers },
            { id: "orders", label: "Pesanan & Invoice", icon: ShoppingBag, badge: pendingOrdersCount },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-rose-600 text-rose-600 bg-rose-50/40"
                    : "border-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in-up">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
                  <span>Pendapatan Terverifikasi</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-stone-900">
                  Rp {totalRevenue.toLocaleString("id-ID")}
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Dari transaksi lunas</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
                  <span>Total Pesanan Masuk</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-stone-900">{orders.length}</div>
                <p className="text-[11px] text-stone-400 mt-1">
                  {pendingOrdersCount} pesanan menunggu diproses
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
                  <span>Total Produk Aktif</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-stone-900">{products.length}</div>
                <p className="text-[11px] text-stone-400 mt-1">Dalam {categories.length} kategori</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
                  <span>Peringatan Stok Menipis</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-amber-600">
                  {lowStockProducts.length}
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Stok &lt; 10 unit perlu restock</p>
              </div>
            </div>

            {/* Quick Stock Checker & Alert */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Pemeriksaan Stok Real-Time (Stock Monitoring)
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Admin dapat mengecek dan menambah stok produk serta varian ml langsung di sini.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("products")}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Kelola Semua Produk →
                </button>
              </div>

              <div className="divide-y divide-stone-100">
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-11 h-11 object-cover rounded-xl border border-stone-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-bold">
                          BC
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-semibold text-stone-900">{product.name}</h3>
                        <p className="text-xs text-stone-400">
                          {product.category.name} •{" "}
                          {product.hasVariants
                            ? `${product.variants.length} varian ukuran`
                            : "Ukuran Tunggal"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          product.stock === 0
                            ? "bg-red-100 text-red-700"
                            : product.stock < 10
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        Sisa Stok: {product.stock}
                      </span>

                      {!product.hasVariants ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateStock(product.id, null, product.stock - 1)}
                            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold flex items-center justify-center transition cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold">
                            {product.stock}
                          </span>
                          <button
                            onClick={() => handleUpdateStock(product.id, null, product.stock + 1)}
                            className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-bold flex items-center justify-center transition cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveTab("products")}
                          className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                        >
                          Cek per ukuran ml
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-stone-900">Pesanan Terbaru Pelanggan</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Cetak faktur / invoice langsung untuk diberikan kepada customer.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Lihat Semua Pesanan ({orders.length}) →
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-sm">
                  Belum ada pesanan yang masuk.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 uppercase font-semibold">
                        <th className="pb-3">No. Invoice</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Metode</th>
                        <th className="pb-3">Pembayaran</th>
                        <th className="pb-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50/50 transition">
                          <td className="py-3 font-mono font-bold text-stone-900">
                            {order.invoiceNumber}
                          </td>
                          <td className="py-3">
                            <span className="font-medium text-stone-800">{order.customerName}</span>
                            <span className="block text-[11px] text-stone-400">{order.customerPhone}</span>
                          </td>
                          <td className="py-3 font-mono font-semibold text-stone-900">
                            Rp {order.totalAmount.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-semibold text-[11px]">
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                order.paymentStatus === "PAID"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {order.paymentStatus === "PAID" ? "Lunas" : "Menunggu"}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              href={`/admin/orders/${order.id}/invoice`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg transition-transform duration-150 hover:scale-105 shadow-2xs"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Cetak Invoice</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS & ML VARIANTS */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  Manajemen Produk & Ukuran (ml)
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Atur produk kecantikan, cek stok per ukuran ml, dan tambahkan varian ukuran baru.
                </p>
              </div>

              <button
                onClick={openNewProductModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk Baru</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau deskripsi produk..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-stone-500 whitespace-nowrap">Filter Kategori:</span>
                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="text-xs py-2 px-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-white"
                >
                  <option value="ALL">Semua Kategori ({products.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Produk</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Harga Dasar</th>
                      <th className="py-3 px-4">Total Stok</th>
                      <th className="py-3 px-4">Varian Ukuran (ml)</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.map((p) => {
                      const isExpanded = expandedProductId === p.id;
                      return (
                        <tr key={p.id} className="hover:bg-stone-50/60 transition group">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 shadow-2xs group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 font-bold">
                                  BC
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-stone-900 block">{p.name}</span>
                                <span className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                                  {p.description}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-md font-medium">
                              {p.category.name}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-stone-900">
                            Rp {p.price.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                  p.stock === 0
                                    ? "bg-red-100 text-red-700"
                                    : p.stock < 10
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {p.stock} pcs
                              </span>
                              {!p.hasVariants && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleUpdateStock(p.id, null, p.stock - 1)}
                                    className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-xs font-bold flex items-center justify-center cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStock(p.id, null, p.stock + 1)}
                                    className="w-5 h-5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {p.hasVariants && p.variants.length > 0 ? (
                              <div>
                                <button
                                  onClick={() =>
                                    setExpandedProductId(isExpanded ? null : p.id)
                                  }
                                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg transition hover:bg-rose-100 cursor-pointer"
                                >
                                  <span>{p.variants.length} Varian Ukuran</span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {isExpanded && (
                                  <div className="mt-2 p-2 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5 min-w-[200px]">
                                    {p.variants.map((v) => (
                                      <div
                                        key={v.id}
                                        className="flex items-center justify-between text-[11px] gap-2 p-1 rounded bg-white"
                                      >
                                        <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                                          {v.size}
                                        </span>
                                        <span className="font-mono text-stone-600">
                                          Rp {v.price.toLocaleString("id-ID")}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() =>
                                              handleUpdateStock(p.id, v.id, v.stock - 1)
                                            }
                                            className="w-4 h-4 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                                          >
                                            -
                                          </button>
                                          <span className="font-bold w-6 text-center">
                                            {v.stock}
                                          </span>
                                          <button
                                            onClick={() =>
                                              handleUpdateStock(p.id, v.id, v.stock + 1)
                                            }
                                            className="w-4 h-4 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-stone-400 text-[11px] italic">
                                Tanpa varian ml (Ukuran Standar)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditProductModal(p)}
                                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                                title="Edit Produk & Varian"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900">Manajemen Kategori</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Kelola kategori produk untuk filter halaman depan website beautyCare.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: "", description: "" });
                  setIsCategoryModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kategori Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-stone-400">/{c.slug}</span>
                      <span className="text-xs font-semibold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200/50">
                        {c._count?.products ?? products.filter((p) => p.categoryId === c.id).length}{" "}
                        produk
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-stone-900 mb-1">{c.name}</h3>
                    <p className="text-xs text-stone-500 line-clamp-2">
                      {c.description || "Tidak ada deskripsi tambahan."}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-stone-100">
                    <button
                      onClick={() => {
                        setEditingCategory(c);
                        setCategoryForm({ name: c.name, description: c.description || "" });
                        setIsCategoryModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS & INVOICES */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  Manajemen Pesanan & Cetak Invoice
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Urus pesanan pelanggan, verifikasi pembayaran, dan cetak invoice resmi dari website.
                </p>
              </div>
            </div>

            {/* Filter controls */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari No. Invoice / Pelanggan..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-500">Bayar:</span>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-white"
                  >
                    <option value="ALL">Semua</option>
                    <option value="PENDING">Menunggu</option>
                    <option value="PAID">Lunas</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-500">Status Pesanan:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-white"
                  >
                    <option value="ALL">Semua</option>
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders list */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center text-stone-400 text-sm">
                  Tidak ditemukan pesanan dengan kriteria pencarian ini.
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all duration-200 p-5"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-stone-100 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-stone-900">
                            {order.invoiceNumber}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-md bg-stone-100 font-semibold text-stone-700">
                            {order.paymentMethod}{" "}
                            {order.paymentChannel ? `(${order.paymentChannel})` : ""}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}/invoice`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Cetak Invoice</span>
                        </Link>
                      </div>
                    </div>

                    <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Customer Info */}
                      <div>
                        <span className="text-stone-400 uppercase font-semibold text-[10px] block mb-1">
                          Data Pelanggan:
                        </span>
                        <p className="font-semibold text-stone-900">{order.customerName}</p>
                        <p className="text-stone-600">{order.customerPhone}</p>
                        <p className="text-stone-500 mt-1 line-clamp-2">
                          Alamat: {order.customerAddress}
                        </p>
                        {order.notes && (
                          <p className="text-stone-400 italic mt-1">Catatan: {order.notes}</p>
                        )}
                      </div>

                      {/* Items Ordered with ML variants */}
                      <div className="md:border-l md:border-stone-100 md:pl-4">
                        <span className="text-stone-400 uppercase font-semibold text-[10px] block mb-1">
                          Daftar Produk:
                        </span>
                        <div className="space-y-1.5">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <div>
                                <span className="font-medium text-stone-800">
                                  {item.product.name}
                                </span>
                                {item.selectedSize && (
                                  <span className="ml-1.5 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px]">
                                    {item.selectedSize}
                                  </span>
                                )}
                                <span className="text-stone-400 ml-1">x{item.quantity}</span>
                              </div>
                              <span className="font-mono text-stone-700">
                                Rp {item.subtotal.toLocaleString("id-ID")}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-stone-100 flex justify-between font-bold text-stone-900">
                          <span>Total:</span>
                          <span className="font-mono text-rose-600">
                            Rp {order.totalAmount.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      {/* Status Management */}
                      <div className="md:border-l md:border-stone-100 md:pl-4 space-y-3">
                        <span className="text-stone-400 uppercase font-semibold text-[10px] block">
                          Ubah Status Live:
                        </span>

                        <div>
                          <label className="text-[11px] text-stone-500 block mb-1">
                            Status Pembayaran:
                          </label>
                          <select
                            value={order.paymentStatus}
                            onChange={(e) =>
                              handleUpdateOrder(order.id, "paymentStatus", e.target.value)
                            }
                            className={`w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border focus:outline-none ${
                              order.paymentStatus === "PAID"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-amber-50 text-amber-800 border-amber-300"
                            }`}
                          >
                            <option value="PENDING">Menunggu Pembayaran (PENDING)</option>
                            <option value="PAID">LUNAS (PAID)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-stone-500 block mb-1">
                            Status Pesanan:
                          </label>
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              handleUpdateOrder(order.id, "orderStatus", e.target.value)
                            }
                            className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-stone-200 bg-white"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING (Dikemas)</option>
                            <option value="SHIPPED">SHIPPED (Dikirim)</option>
                            <option value="COMPLETED">COMPLETED (Selesai)</option>
                            <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: PRODUCT (ADD / EDIT) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="flex justify-between items-center pb-4 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">
                {editingProduct ? "Edit Produk & Varian Ukuran" : "Tambah Produk Baru"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Contoh: Hydrating Ceramide Essence"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) =>
                      setProductForm({ ...productForm, categoryId: parseInt(e.target.value, 10) })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Harga Dasar (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">URL Gambar Produk</label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Deskripsi Produk</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Jelaskan manfaat dan cara pemakaian..."
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              {/* Has Variants Toggle */}
              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                  <input
                    type="checkbox"
                    checked={productForm.hasVariants}
                    onChange={(e) =>
                      setProductForm({ ...productForm, hasVariants: e.target.checked })
                    }
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>Produk ini memiliki beberapa varian ukuran (ml)</span>
                </label>
                <p className="text-[11px] text-stone-500 mt-1 ml-6">
                  Jika dicentang, pelanggan dapat memilih ukuran (filter ml) saat klik &quot;Pesan
                  Sekarang&quot;. Jika tidak dicentang, filter ml tidak akan muncul di UI.
                </p>

                {productForm.hasVariants ? (
                  <div className="mt-4 space-y-3">
                    <span className="font-semibold text-stone-700 block">Daftar Ukuran / ml:</span>
                    {productForm.variants.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={v.size}
                          onChange={(e) => {
                            const newV = [...productForm.variants];
                            newV[idx].size = e.target.value;
                            setProductForm({ ...productForm, variants: newV });
                          }}
                          placeholder="30ml"
                          className="w-24 p-2 rounded-lg border border-stone-200 bg-white"
                        />
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => {
                            const newV = [...productForm.variants];
                            newV[idx].price = parseFloat(e.target.value) || 0;
                            setProductForm({ ...productForm, variants: newV });
                          }}
                          placeholder="Harga (Rp)"
                          className="w-32 p-2 rounded-lg border border-stone-200 bg-white"
                        />
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => {
                            const newV = [...productForm.variants];
                            newV[idx].stock = parseInt(e.target.value, 10) || 0;
                            setProductForm({ ...productForm, variants: newV });
                          }}
                          placeholder="Stok"
                          className="w-24 p-2 rounded-lg border border-stone-200 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newV = productForm.variants.filter((_, i) => i !== idx);
                            setProductForm({ ...productForm, variants: newV });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setProductForm({
                          ...productForm,
                          variants: [
                            ...productForm.variants,
                            { size: "100ml", price: productForm.price * 2, stock: 10 },
                          ],
                        })
                      }
                      className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 mt-2 cursor-pointer"
                    >
                      + Tambah Baris Ukuran (ml)
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <label className="block font-semibold text-stone-700 mb-1">
                      Jumlah Stok Produk
                    </label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-40 p-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition cursor-pointer"
                >
                  {loadingAction ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORY (ADD / EDIT) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
            <div className="flex justify-between items-center pb-4 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">
                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Contoh: Body Treatment"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Deskripsi</label>
                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat kategori produk..."
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold transition cursor-pointer"
                >
                  {loadingAction ? "Menyimpan..." : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
