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
