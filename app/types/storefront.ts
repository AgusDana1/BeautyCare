export interface Variant {
  id: number;
  productId: number;
  size: string;
  sizeValue: number | null;
  price: number;
  stock: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface Review {
  id: number;
  productId: number;
  reviewerName: string;
  rating: number;
  comment: string;
  userLocation: string | null;
  userAvatar: string | null;
  mediaUrl: string | null;
  mediaType: string | null; // "image" or "video"
  selectedVariant: string | null;
  helpfulCount: number;
  createdAt: string | Date;
}

export interface Product {
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
  reviews?: Review[];
  sellerName?: string;
  sellerBadge?: string;
  sellerRating?: string;
  sellerCity?: string;
  sellerResponse?: string;
}

export interface CartItem {
  productId: number;
  productName: string;
  productImage: string | null;
  variantId: number | null;
  selectedSize: string | null;
  price: number;
  quantity: number;
}

export interface HeroSlide {
  id: number;
  image: string;
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  targetCategory: string;
  statBadge: string;
  statSub: string;
}

export type PaymentMethod = "QRIS" | "BANK_TRANSFER" | "E_WALLET";

export interface OrderCustomerInfo {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface CustomerLoyalty {
  id: number;
  phone: string;
  name: string | null;
  email: string | null;
  points: number;
  tier: "SILVER" | "GOLD" | "PLATINUM";
  totalSpent: number;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string;
  readTimeMinutes: number;
  publishedAt: string | Date;
}
