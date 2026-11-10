import { CartItem } from "@/app/types/storefront";

export const CART_STORAGE_KEY = "beautycare_cart";

export const subscribeCart = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("beautycare-cart-updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("beautycare-cart-updated", callback);
  };
};

export const getCartSnapshot = (): string => {
  if (typeof window === "undefined") return "[]";
  try {
    return localStorage.getItem(CART_STORAGE_KEY) || "[]";
  } catch {
    return "[]";
  }
};

export const getCartServerSnapshot = (): string => "[]";

export const getStoredCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredCart = (items: CartItem[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("beautycare-cart-updated"));
  } catch (e) {
    console.error("Failed to save cart to localStorage", e);
  }
};

export const formatRupiah = (num: number): string => {
  return "Rp " + Math.round(num).toLocaleString("id-ID");
};
