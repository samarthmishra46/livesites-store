"use client";

import { useCallback, useMemo } from "react";
import { getProductById, products } from "@/data/products";
import type { CartLine } from "@/types";
import { createStore, useStore } from "./createStore";

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

const isCartLines = (v: unknown): v is CartLine[] =>
  Array.isArray(v) &&
  v.every(
    (l) =>
      l && typeof l === "object" &&
      typeof (l as CartLine).productId === "string" &&
      typeof (l as CartLine).colorId === "string" &&
      typeof (l as CartLine).size === "string" &&
      typeof (l as CartLine).quantity === "number",
  );

/** A first visit starts with the two pieces shown in the reference bag. */
const seedCart: CartLine[] = [
  { productId: "p-linen-blazer", colorId: "oat", size: "S", quantity: 1 },
  { productId: "p-silk-slip-dress", colorId: "ivory", size: "S", quantity: 1 },
];

export const wishlistStore = createStore<string[]>([], {
  persistKey: "livesites:wishlist",
  parse: (v) => (isStringArray(v) ? v.filter((id) => getProductById(id)) : null),
});

export const cartStore = createStore<CartLine[]>(seedCart, {
  persistKey: "livesites:cart",
  parse: (v) => (isCartLines(v) ? v.filter((l) => getProductById(l.productId) && l.quantity > 0) : null),
});

/** Colour chosen per product (shared by cards and product pages). */
export const colorSelectionStore = createStore<Record<string, string>>({}, {
  persistKey: "livesites:colors",
  parse: (v) => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, string>) : null),
});

interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  searchQuery: string;
  menuOpen: boolean;
  toast: { id: number; message: string } | null;
}

export const uiStore = createStore<UIState>({
  cartOpen: false,
  searchOpen: false,
  searchQuery: "",
  menuOpen: false,
  toast: null,
});

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const ui = {
  openCart: () => uiStore.set((s) => ({ ...s, cartOpen: true, searchOpen: false, menuOpen: false })),
  closeCart: () => uiStore.set((s) => ({ ...s, cartOpen: false })),
  openSearch: (query = "") =>
    uiStore.set((s) => ({ ...s, searchOpen: true, searchQuery: query, cartOpen: false, menuOpen: false })),
  closeSearch: () => uiStore.set((s) => ({ ...s, searchOpen: false })),
  setSearchQuery: (searchQuery: string) => uiStore.set((s) => ({ ...s, searchQuery })),
  openMenu: () => uiStore.set((s) => ({ ...s, menuOpen: true, cartOpen: false, searchOpen: false })),
  closeMenu: () => uiStore.set((s) => ({ ...s, menuOpen: false })),
  toast: (message: string) => {
    clearTimeout(toastTimer);
    uiStore.set((s) => ({ ...s, toast: { id: Date.now(), message } }));
    toastTimer = setTimeout(() => uiStore.set((s) => ({ ...s, toast: null })), 2600);
  },
};

export const wishlist = {
  has: (id: string) => wishlistStore.get().includes(id),
  add: (id: string) => wishlistStore.set((ids) => (ids.includes(id) ? ids : [...ids, id])),
  remove: (id: string) => wishlistStore.set((ids) => ids.filter((x) => x !== id)),
  toggle: (id: string) => {
    const had = wishlist.has(id);
    if (had) wishlist.remove(id);
    else wishlist.add(id);
    return !had;
  },
};

export const cart = {
  add: (productId: string, opts: { colorId?: string; size?: string; quantity?: number } = {}) => {
    const product = getProductById(productId);
    if (!product) return;
    const colorId = opts.colorId ?? colorSelectionStore.get()[productId] ?? product.colors[0].id;
    const size = opts.size ?? (product.sizes.length === 1 ? product.sizes[0] : product.sizes[Math.min(1, product.sizes.length - 1)]);
    const quantity = opts.quantity ?? 1;
    cartStore.set((lines) => {
      const i = lines.findIndex((l) => l.productId === productId && l.colorId === colorId && l.size === size);
      if (i === -1) return [...lines, { productId, colorId, size, quantity }];
      return lines.map((l, j) => (j === i ? { ...l, quantity: Math.min(l.quantity + quantity, 9) } : l));
    });
  },
  setQuantity: (index: number, quantity: number) =>
    cartStore.set((lines) =>
      quantity <= 0 ? lines.filter((_, i) => i !== index) : lines.map((l, i) => (i === index ? { ...l, quantity: Math.min(quantity, 9) } : l)),
    ),
  removeLine: (index: number) => cartStore.set((lines) => lines.filter((_, i) => i !== index)),
  removeProduct: (productId: string) => cartStore.set((lines) => lines.filter((l) => l.productId !== productId)),
};

export function useWishlist() {
  const ids = useStore(wishlistStore);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  return { ids, has, count: ids.length, toggle: wishlist.toggle, add: wishlist.add, remove: wishlist.remove };
}

export function useCart() {
  const lines = useStore(cartStore);
  return useMemo(() => {
    const items = lines
      .map((line) => ({ line, product: getProductById(line.productId)! }))
      .filter((x) => x.product);
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = items.reduce((sum, { line, product }) => sum + product.price * line.quantity, 0);
    return { lines, items, count, subtotal };
  }, [lines]);
}

export function useSelectedColor(productId: string) {
  const selections = useStore(colorSelectionStore);
  const product = products.find((p) => p.id === productId);
  const colorId = selections[productId] ?? product?.colors[0]?.id ?? "";
  const setColor = useCallback(
    (id: string) => colorSelectionStore.set((s) => ({ ...s, [productId]: id })),
    [productId],
  );
  return [colorId, setColor] as const;
}

export function useUI() {
  return useStore(uiStore);
}
